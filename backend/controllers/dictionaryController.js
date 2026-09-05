import LanguageSchema from '../validation/LanguageSchema.js';
import dictionaryModel from '../models/dictionaryModel.js';
import { toColumnar } from '../utils/columnar.js';

// Must match the SELECT column order in dictionaryModel.js's respective queries.
const WORD_COLUMNS = ['id', 'written_form', 'part_of_speech', 'level'];
const WORD_WITH_TRANSLATIONS_COLUMNS = [
  'id', 'level', 'written_form', 'translations', 'part_of_speech', 'translation_levels',
];

const dictionaryController = {
  async getLanguageDictionary(req, res) {
    try {
      const { language_code } = req.params;

      // Validate param
      const { error } = LanguageSchema.validate({ code: language_code });

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const [language_id, words] = await Promise.all([
        dictionaryModel.getLanguageIdByCode(language_code),
        dictionaryModel.getWordsByLanguageCode(language_code),
      ]);

      res.json({
        language_code: language_code,
        language_id,
        words: toColumnar(words, WORD_COLUMNS),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch dictionary' });
    }
  },

  async getLanguageDictionaryWithTranslations(req, res) {
    try {
      const { language_code, translation_language_code } = req.params;

      // Validate params
      const { error } = LanguageSchema.validate({
        code: language_code,
      });

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const { error: translationError } = LanguageSchema.validate({
        code: translation_language_code,
      });

      if (translationError) {
        return res.status(400).json({
          message: translationError.details[0].message,
        });
      }

      const sameLanguage = language_code === translation_language_code;

      const [language_id, translation_language_id, words] = await Promise.all([
        dictionaryModel.getLanguageIdByCode(language_code),
        dictionaryModel.getLanguageIdByCode(translation_language_code),
        sameLanguage
          ? dictionaryModel.getWordsByLanguageCode(language_code)
          : dictionaryModel.getWordsWithTranslations_byLanguageCodes(
            language_code,
            translation_language_code
          ),
      ]);

      res.json({
        language_code: language_code,
        language_id,
        translation_language_code: translation_language_code,
        translation_language_id,
        words: toColumnar(words, sameLanguage ? WORD_COLUMNS : WORD_WITH_TRANSLATIONS_COLUMNS),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch dictionary' });
    }
  },
};

export default dictionaryController;
