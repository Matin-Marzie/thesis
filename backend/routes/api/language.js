import express from 'express';
import languageController from '../../controllers/languageController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

/**
 * @swagger
 * /language/current:
 *   patch:
 *     summary: Switch the authenticated user's current learning language
 *     description: Marks the given user_languages row as current and returns the refreshed languages list plus the vocabulary scoped to that language.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_languages_id]
 *             properties:
 *               user_languages_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Current language switched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user_progress:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                 user_vocabulary:
 *                   type: object
 *       400:
 *         description: Validation error
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
 *       404:
 *         description: Language not found for this user
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
router.patch('/current', verifyJWT, languageController.switchLanguage);

/**
 * @swagger
 * /language:
 *   post:
 *     summary: Add a new language pair to the authenticated user's account
 *     description: Creates a new user_languages row, makes it current, and auto-seeds vocabulary for words below the given proficiency level. Returns the updated languages list plus the new language's vocabulary.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [native_language_id, learning_language_id, proficiency_level]
 *             properties:
 *               native_language_id:
 *                 type: integer
 *               learning_language_id:
 *                 type: integer
 *               proficiency_level:
 *                 type: string
 *                 enum: [N, A1, A2, B1, B2, C1, C2, EX]
 *     responses:
 *       201:
 *         description: Language added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user_progress:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                 user_vocabulary:
 *                   type: object
 *       400:
 *         description: Validation error
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
 *         description: User is already learning this language pair
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
router.post('/', verifyJWT, languageController.addLanguage);

/**
 * @swagger
 * /language/{id}:
 *   delete:
 *     summary: Remove a language pair from the authenticated user's account
 *     description: Deletes the user_languages row (cascades to that language's vocabulary). A user must always have at least one language. If the deleted language was current, another remaining language is promoted to current and its vocabulary is returned.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: user_languages row id to delete
 *     responses:
 *       200:
 *         description: Language deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user_progress:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                 user_vocabulary:
 *                   type: object
 *                   description: Only present when the deleted language was current
 *       400:
 *         description: Invalid id, or this is the user's only language
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
 *       404:
 *         description: Language not found for this user
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
router.delete('/:id', verifyJWT, languageController.deleteLanguage);

export default router;
