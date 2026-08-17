import usersModel from '../models/usersModel.js';
import { issueTokenPair } from '../utils/tokens.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import { logEvents } from '../middleware/logEvents.js';
import GoogleLoginSchema from '../validation/GoogleLoginSchema.js';
import mergeGuestProgress from '../utils/mergeGuestProgress.js';

const googleLoginController = async (req, res) => {
  try {
    // googleUser is set by verifyGoogleToken middleware
    const { google_id, email } = req.googleUser;

    // Validate optional merge fields (idToken/platform were already
    // validated by verifyGoogleToken)
    const { error, value } = GoogleLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { user_profile, user_progress, vocabulary_changes, sentence_changes } = value;

    // Check if user exists by Google ID
    let user = await usersModel.findByGoogleId(google_id);

    // If not found by Google ID, check by email
    if (!user) {
      user = await usersModel.findByEmail(email);

      // If email exists but not linked to Google, return error
      if (user && !user.google_id) {
        return res.status(409).json({
          message: 'You already have an account with this email. Please login with email and password.',
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        code: 'GOOGLE_ACCOUNT_NOT_FOUND',
        message: 'No account found for this Google user. Please register first.',
      });
    }

    // Fetch languages for the account
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
    const userVocabulary = await userVocabularyModel.get(user.id, current_language.id);
    const userSentences = await userSentencesModel.get(user.id, current_language.id);

    // Generate tokens
    const { accessToken, refreshToken } = await issueTokenPair(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    logEvents(`User logged in via Google: ${email}`, 'authLog.log');

    res.status(200).json({
      message: 'Google login successful',
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
      user_progress: {
        energy: user.energy,
        coins: user.coins,
        languages: userLanguages,
      },
      user_vocabulary: userVocabulary,
      user_sentences: userSentences,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google login',
    });
  }
};

export default googleLoginController;
