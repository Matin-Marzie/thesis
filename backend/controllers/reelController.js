import fs from 'fs/promises';
import CreateReelSchema from '../validation/CreateReelSchema.js';
import reelModel from '../models/reelModel.js';

const reelController = {
  // Creates a reel + its dialogue + subtitle sentences (with ms-precise
  // timing) + optional per-line translations in one transaction. The video
  // file itself is already saved to disk by the uploadReelVideo middleware
  // before this handler runs - every non-success path below (validation
  // failure or unexpected error) falls through to the single catch block so
  // that file is always deleted rather than left as an orphan with no
  // matching DB row.
  async createReel(req, res) {
    const uploadedFilePath = req.file?.path;

    try {
      if (!req.file) {
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
        description: req.body.description,
        language_id: Number(req.body.language_id),
        duration: Number(req.body.duration),
        lines: parsedLines,
      });

      if (error) {
        throw { status: 400, message: error.details[0].message };
      }

      const url = `http://localhost:3500/static/uploads/reels/${req.user.id}/${req.file.filename}`;

      const reel = await reelModel.createWithDialogue({
        createdBy: req.user.id,
        url,
        title: value.title,
        description: value.description,
        languageId: value.language_id,
        duration: value.duration,
        lines: value.lines,
      });

      res.status(201).json({
        message: 'Reel published successfully',
        reel,
      });
    } catch (error) {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => {});
      }

      if (error?.status) {
        return res.status(error.status).json({ message: error.message });
      }

      console.error('Create reel error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default reelController;
