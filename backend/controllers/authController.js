import jwt from 'jsonwebtoken';
import LoginSchema from '../validation/LoginSchema.js';
import { comparePassword } from '../utils/password.js';
import { logEvents } from '../middleware/logEvents.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';

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

    // Fetch user_languages from DB
    const userLanguages = await userLanguagesModel.findByUserId(user.id);
    const current_language = userLanguages.find(lang => lang.is_current_language);
    
    // Fetch user vocabulary for current language
    const learned_vocabulary = await userVocabularyModel.getLearnedVocabulary(
      user.id,
      current_language.learning_language_id,
      current_language.native_language_id
    )

    // Attach languages and vocabulary to user object
    userLanguages.forEach(lang => {
      if (lang.is_current_language) {
        lang.learned_vocabulary = learned_vocabulary;
      }
    });

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
        languages: userLanguages,
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
