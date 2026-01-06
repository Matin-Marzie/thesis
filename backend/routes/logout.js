import express from 'express';
import logoutController from '../controllers/logoutController.js';

const router = express.Router();

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     description: Clear refresh token from database. Refresh token can be provided in request body.
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
 *                 description: Refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Logout successful'
 *       204:
 *         description: No refresh token provided
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', logoutController);

export default router;
