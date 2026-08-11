import fs from 'fs/promises';
import path from 'path';
import CreateReelSchema from '../validation/CreateReelSchema.js';
import reelModel from '../models/reelModel.js';
import { generateReelThumbnail } from '../utils/generateReelThumbnail.js';

const buildStaticUrl = (userId, filename) =>
  `http://localhost:3500/static/uploads/reels/${userId}/${filename}`;

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
        description: req.body.description,
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
};

export default reelController;
