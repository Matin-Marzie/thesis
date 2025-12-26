import jwt from 'jsonwebtoken';
import usersModel from '../models/usersModel.js';
import { comparePassword } from '../utils/password.js';
import LoginSchema from '../validation/LoginSchema.js';
import { logEvents } from '../middleware/logEvents.js';

const authController = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = LoginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { username, email, password, coins, languages } = value;
    // TO Do: merge coins and languages.

    // Find user by username or email
    let user;
    if (username) {
      user = await usersModel.findByUsername(username);
    } else if (email) {
      user = await usersModel.findByEmail(email);
    }

    if (!user) {
      if (username) {
        return res.status(404).json({
          message: 'Username or Password is wrong',
        });
      }
      if (email) {
        return res.status(404).json({
          message: 'Email or Password is wrong',
        });
      }
    }

    // Check if user registered with Google (no password)
    if (!user.password_hash && user.google_id) {
      return res.status(401).json({
        message: 'Please login with Google',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      if (username) {
        return res.status(401).json({
          message: 'Username or Password is wrong',
        });
      }
      if (email) {
        return res.status(401).json({
          message: 'Email or Password is wrong',
        });
      }
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    // Save refresh token to database
    await usersModel.updateRefreshToken(user.id, refreshToken);

    // Log login
    logEvents(`User logged in: ${user.username}`, 'authLog.log');

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        energy: user.energy,
        coins: user.coins,
        age: user.age,
        preferences: user.preferences,
        notifications: user.notifications,
        joined_date: user.joined_date,
        total_experience: user.total_experience,
        languages: [ // TO DO: fetch user_languages from DB
          {
            is_current_language: true,
            native_language_id: 1,
            learning_language_id: 1,
            proficiency_level: 'B2',
            experience: 694662,
            learned_vocabulary: [{ id: 1, mastery_level: 1, last_review: null, created_at: null }], // Words user has learned with metadata
          },
        ]
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error during login',
    });
  }
};

export default authController;
