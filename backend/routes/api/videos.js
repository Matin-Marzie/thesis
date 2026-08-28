import express from 'express';
import videosController from '../../controllers/videosController.js';
import { videosLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /videos/{language_code}:
 *   get:
 *     summary: Get the curated video collection for a learning language
 *     description: Retrieve the app's curated list of YouTube videos for a given learning language. No authentication required.
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: language_code
 *         required: true
 *         schema:
 *           type: string
 *           example: 'fa'
 *         description: Learning language code (e.g., en, el, fa)
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideosResponse'
 *       400:
 *         description: Invalid language code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideosError'
 *       500:
 *         description: Failed to fetch videos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideosError'
 */
router.get('/:language_code', videosLimiter, videosController.getVideos);

export default router;
