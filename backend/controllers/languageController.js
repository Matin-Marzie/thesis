import SwitchLanguageSchema from '../validation/SwitchLanguageSchema.js';
import AddLanguageSchema from '../validation/AddLanguageSchema.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';

const languageController = {
  // Switch the authenticated user's current learning language.
  // Returns the updated languages list and the vocabulary scoped to the
  // newly-current language, so the client can replace its local vocabulary
  // in the same round trip instead of issuing a second request.
  async switchLanguage(req, res) {
    try {
      const userId = req.user.id;

      const { error, value } = SwitchLanguageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const userLanguages = await userLanguagesModel.get(userId);
      // ids come back from Postgres as strings (bigint columns) - coerce before comparing
      const target = userLanguages.find(lang => Number(lang.id) === value.user_languages_id);

      if (!target) {
        return res.status(404).json({
          message: 'Language not found for this user',
        });
      }

      let updatedLanguages = userLanguages;
      if (!target.is_current_language) {
        await userLanguagesModel.setCurrent(userId, target.id);
        updatedLanguages = userLanguages.map(lang => ({
          ...lang,
          is_current_language: Number(lang.id) === value.user_languages_id,
        }));
      }

      const user_vocabulary = await userVocabularyModel.get(userId, target.id);
      const user_sentences = await userSentencesModel.get(userId, target.id);

      res.status(200).json({
        message: 'Current language switched successfully',
        user_progress: {
          languages: updatedLanguages,
        },
        user_vocabulary,
        user_sentences,
      });
    } catch (error) {
      console.error('Switch language error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  // Add a new language pair to the authenticated user's account and make it
  // current. Auto-seeds vocabulary for words below the given proficiency
  // level (mirroring registration's seeding) and returns the updated
  // languages list plus the new language's vocabulary in one round trip.
  async addLanguage(req, res) {
    try {
      const userId = req.user.id;

      const { error, value } = AddLanguageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const { native_language_id, learning_language_id, proficiency_level } = value;

      const existingLanguages = await userLanguagesModel.get(userId);
      // ids come back from Postgres as strings (bigint columns) - coerce before comparing
      const alreadyHasPair = existingLanguages.some(
        (lang) =>
          Number(lang.native_language.id) === native_language_id &&
          Number(lang.learning_language.id) === learning_language_id
      );

      if (alreadyHasPair) {
        return res.status(409).json({
          message: "You're already learning this language",
        });
      }

      const created_at = new Date().toISOString();

      const [newLanguage] = await userLanguagesModel.add(userId, [{
        native_language: { id: native_language_id },
        learning_language: { id: learning_language_id },
        created_at,
        proficiency_level,
        experience: 0,
        is_current_language: false,
      }]);

      if (!newLanguage) {
        return res.status(400).json({
          message: 'Could not add language - check that the language IDs are valid',
        });
      }

      // setCurrent unsets every other row for this user in the same statement
      await userLanguagesModel.setCurrent(userId, newLanguage.id);

      const updatedLanguages = [
        ...existingLanguages.map((lang) => ({ ...lang, is_current_language: false })),
        { ...newLanguage, is_current_language: true },
      ];

      const user_vocabulary = await userVocabularyModel.addByProficiencyLevel(
        userId,
        newLanguage.id,
        learning_language_id,
        proficiency_level,
        created_at
      );

      res.status(201).json({
        message: 'Language added successfully',
        user_progress: {
          languages: updatedLanguages,
        },
        user_vocabulary,
        // Always empty for a new pair - sentences has no level column, so
        // there's no proficiency-based seed to run (unlike user_vocabulary
        // above). Returned explicitly (not omitted) so the response shape
        // stays uniform across all three language endpoints.
        user_sentences: {},
      });
    } catch (error) {
      console.error('Add language error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  // Remove a language pair from the authenticated user's account. A user
  // must always have at least one language, so this is rejected if it's
  // their only one. If the deleted language was current, the most recently
  // added remaining language is promoted to current and its vocabulary is
  // returned so the client can swap to it in the same round trip.
  async deleteLanguage(req, res) {
    try {
      const userId = req.user.id;
      const languageId = Number(req.params.id);

      if (!Number.isInteger(languageId)) {
        return res.status(400).json({
          message: 'Invalid language id',
        });
      }

      const existingLanguages = await userLanguagesModel.get(userId);
      const target = existingLanguages.find((lang) => Number(lang.id) === languageId);

      if (!target) {
        return res.status(404).json({
          message: 'Language not found for this user',
        });
      }

      if (existingLanguages.length === 1) {
        return res.status(400).json({
          message: 'You must have at least one language',
        });
      }

      const deleted = await userLanguagesModel.deleteById(userId, languageId);
      if (!deleted) {
        return res.status(404).json({
          message: 'Language not found for this user',
        });
      }

      const remainingLanguages = existingLanguages.filter((lang) => Number(lang.id) !== languageId);

      let updatedLanguages = remainingLanguages;
      let user_vocabulary;
      let user_sentences;

      if (target.is_current_language) {
        const nextCurrent = [...remainingLanguages].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        await userLanguagesModel.setCurrent(userId, nextCurrent.id);
        user_vocabulary = await userVocabularyModel.get(userId, nextCurrent.id);
        user_sentences = await userSentencesModel.get(userId, nextCurrent.id);

        updatedLanguages = remainingLanguages.map((lang) => ({
          ...lang,
          is_current_language: Number(lang.id) === Number(nextCurrent.id),
        }));
      }

      res.status(200).json({
        message: 'Language deleted successfully',
        user_progress: {
          languages: updatedLanguages,
        },
        ...(user_vocabulary !== undefined && { user_vocabulary }),
        ...(user_sentences !== undefined && { user_sentences }),
      });
    } catch (error) {
      console.error('Delete language error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },
};

export default languageController;
