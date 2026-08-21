import UserProfileSchema from '../validation/UserProfileSchema.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import reelModel from '../models/reelModel.js';
import { logEvents } from '../middleware/logEvents.js';
import { CDN_PREFIXES, createObjectKey, deleteObject, deletePrefix, headObject, isOwnedObjectUrl, presignUpload, publicObjectUrl } from '../utils/cdn.js';

const isValidImage = (type) => typeof type === 'string' && type.startsWith('image/');


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

      // Account deletion removes all media owned by this user from R2.
      await Promise.all([
        deletePrefix(`${CDN_PREFIXES.reels}/${userId}/`),
        deletePrefix(`${CDN_PREFIXES.profilePictures}/${userId}/`),
      ]);

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


  // Get presigned URL for uploading a new profile picture to the CDN.
  async presignProfilePicture(req, res) {
    const { fileName, contentType, size } = req.body || {};
    if (!isValidImage(contentType) || Number(size) > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'A valid image under 5MB is required' });
    }
    // Generate the object key on the server to prevent arbitrary bucket writes.
    const key = createObjectKey(CDN_PREFIXES.profilePictures, req.user.id, fileName);
    return res.status(200).json({ key, url: await presignUpload({ key, contentType }) });
  },

  // After the client uploads a new profile picture to the CDN, this endpoint verifies the upload and updates the user's profile with the new picture URL. It also deletes the previous profile picture if it was owned by the user.
  async updateProfilePicture(req, res) {
    const userId = req.user.id;
    const { key } = req.body || {};

    try {
      if (typeof key !== 'string' || !key.startsWith(`${CDN_PREFIXES.profilePictures}/${userId}/`) || key.includes('..')) {
        return res.status(400).json({ message: 'A valid uploaded profile picture is required' });
      }
      // Only store a profile URL after confirming the direct upload completed.
      await headObject(key);

      const previousUser = await usersModel.get(userId);
      const newUrl = publicObjectUrl(key);

      const updatedUser = await usersModel.updateProfile(userId, { profile_picture: newUrl });

      if (!updatedUser) {
        throw new Error('Failed to save profile picture');
      }

      // Best-effort - if the old file can't be deleted, it's just an orphan,
      // not something that should block a successful upload.
      if (previousUser && isOwnedObjectUrl(previousUser.profile_picture, CDN_PREFIXES.profilePictures, userId)) {
        await deleteObject(new URL(previousUser.profile_picture).pathname.slice(1)).catch(() => {});
      }

      res.status(200).json({
        message: 'Profile picture updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update profile picture error:', error);
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
      if (isOwnedObjectUrl(previousUser.profile_picture, CDN_PREFIXES.profilePictures, userId)) {
        await deleteObject(new URL(previousUser.profile_picture).pathname.slice(1)).catch(() => {});
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
