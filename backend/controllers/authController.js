import LoginSchema from '../validation/LoginSchema.js';
import { issueTokenPair } from '../utils/tokens.js';
import { comparePassword } from '../utils/password.js';
import { logEvents } from '../middleware/logEvents.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import reelModel from '../models/reelModel.js';
import mergeGuestProgress from '../utils/mergeGuestProgress.js';

const authController = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = LoginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { username, email, password, user_profile, user_progress, vocabulary_changes, sentence_changes } = value;

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

    // Security alert: Malicious user can find emails of registered users by trying to login with random emails.
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
    const { accessToken, refreshToken } = await issueTokenPair(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Fetch user_languages from DB
    let userLanguages = await userLanguagesModel.get(user.id);

    // If the client sent local guest progress along with login, merge it
    // into this account (see mergeGuestProgress.js for the exact rules)
    if (user_profile || user_progress || vocabulary_changes || sentence_changes) {
      const updatedUser = await mergeGuestProgress(user.id, { user_profile, user_progress, vocabulary_changes, sentence_changes }, userLanguages);
      if (updatedUser) {
        user = { ...user, ...updatedUser };
      }
      // Re-fetch - merge may have added a new language pair or bumped an existing one
      userLanguages = await userLanguagesModel.get(user.id);
    }

    const current_language = userLanguages.find(lang => lang.is_current_language);

    // Fetch user vocabulary for current language
    const user_vocabulary_in_db = await userVocabularyModel.get(
      user.id,
      current_language.id,
    );

    // Fetch user's saved sentences for current language
    const user_sentences_in_db = await userSentencesModel.get(
      user.id,
      current_language.id,
    );

    // Latest reels created by this user, for the profile screen's preview
    const user_reels_in_db = await reelModel.getLatestByUser(user.id, 9);

    // Log login
    logEvents(`User logged in: ${user.username}`, 'authLog.log');

    res.status(200).json({
      message: 'Login successful',
      user_profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        age: user.age,
        preferences: user.preferences,
        notifications: user.notifications,
        joined_date: user.joined_date,
      },
      user_progress:{
        energy: user.energy,
        coins: user.coins,
        languages: userLanguages,
      },
      user_vocabulary: user_vocabulary_in_db,
      user_sentences: user_sentences_in_db,
      user_reels: user_reels_in_db,
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
