import UserProfileSchema from '../validation/UserProfileSchema.js';
import SwitchLanguageSchema from '../validation/SwitchLanguageSchema.js';
import AddLanguageSchema from '../validation/AddLanguageSchema.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import { logEvents } from '../middleware/logEvents.js';


const userController = {
  // Get current user profile
  // users, user_languages, user_vocabulary
  async getUserProfileProgress(req, res) {
    try {
      const userId = req.user.id;

      const fetchedUser = await usersModel.get(userId);

      if (!fetchedUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Get user languages
      const userLanguages = await userLanguagesModel.get(userId);
      const current_language = userLanguages.find(lang => lang.is_current_language);

      // Fetch learned_vocabulary(user_vocabulary) for current language
      const learned_vocabulary = await userVocabularyModel.get(
        userId,
        current_language.id,
      );

      res.status(200).json({
        message: 'User profile fetched successfully',
        user_profile: {
          id: fetchedUser.id,
          email: fetchedUser.email,
          username: fetchedUser.username,
          first_name: fetchedUser.first_name,
          last_name: fetchedUser.last_name,
          profile_picture: fetchedUser.profile_picture,
          age: fetchedUser.age,
          preferences: fetchedUser.preferences,
          notifications: fetchedUser.notifications,
          joined_date: fetchedUser.joined_date,
        },
        user_progress: {
          energy: fetchedUser.energy,
          coins: fetchedUser.coins,
          languages: userLanguages,
        },
        user_vocabulary: learned_vocabulary,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },



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

      res.status(200).json({
        message: 'Current language switched successfully',
        user_progress: {
          languages: updatedLanguages,
        },
        user_vocabulary,
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
      });
    } catch (error) {
      console.error('Add language error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  // Permanently delete current user's account and all associated data
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;

      const deletedUser = await usersModel.delete(userId);

      if (!deletedUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      logEvents(`User deleted account: ${deletedUser.email}`, 'authLog.log');

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },




















  // Update current user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      // Validate request body
      const { error, value } = UserProfileSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      // Check if username is being changed and if it's already taken
      if (value.username) {
        const existingUser = await usersModel.findByUsername(value.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            message: 'Username already taken',
          });
        }
      }

      // Update user
      const updatedUser = await usersModel.updateProfile(userId, value);

      if (!updatedUser) {
        return res.status(400).json({
          message: 'No valid fields to update',
        });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  // Get user by ID (public profile)
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await usersModel.get(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },

  // Update user energy
  async updateEnergy(req, res) {
    try {
      const userId = req.user.id;
      const { energy } = req.body;

      if (typeof energy !== 'number' || energy < 0 || energy > parseInt(process.env.MAX_ENERGY || 5)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid energy value',
        });
      }

      const result = await usersModel.updateEnergy(userId, energy);

      res.status(200).json({
        success: true,
        message: 'Energy updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Update energy error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },

  // Update user coins
  async updateCoins(req, res) {
    try {
      const userId = req.user.id;
      const { coins } = req.body;

      if (typeof coins !== 'number' || coins < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coins value',
        });
      }

      const result = await usersModel.updateCoins(userId, coins);

      res.status(200).json({
        success: true,
        message: 'Coins updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Update coins error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
};

export default userController;
