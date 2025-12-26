import express from 'express';
import refreshTokenController from '../controllers/refreshTokenController.js';

const router = express.Router();

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token (from cookie or request body)
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (for React Native clients)
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or missing refresh token
 *       403:
 *         description: Token verification failed
 */
router.post('/', refreshTokenController);

export default router;
