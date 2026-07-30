import express from 'express';
import registerController from '../controllers/registerController.js';
import emailVerificationCodeController from '../controllers/emailVerificationCodeController.js';

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with profile, progress, and optional vocabulary data. Returns user profile, progress, vocabulary, and tokens.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User registered successfully'
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
 *                   description: Refresh token for obtaining new access tokens
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already in use
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
router.post('/', registerController);

/**
 * @swagger
 * /register/send-code:
 *   post:
 *     summary: Send a 6-digit email verification code
 *     description: Generates a 6-digit code, signs it into a short-lived JWT, emails the code, and returns the JWT as verification_token (the raw code is never returned). Enforces a 60s resend cooldown per email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Code sent
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 *       429:
 *         description: Resend cooldown in effect
 *       500:
 *         description: Server error
 */
router.post('/send-code', emailVerificationCodeController);

export default router;
