import ReportReelSchema from '../validation/ReportReelSchema.js';
import reelModel from '../models/reelModel.js';
import {
  CDN_PREFIXES,
  deleteObject,
  isOwnedObjectUrl,
} from '../utils/cdn.js';

const reelController = {

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
