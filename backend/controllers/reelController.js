import CreateReelSchema from '../validation/CreateReelSchema.js';
import ReportReelSchema from '../validation/ReportReelSchema.js';
import reelModel from '../models/reelModel.js';
import {
  CDN_PREFIXES,
  createObjectKey,
  deleteObject,
  headObject,
  isOwnedObjectUrl,
  presignUpload,
  publicObjectUrl,
} from '../utils/cdn.js';

const validVideoType = (type) => typeof type === 'string' && type.startsWith('video/');
const validImageType = (type) => typeof type === 'string' && type.startsWith('image/');
const ownedKey = (key, prefix, userId) => typeof key === 'string' && key.startsWith(`${prefix}/${userId}/`) && !key.includes('..');

const reelController = {

  // Presign direct upload URLs for a new reel's video and thumbnail. The client must then upload the files directly to the CDN before calling createReel.
  async presignUploads(req, res) {
    const { video, thumbnail } = req.body || {};
    if (!video || !validVideoType(video.contentType) || Number(video.size) > 100 * 1024 * 1024) {
      return res.status(400).json({ message: 'A valid video under 100MB is required' });
    }
    if (thumbnail && (!validImageType(thumbnail.contentType) || Number(thumbnail.size) > 100 * 1024 * 1024)) {
      return res.status(400).json({ message: 'Invalid thumbnail' });
    }

    // Keys are generated server-side; the client receives upload permission only for these objects.
    const videoKey = createObjectKey(CDN_PREFIXES.reels, req.user.id, video.fileName);
    const thumbnailKey = thumbnail ? createObjectKey(CDN_PREFIXES.reels, req.user.id, thumbnail.fileName) : null;
    return res.status(200).json({
      video: { key: videoKey, url: await presignUpload({ key: videoKey, contentType: video.contentType }) },
      thumbnail: thumbnailKey ? { key: thumbnailKey, url: await presignUpload({ key: thumbnailKey, contentType: thumbnail.contentType }) } : null,
    });
  },

  async createReel(req, res) {
    try {
      const { videoKey, thumbnailKey, title, language_id, duration, lines = [] } = req.body || {};
      if (!ownedKey(videoKey, CDN_PREFIXES.reels, req.user.id)) throw { status: 400, message: 'A valid uploaded video is required' };
      if (thumbnailKey && !ownedKey(thumbnailKey, CDN_PREFIXES.reels, req.user.id)) throw { status: 400, message: 'Invalid uploaded thumbnail' };
      // Do not persist media URLs until R2 confirms both objects exist.
      await headObject(videoKey);
      if (thumbnailKey) await headObject(thumbnailKey);

      const { error, value } = CreateReelSchema.validate({
        title,
        language_id: Number(language_id),
        duration: Number(duration),
        lines,
      });

      if (error) {
        throw { status: 400, message: error.details[0].message };
      }

      const reel = await reelModel.createWithDialogue({
        createdBy: req.user.id,
        url: publicObjectUrl(videoKey),
        thumbnailUrl: thumbnailKey ? publicObjectUrl(thumbnailKey) : null,
        title: value.title,
        languageId: value.language_id,
        duration: value.duration,
        lines: value.lines,
      });

      res.status(201).json({
        message: 'Reel published successfully',
        reel,
      });
    } catch (error) {
      if (error?.status) {
        return res.status(error.status).json({ message: error.message });
      }

      console.error('Create reel error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete the database row and its owned R2 objects.
  async deleteReel(req, res) {
    try {
      const reelId = Number(req.params.id);
      if (!Number.isInteger(reelId)) {
        return res.status(400).json({ message: 'Invalid reel id' });
      }

      const deletedReel = await reelModel.delete(reelId, req.user.id);

      if (!deletedReel) {
        return res.status(404).json({ message: 'Reel not found' });
      }

      const urls = [deletedReel.url, deletedReel.thumbnail_url];
      await Promise.all(urls.map((url) => {
        if (!isOwnedObjectUrl(url, CDN_PREFIXES.reels, req.user.id)) return null;
        return deleteObject(new URL(url).pathname.slice(1));
      }));

      res.status(200).json({ message: 'Reel deleted successfully' });
    } catch (error) {
      console.error('Delete reel error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Records the current user's report against a reel (any reel, not just
  // others' - reporting is per (reel, user), enforced by reel_reports'
  // unique constraint). Re-reporting just refreshes the reason/timestamp.
  async reportReel(req, res) {
    try {
      const reelId = Number(req.params.id);
      if (!Number.isInteger(reelId)) {
        return res.status(400).json({ message: 'Invalid reel id' });
      }

      const { error, value } = ReportReelSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      await reelModel.report(reelId, req.user.id, value.reason);

      res.status(200).json({ message: 'Reel reported successfully' });
    } catch (error) {
      if (error?.code === '23503') {
        return res.status(404).json({ message: 'Reel not found' });
      }

      console.error('Report reel error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Toggles the current user's like on a reel (any reel, not just others' -
  // liking is per (reel, user), enforced by reel_interactions' unique
  // constraint). Returns the resulting state and the reel's fresh total like
  // count so the client can reconcile its optimistic update in one round trip.
  async toggleLike(req, res) {
    try {
      const reelId = Number(req.params.id);
      if (!Number.isInteger(reelId)) {
        return res.status(400).json({ message: 'Invalid reel id' });
      }

      const { isLiked, likesCount } = await reelModel.toggleLike(reelId, req.user.id);

      res.status(200).json({ is_liked: isLiked, likes_count: likesCount });
    } catch (error) {
      if (error?.code === '23503') {
        return res.status(404).json({ message: 'Reel not found' });
      }

      console.error('Toggle reel like error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Toggles the current user's save (bookmark) on a reel.
  async toggleSave(req, res) {
    try {
      const reelId = Number(req.params.id);
      if (!Number.isInteger(reelId)) {
        return res.status(400).json({ message: 'Invalid reel id' });
      }

      const { isSaved } = await reelModel.toggleSave(reelId, req.user.id);

      res.status(200).json({ is_saved: isSaved });
    } catch (error) {
      if (error?.code === '23503') {
        return res.status(404).json({ message: 'Reel not found' });
      }

      console.error('Toggle reel save error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default reelController;
