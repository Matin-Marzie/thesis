import LanguageSchema from '../validation/LanguageSchema.js';
import lettersModel from '../models/lettersModel.js';

const lettersController = {
  async getLanguageLetters(req, res) {
    try {
      const { language_code } = req.params;

      // Validate param
      const { error } = LanguageSchema.validate({ code: language_code });

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const letters = await lettersModel.getLettersByLanguageCode(language_code);

      res.json({
        language_code: language_code,
        letters,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch letters' });
    }
  },
};

export default lettersController;
