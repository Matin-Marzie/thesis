import express from 'express';
import lettersController from '../../controllers/lettersController.js';
import { lettersLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /letters/{language_code}:
 *   get:
 *     summary: Get letters for a language
 *     description: Retrieve all letters of a language's alphabet. No authentication required.
 *     tags: [Letters]
 *     parameters:
 *       - in: path
 *         name: language_code
 *         required: true
 *         schema:
 *           type: string
 *           example: 'en'
 *         description: Language code (e.g., en, el, fa)
 *     responses:
 *       200:
 *         description: Letters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LettersResponse'
 *       400:
 *         description: Invalid language code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LettersError'
 *       500:
 *         description: Failed to fetch letters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LettersError'
 */
router.get('/:language_code', lettersLimiter, lettersController.getLanguageLetters);

export default router;
