import express from 'express';
import reelController from '../../controllers/reelController.js';
import verifyJWT from '../../middleware/verifyJWT.js';
import uploadReelVideo from '../../middleware/uploadReelVideo.js';

const router = express.Router();

/**
 * @swagger
 * /reel:
 *   post:
 *     summary: Create and publish a new reel with synced subtitles
 *     description: Uploads a video file and creates the reel + dialogue + subtitle sentences (with millisecond-precise timing) + optional per-line translations in one transaction.
 *     tags: [Reel]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [video, language_id, duration, lines]
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional cover image. When omitted, the server extracts one from the video's first frame.
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language_id:
 *                 type: integer
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds
 *               lines:
 *                 type: string
 *                 description: JSON-stringified array of subtitle lines
 *     responses:
 *       201:
 *         description: Reel published successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyJWT, uploadReelVideo, reelController.createReel);

/**
 * @swagger
 * /reel/{id}:
 *   delete:
 *     summary: Delete one of the current user's reels
 *     description: Permanently deletes the reel (and its dialogue/subtitles via a DB cascade) and removes its video/thumbnail files. Only the reel's owner may delete it.
 *     tags: [Reel]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *       400:
 *         description: Invalid reel id
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Reel not found (or not owned by the current user)
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyJWT, reelController.deleteReel);

export default router;
