import express from 'express';
import dictionaryController from '../../controllers/dictionaryController.js';

const router = express.Router();

// No authentication required

router.get('/:language_code', dictionaryController.getLanguageDictionary);
router.get('/:language_code/:translation_language_code', dictionaryController.getLanguageDictionaryWithTranslations);

export default router;

