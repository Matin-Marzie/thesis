import express from 'express';
import userController from '../../controllers/userController.js';
import syncController from '../../controllers/syncController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user's profile and progress
 *     description: Retrieve authenticated user's profile, progress (energy, coins, languages), and learned vocabulary for current language
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile and progress fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileProgressResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', verifyJWT, userController.getUserProfileProgress);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieve public profile information for a user by their ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: Update current user's profile
 *     description: Update user profile information (username, email, language preferences)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Profile updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data or no valid fields to update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Username already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/profile', verifyJWT, userController.updateProfile);


/**
 * @swagger
 * /user/sync:
 *   post:
 *     summary: Sync user progress and vocabulary changes
 *     description: Synchronize frontend data with backend including user progress (energy, coins) and vocabulary changes (inserts, updates, deletes)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_progress:
 *                 type: object
 *                 properties:
 *                   energy:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 100
 *                   coins:
 *                     type: integer
 *                     minimum: 0
 *                   current_user_languages_id:
 *                     type: integer
 *               vocabulary_changes:
 *                 type: object
 *                 properties:
 *                   inserts:
 *                     type: object
 *                   updates:
 *                     type: object
 *                   deletes:
 *                     type: object
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/sync', verifyJWT, syncController.sync);

export default router;

