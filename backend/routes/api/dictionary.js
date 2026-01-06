import express from 'express';
import dictionaryController from '../../controllers/dictionaryController.js';

const router = express.Router();

/**
 * @swagger
 * /dictionary/{language_code}:
 *   get:
 *     summary: Get dictionary for a language
 *     description: Retrieve all words and definitions for a specific language. No authentication required.
 *     tags: [Dictionary]
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
 *         description: Dictionary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 language_code:
 *                   type: string
 *                   example: 'en'
 *                 words:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Word'
 *       400:
 *         description: Invalid language code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DictionaryError'
 *       500:
 *         description: Failed to fetch dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DictionaryError'
 */
router.get('/:language_code', dictionaryController.getLanguageDictionary);

/**
 * @swagger
 * /dictionary/{language_code}/{translation_language_code}:
 *   get:
 *     summary: Get dictionary with translations
 *     description: Retrieve words from one language with translations to another language. If both language codes are the same, returns the same as single language endpoint. No authentication required.
 *     tags: [Dictionary]
 *     parameters:
 *       - in: path
 *         name: language_code
 *         required: true
 *         schema:
 *           type: string
 *           example: 'en'
 *         description: Source language code (e.g., en, el, fa)
 *       - in: path
 *         name: translation_language_code
 *         required: true
 *         schema:
 *           type: string
 *           example: 'el'
 *         description: Translation language code (e.g., en, el, fa)
 *     responses:
 *       200:
 *         description: Dictionary with translations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DictionaryResponse'
 *       400:
 *         description: Invalid language code format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DictionaryError'
 *       500:
 *         description: Failed to fetch dictionary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DictionaryError'
 */
router.get('/:language_code/:translation_language_code', dictionaryController.getLanguageDictionaryWithTranslations);

export default router;
