import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import UserSchema from '../validation/UserSchema.js';

const usersController = {
  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await usersModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Get user languages
      const userLanguages = await userLanguagesModel.findByUserId(userId);

      res.status(200).json({
        data: {
          user,
          languages: userLanguages,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
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
      const { error, value } = UserSchema.validate(req.body);

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

      const user = await usersModel.findById(id);

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

export default usersController;
