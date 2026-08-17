import usersModel from '../models/usersModel.js';
import { issueTokenPair } from '../utils/tokens.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import { generateUsernameFromName } from '../utils/username.js';
import { logEvents } from '../middleware/logEvents.js';
import GoogleRegisterSchema from '../validation/GoogleRegisterSchema.js';

const googleRegisterController = async (req, res) => {
  try {
    // googleUser is set by verifyGoogleToken middleware
    const { google_id, email, email_verified, first_name, last_name, profile_picture } = req.googleUser;

    // Validate onboarding data - required to create the account
    const { error, value } = GoogleRegisterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { user_profile, user_progress, vocabulary_changes, sentence_changes } = value;

    // Register should only ever create a new account - if one already
    // exists (whether linked to this Google identity already, or under a
    // different method with the same email), refuse and tell the user to
    // log in instead of silently succeeding on their behalf.
    let user = await usersModel.findByGoogleId(google_id);
    if (user) {
      return res.status(409).json({
        message: 'You already have an account. Please login instead.',
      });
    }

    user = await usersModel.findByEmail(email);
    if (user) {
      return res.status(409).json({
        message: 'You already have an account with this email. Please login with email and password.',
      });
    }

    const { age, preferences, notifications } = user_profile;
    const { energy, coins, languages } = user_progress;

    // Generate unique username from first_name and last_name
    let username = generateUsernameFromName(first_name, last_name);
    let usernameExists = await usersModel.findByUsername(username);

    // Keep generating until we find a unique username
    let count_tries = 0
    while (usernameExists) {
      username = generateUsernameFromName(first_name, last_name);
      usernameExists = await usersModel.findByUsername(username);

      if (count_tries > 5) { // Prevent infinite loop of username generation and trying
        return res.status(500).json({
          message: 'Error generating unique username. Please try again.',
        });
      }
      count_tries += 1;
    }

    user = await usersModel.create({
      email,
      username,
      first_name,
      last_name,
      google_id,
      profile_picture,
      password_hash: null, // No password for Google auth
      email_verified,
      age,
      preferences,
      notifications,
      coins: coins || 0,
      energy,
    });

    // Add languages
    const userLanguages = await userLanguagesModel.add(user.id, languages);
    const current_language = userLanguages.find(lang => lang.is_current_language);

    // Add vocabulary based on proficiency level (bulk insert words below user's level)
    let userVocabulary = await userVocabularyModel.addByProficiencyLevel(
      user.id,
      current_language.id,
      current_language.learning_language.id,
      current_language.proficiency_level,
      user.joined_date
    );

    // Apply any additional vocabulary changes from the client (manual additions during onboarding)
    if (vocabulary_changes) {
      if (vocabulary_changes.inserts && Object.keys(vocabulary_changes.inserts).length > 0) {
        const insertsArray = Object.entries(vocabulary_changes.inserts);
        const insertedVocabulary = await userVocabularyModel.add(user.id, insertsArray, current_language.id);
        userVocabulary = { ...userVocabulary, ...insertedVocabulary };
      }

      if (vocabulary_changes.updates && Object.keys(vocabulary_changes.updates).length > 0) {
        const updatedVocabulary = await userVocabularyModel.update(user.id, current_language.id, vocabulary_changes.updates);
        userVocabulary = { ...userVocabulary, ...updatedVocabulary };
      }

      // Note: deletes are not processed during registration (nothing to delete for a new user)
    }

    // Apply any sentence_changes from the client (manual saves during
    // onboarding). No proficiency-based seeding here - sentences has no
    // level column, so userSentences starts empty unless the client sent
    // something explicit.
    let userSentences = {};
    if (sentence_changes) {
      if (sentence_changes.inserts && Object.keys(sentence_changes.inserts).length > 0) {
        const insertsArray = Object.entries(sentence_changes.inserts);
        const insertedSentences = await userSentencesModel.add(user.id, insertsArray, current_language.id);
        userSentences = { ...userSentences, ...insertedSentences };
      }

      if (sentence_changes.updates && Object.keys(sentence_changes.updates).length > 0) {
        const updatedSentences = await userSentencesModel.update(user.id, current_language.id, sentence_changes.updates);
        userSentences = { ...userSentences, ...updatedSentences };
      }

      // Note: deletes are not processed during registration (nothing to delete for a new user)
    }

    logEvents(`New user registered via Google: ${email} (${username})`, 'authLog.log');

    // Generate tokens
    const { accessToken, refreshToken } = await issueTokenPair(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Google registration successful',
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
    console.error('Google registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google registration',
    });
  }
};

export default googleRegisterController;
