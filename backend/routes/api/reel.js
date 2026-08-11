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

export default router;
