import express from 'express';
import registerController from '../controllers/registerController.js';

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

export default router;
