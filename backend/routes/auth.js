import express from 'express';
import authController from '../controllers/authController.js';
import googleAuthController from '../controllers/googleAuthController.js';
import verifyGoogleToken from '../middleware/verifyGoogleToken.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with username/email and password
 *     description: Authenticate user with either username or email and password. Returns access token and refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or register with Google OAuth
 *     description: Authenticate with Google ID token. Creates new account if user doesn't exist.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid token or missing language IDs for new users
 *       500:
 *         description: Server error
 */
router.post('/google', verifyGoogleToken, googleAuthController);

export default router;
