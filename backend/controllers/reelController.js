import fs from 'fs/promises';
import path from 'path';
import CreateReelSchema from '../validation/CreateReelSchema.js';
import ReportReelSchema from '../validation/ReportReelSchema.js';
import reelModel from '../models/reelModel.js';
import { generateReelThumbnail } from '../utils/generateReelThumbnail.js';
import { REEL_UPLOAD_DIR } from '../middleware/uploadReelVideo.js';

const buildStaticUrl = (userId, filename) =>
  `http://localhost:3500/static/uploads/reels/${userId}/${filename}`;

// Video/thumbnail are stored on disk under a per-user folder, keyed by
// filename only (buildStaticUrl's path) - not by DB rows, so they have to
// be removed by hand once the reel row is gone.
const deleteReelFiles = async (userId, { url, thumbnail_url }) => {
  const filenames = [url, thumbnail_url].filter(Boolean).map((fileUrl) => path.basename(fileUrl));
  await Promise.all(
    filenames.map((filename) =>
      fs.unlink(path.join(REEL_UPLOAD_DIR, String(userId), filename)).catch(() => {})
    )
  );
};

const reelController = {
  // Creates a reel + its dialogue + subtitle sentences (with ms-precise
  // timing) + optional per-line translations in one transaction. The video
  // (and optional thumbnail) file is already saved to disk by the
  // uploadReelVideo middleware before this handler runs - every non-success
  // path below (validation failure or unexpected error) falls through to the
  // single catch block so those files are always deleted rather than left as
  // orphans with no matching DB row.
  async createReel(req, res) {
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    // Set once a thumbnail is generated server-side, so the catch block
    // knows to clean it up too (it isn't one of multer's uploaded files).
    let generatedThumbnailPath = null;

    try {
      if (!videoFile) {
        throw { status: 400, message: 'A video file is required' };
      }

      let parsedLines;
      try {
        parsedLines = JSON.parse(req.body.lines || '[]');
      } catch {
        throw { status: 400, message: 'lines must be valid JSON' };
      }

      const { error, value } = CreateReelSchema.validate({
        title: req.body.title,
        language_id: Number(req.body.language_id),
        duration: Number(req.body.duration),
        lines: parsedLines,
      });

      if (error) {
        throw { status: 400, message: error.details[0].message };
      }

      const url = buildStaticUrl(req.user.id, videoFile.filename);

      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = buildStaticUrl(req.user.id, thumbnailFile.filename);
      } else {
        // Best-effort - a thumbnail-extraction failure (e.g. an unusual
        // codec) shouldn't block publishing a reel that otherwise succeeded.
        try {
          generatedThumbnailPath = await generateReelThumbnail(videoFile.path);
          thumbnailUrl = buildStaticUrl(req.user.id, path.basename(generatedThumbnailPath));
        } catch (thumbnailError) {
          console.error('Reel thumbnail generation failed, publishing without one:', thumbnailError);
          generatedThumbnailPath = null;
        }
      }

      const reel = await reelModel.createWithDialogue({
        createdBy: req.user.id,
        url,
        thumbnailUrl,
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
      if (videoFile?.path) {
        await fs.unlink(videoFile.path).catch(() => {});
      }
      if (thumbnailFile?.path) {
        await fs.unlink(thumbnailFile.path).catch(() => {});
      }
      if (generatedThumbnailPath) {
        await fs.unlink(generatedThumbnailPath).catch(() => {});
      }

      if (error?.status) {
        return res.status(error.status).json({ message: error.message });
      }

      console.error('Create reel error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Permanently deletes one of the current user's own reels. The DB trigger
  // trigger_delete_dialogue_after_reel_delete cascades the dialogue and its
  // dialogue_sentences; only the on-disk video/thumbnail need cleanup here.
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

      await deleteReelFiles(req.user.id, deletedReel);

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
