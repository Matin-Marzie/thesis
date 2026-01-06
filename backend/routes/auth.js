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
 *     description: Authenticate user with either username or email and password. Returns user profile, progress, vocabulary, and tokens.
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Login successful'
 *                 user_profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 user_progress:
 *                   $ref: '#/components/schemas/UserProgress'
 *                 user_vocabulary:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserVocabulary'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token
 *       400:
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials or please login with Google
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or register with Google OAuth
 *     description: Authenticate with Google ID token. Creates new account if user doesn't exist. Returns user profile, progress, vocabulary, and tokens.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Google authentication successful'
 *                 user_profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 user_progress:
 *                   $ref: '#/components/schemas/UserProgress'
 *                 user_vocabulary:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserVocabulary'
 *                 idToken:
 *                   type: string
 *                   description: Google ID token
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token
 *       400:
 *         description: Invalid token or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists with different account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/google', verifyGoogleToken, googleAuthController);

export default router;
