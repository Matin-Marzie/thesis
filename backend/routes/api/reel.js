import express from 'express';
import reelController from '../../controllers/reelController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// POST /uploads/presign and POST / (create-and-publish) moved to
// reels-service (Python/FastAPI) - see reels-service/app/routers/reel_creation.py.
// The Node backend keeps ownership of delete/report/like/save below.

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

/**
 * @swagger
 * /reel/{id}/report:
 *   post:
 *     summary: Report a reel
 *     description: Records the current user's report against a reel for moderation review. Reporting the same reel again replaces the previous reason/timestamp instead of creating a duplicate.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [spam, nudity_or_sexual_content, violence_or_dangerous_content, hate_speech_or_symbols, harassment_or_bullying, false_information, other]
 *     responses:
 *       200:
 *         description: Reel reported successfully
 *       400:
 *         description: Invalid reel id or reason
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/report', verifyJWT, reelController.reportReel);

/**
 * @swagger
 * /reel/{id}/like:
 *   post:
 *     summary: Toggle like on a reel
 *     description: Likes the reel if the current user hasn't liked it yet, otherwise unlikes it. Returns the resulting state and the reel's fresh total like count.
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
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 is_liked:
 *                   type: boolean
 *                 likes_count:
 *                   type: integer
 *       400:
 *         description: Invalid reel id
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/like', verifyJWT, reelController.toggleLike);

/**
 * @swagger
 * /reel/{id}/save:
 *   post:
 *     summary: Toggle save (bookmark) on a reel
 *     description: Saves the reel if the current user hasn't saved it yet, otherwise unsaves it.
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
 *         description: Save toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 is_saved:
 *                   type: boolean
 *       400:
 *         description: Invalid reel id
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/save', verifyJWT, reelController.toggleSave);

export default router;
