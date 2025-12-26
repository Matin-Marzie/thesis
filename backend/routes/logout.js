import express from 'express';
import logoutController from '../controllers/logoutController.js';

const router = express.Router();

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     description: Clear refresh token cookie and invalidate session
 *     tags: [Authentication]
 *     responses:
 *       204:
 *         description: Logout successful (no content)
 *       500:
 *         description: Server error
 */
router.post('/', logoutController);

export default router;
