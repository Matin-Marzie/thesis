import LanguageSchema from '../validation/LanguageSchema.js';
import dictionaryModel from '../models/dictionaryModel.js';

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
        words,
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

      const [language_id, translation_language_id, words] = await Promise.all([
        dictionaryModel.getLanguageIdByCode(language_code),
        dictionaryModel.getLanguageIdByCode(translation_language_code),
        language_code === translation_language_code
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
        words,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch dictionary' });
    }
  },
};

export default dictionaryController;
