import SyncSchema from '../validation/SyncSchema.js';
import usersModel from '../models/usersModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';

const syncController = {
  // Sync user progress and vocabulary changes
  async sync(req, res) {
    try {
      const userId = req.user.id;

      // Validate request data
      const { error, value } = SyncSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message),
        });
      }

      const { user_progress, vocabulary_changes, sentence_changes } = value;
      const syncResults = {};

      // Update user progress (energy, coins)
      if (user_progress) {
        const updatedUser = await usersModel.updateProfile(userId, user_progress);
        if (updatedUser) {
          syncResults.user_progress = {
            energy: updatedUser.energy,
            coins: updatedUser.coins,
          };
        }
      }

      // Handle vocabulary changes if present
      if (vocabulary_changes) {
        const { inserts, updates, deletes } = vocabulary_changes;
        const currentUserLanguagesId = user_progress?.current_user_languages_id;
        
        if (!currentUserLanguagesId && (inserts && Object.keys(inserts).length > 0)) {
          return res.status(400).json({
            message: 'current_user_languages_id is required when inserting vocabulary',
          });
        }

        syncResults.vocabulary_changes = {};

        // Process deletes first
        if (deletes && Object.keys(deletes).length > 0) {
          const wordIdsToDelete = Object.keys(deletes).map(Number);
          const deletedWords = await userVocabularyModel.deleteVocabulary(userId, [wordIdsToDelete]);
          syncResults.vocabulary_changes.deletes = deletedWords.length;
        }

        // Process updates
        if (updates && Object.keys(updates).length > 0) {
          const updatedWords = await userVocabularyModel.update(
            userId,
            currentUserLanguagesId,
            updates
          );
          syncResults.vocabulary_changes.updates = updatedWords;
        }

        // Process inserts last
        if (inserts && Object.keys(inserts).length > 0) {
          const insertArray = Object.entries(inserts);
          const insertedWords = await userVocabularyModel.add(
            userId,
            insertArray,
            currentUserLanguagesId
          );
          syncResults.vocabulary_changes.inserts = insertedWords;
        }
      }

      // Handle sentence changes if present
      if (sentence_changes) {
        const { inserts, updates, deletes } = sentence_changes;
        const currentUserLanguagesId = user_progress?.current_user_languages_id;

        if (!currentUserLanguagesId && (inserts && Object.keys(inserts).length > 0)) {
          return res.status(400).json({
            message: 'current_user_languages_id is required when inserting sentences',
          });
        }

        syncResults.sentence_changes = {};

        // Process deletes first
        if (deletes && Object.keys(deletes).length > 0) {
          const sentenceIdsToDelete = Object.keys(deletes).map(Number);
          const deletedSentences = await userSentencesModel.deleteSentences(userId, [sentenceIdsToDelete]);
          syncResults.sentence_changes.deletes = deletedSentences.length;
        }

        // Process updates
        if (updates && Object.keys(updates).length > 0) {
          const updatedSentences = await userSentencesModel.update(
            userId,
            currentUserLanguagesId,
            updates
          );
          syncResults.sentence_changes.updates = updatedSentences;
        }

        // Process inserts last
        if (inserts && Object.keys(inserts).length > 0) {
          const insertArray = Object.entries(inserts);
          const insertedSentences = await userSentencesModel.add(
            userId,
            insertArray,
            currentUserLanguagesId
          );
          syncResults.sentence_changes.inserts = insertedSentences;
        }
      }

      res.status(200).json({
        message: 'Sync completed successfully',
        results: syncResults,
      });

    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({
        message: 'Internal server error during sync',
      });
    }
  },
};

export default syncController;