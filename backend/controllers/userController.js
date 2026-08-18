import fs from 'fs/promises';
import path from 'path';
import UserProfileSchema from '../validation/UserProfileSchema.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import reelModel from '../models/reelModel.js';
import { logEvents } from '../middleware/logEvents.js';
import { REEL_UPLOAD_DIR } from '../middleware/uploadReelVideo.js';
import { PROFILE_PICTURE_UPLOAD_DIR } from '../middleware/uploadProfilePicture.js';

const buildProfilePictureUrl = (userId, filename) =>
  `http://localhost:3500/static/uploads/profile_pictures/${userId}/${filename}`;

// Old profile pictures are only ours to delete if they live under our own
// upload dir - a Google-linked avatar (or anything else external) is just a
// URL we store, not a file we own.
const isOwnedProfilePicture = (url) => typeof url === 'string' && url.includes('/static/uploads/profile_pictures/');


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

      // Fetch saved sentences (user_sentences) for current language
      const saved_sentences = await userSentencesModel.get(
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
        user_sentences: saved_sentences,
      });
    } catch (error) {
      console.error('Get profile error:', error);
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

      // Reel rows/dialogue/vocabulary etc. are gone via ON DELETE CASCADE,
      // but the uploaded video/profile-picture files on disk aren't DB rows -
      // remove the user's upload folders now that nothing references them.
      await fs.rm(path.join(REEL_UPLOAD_DIR, String(userId)), { recursive: true, force: true });
      await fs.rm(path.join(PROFILE_PICTURE_UPLOAD_DIR, String(userId)), { recursive: true, force: true });

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



  // Upload/replace current user's profile picture. The file is already
  // saved to disk by the uploadProfilePicture middleware before this handler
  // runs - if anything below fails, the catch block removes it so it isn't
  // left as an orphan with no matching DB row.
  async updateProfilePicture(req, res) {
    const userId = req.user.id;
    const uploadedFile = req.file;

    try {
      if (!uploadedFile) {
        return res.status(400).json({
          message: 'A profile picture file is required',
        });
      }

      const previousUser = await usersModel.get(userId);
      const newUrl = buildProfilePictureUrl(userId, uploadedFile.filename);

      const updatedUser = await usersModel.updateProfile(userId, { profile_picture: newUrl });

      if (!updatedUser) {
        throw new Error('Failed to save profile picture');
      }

      // Best-effort - if the old file can't be deleted, it's just an orphan,
      // not something that should block a successful upload.
      if (previousUser && isOwnedProfilePicture(previousUser.profile_picture)) {
        await fs
          .unlink(path.join(PROFILE_PICTURE_UPLOAD_DIR, String(userId), path.basename(previousUser.profile_picture)))
          .catch(() => {});
      }

      res.status(200).json({
        message: 'Profile picture updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update profile picture error:', error);
      if (uploadedFile) {
        await fs.unlink(uploadedFile.path).catch(() => {});
      }
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },










  // Remove the current user's profile picture, reverting them to the
  // default initial-letter avatar the frontend shows when there's none set.
  async deleteProfilePicture(req, res) {
    try {
      const userId = req.user.id;

      const previousUser = await usersModel.get(userId);

      if (!previousUser?.profile_picture) {
        return res.status(400).json({
          message: 'No profile picture to remove',
        });
      }

      const updatedUser = await usersModel.updateProfile(userId, { profile_picture: null });

      if (!updatedUser) {
        throw new Error('Failed to remove profile picture');
      }

      // Best-effort - if the file can't be deleted, it's just an orphan,
      // not something that should block a successful removal.
      if (isOwnedProfilePicture(previousUser.profile_picture)) {
        await fs
          .unlink(path.join(PROFILE_PICTURE_UPLOAD_DIR, String(userId), path.basename(previousUser.profile_picture)))
          .catch(() => {});
      }

      res.status(200).json({
        message: 'Profile picture removed successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },



  // Get user by ID (public profile) - only ever returns fields safe to show
  // to anyone, unauthenticated (see usersModel.getPublicProfile).
  async getUserById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user id',
        });
      }

      const user = await usersModel.getPublicProfile(id);

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



  // A user's own published reels (public - anyone can view a creator's
  // reels grid). optionalVerifyJWT sets req.user when the viewer happens to
  // be logged in, so their own like/save state can be included; guests get
  // viewerId = null, which the model treats as "no interaction" for every reel.
  async getUserReels(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user id',
        });
      }

      const limit = Math.min(Number(req.query.limit) || 30, 50);
      const viewerId = req.user?.id ?? null;

      const reels = await reelModel.getReelsByUser(id, viewerId, limit);

      res.status(200).json({
        success: true,
        data: {
          reels,
        },
      });
    } catch (error) {
      console.error('Get user reels error:', error);
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
