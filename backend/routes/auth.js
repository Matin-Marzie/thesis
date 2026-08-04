import express from 'express';
import authController from '../controllers/authController.js';
import googleAuthController from '../controllers/googleAuthController.js';
import forgotPasswordController from '../controllers/forgotPasswordController.js';
import verifyResetCodeController from '../controllers/verifyResetCodeController.js';
import resetPasswordController from '../controllers/resetPasswordController.js';
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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     description: Generates a 6-digit code, stores it hashed server-side, and emails it to the given address. Always returns the same generic response regardless of whether the email is registered (to prevent account enumeration) - if the email isn't registered, or belongs to a Google-only account, a different notice email is sent instead of a code. Enforces a 60s resend cooldown per email.
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
 *         description: Generic confirmation (does not imply the email is registered)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'If that email is registered, a password reset code has been sent'
 *       400:
 *         description: Validation error
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
router.post('/forgot-password', forgotPasswordController);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verify a password reset code without resetting the password
 *     description: Checks the 6-digit code for the given email against the pending reset request. Lets the client confirm the code before asking for a new password. Does not consume the code - /auth/reset-password still re-verifies it as the real, single-use gate before changing anything.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-digit code sent to the email
 *     responses:
 *       200:
 *         description: Code is correct
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Code verified'
 *       400:
 *         description: Validation error, incorrect/expired code, or no pending request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many incorrect attempts
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
router.post('/verify-reset-code', verifyResetCodeController);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a code from /auth/forgot-password
 *     description: Verifies the 6-digit code for the given email and sets a new password. On success, invalidates any existing refresh token (logs out other sessions). Does not issue new tokens - the client should redirect to login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, new_password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-digit code sent to the email
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Password reset successful. Please log in with your new password.'
 *       400:
 *         description: Validation error, incorrect/expired code, or Google-only account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many incorrect attempts
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
router.post('/reset-password', resetPasswordController);

export default router;
