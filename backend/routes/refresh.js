import express from 'express';
import refreshTokenController from '../controllers/refreshTokenController.js';
import { refreshLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token. Token can be provided in request body (for React Native clients without cookies).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to exchange for new access token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Token refreshed successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: Rotated refresh token - replaces the one that was presented. The old one is single-use and no longer valid.
 *       401:
 *         description: Refresh token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid, reused, or expired refresh token - client should clear local tokens and prompt login again
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many refresh attempts
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', refreshLimiter, refreshTokenController);

export default router;
