import { hashPassword } from '../utils/password.js';
import { issueTokenPair } from '../utils/tokens.js';
import { generateUsername } from '../utils/username.js';
import { logEvents } from '../middleware/logEvents.js';
import RegisterSchema from '../validation/RegisterSchema.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';
import emailVerificationModel from '../models/emailVerificationModel.js';
import { verifyCode, attemptsExceeded } from '../utils/EmailVerificationCode.js';

const registerController = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = RegisterSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Extract all validated fields from RegistrationSchema
    const {
      password,
      email_verification_code,
      user_profile,
      user_progress,
      vocabulary_changes,
      sentence_changes,
    } = value;

    // Verify the pending code stored server-side, before creating any user row
    const pending = await emailVerificationModel.getByEmail(user_profile.email);

    if (!pending) {
      return res.status(400).json({
        message: 'No verification code found for this email. Please request a new code.\n(Resend code)',
      });
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new one.\n(Resend code)',
      });
    }

    if (attemptsExceeded(pending.attempts)) {
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new code.\n(Resend code)',
      });
    }

    if (!verifyCode(email_verification_code, pending.code_hash)) {
      await emailVerificationModel.incrementAttempts(user_profile.email);
      return res.status(400).json({
        message: 'Incorrect verification code',
      });
    }

    // Verification succeeded - the pending code is single-use
    await emailVerificationModel.deleteByEmail(user_profile.email);

    // Hash password
    const password_hash = await hashPassword(password);

    // Try to create user with different username variations
    let newUser = null;
    const usernameVariations = [
      generateUsername(user_profile.email),        // First: just email prefix
      generateUsername(user_profile.email, '_'),   // Second: email_12345
      generateUsername(user_profile.email, '.'),   // Third: email.12345
    ];

    for (const usernameAttempt of usernameVariations) {
      try {
        newUser = await usersModel.create({
          email: user_profile.email,
          password_hash,
          username: usernameAttempt,
          first_name: user_profile.first_name,
          age: user_profile.age,
          preferences: user_profile.preferences,
          notifications: user_profile.notifications,
          energy: user_progress.energy,
          coins: user_progress.coins,
          email_verified: true,
        });
        // If successful, break out of loop
        break;
      } catch (error) {
        // Check if error is due to duplicate username
        if (error.code === '23505' && error.constraint === 'users_username_key') {
          // Continue to next username variation
          continue;
        }
        // If it's a different error, throw it
        throw error;
      }
    }

    // If all username attempts failed
    if (!newUser) {
      return res.status(500).json({
        message: 'Failed to create user - unable to generate unique username',
      });
    }

    // Log registration
    logEvents(
      `New user registered: ${newUser.email} (${newUser.username})`,
      'authLog.log'
    );

    // Generate tokens
    const { accessToken, refreshToken } = await issueTokenPair(newUser, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Add Languages
    const new_user_languages = await userLanguagesModel.add(newUser.id, user_progress.languages);
    const current_language = new_user_languages.find(lang => lang.is_current_language);

    // Add vocabulary based on proficiency level (bulk insert words below user's level)
    let new_user_vocabulary = {};
    const proficiencyLevel = current_language.proficiency_level;
    const learningLanguageId = current_language.learning_language.id;
    
    // Bulk add words below proficiency level with mastery_level = 3
    new_user_vocabulary = await userVocabularyModel.addByProficiencyLevel(
      newUser.id,
      current_language.id,
      learningLanguageId,
      proficiencyLevel,
      newUser.joined_date
    );

    // Apply any additional vocabulary changes from the client (manual additions during onboarding)
    if (vocabulary_changes) {
      // Handle inserts
      if (vocabulary_changes.inserts && Object.keys(vocabulary_changes.inserts).length > 0) {
        const insertsArray = Object.entries(vocabulary_changes.inserts);
        const insertedVocabulary = await userVocabularyModel.add(
          newUser.id,
          insertsArray,
          current_language.id
        );
        // Merge with existing vocabulary (overwrites duplicates)
        new_user_vocabulary = { ...new_user_vocabulary, ...insertedVocabulary };
      }
      
      // Handle updates (in case user modified mastery of existing words)
      if (vocabulary_changes.updates && Object.keys(vocabulary_changes.updates).length > 0) {
        const updatedVocabulary = await userVocabularyModel.update(
          newUser.id,
          current_language.id,
          vocabulary_changes.updates
        );
        new_user_vocabulary = { ...new_user_vocabulary, ...updatedVocabulary };
      }
      
      // Note: deletes are not processed during registration (nothing to delete for new user)
    }

    // Apply any sentence_changes from the client (manual saves during
    // onboarding). No proficiency-based seeding here - sentences has no
    // level column, so new_user_sentences starts empty unless the client
    // sent something explicit.
    let new_user_sentences = {};
    if (sentence_changes) {
      if (sentence_changes.inserts && Object.keys(sentence_changes.inserts).length > 0) {
        const insertsArray = Object.entries(sentence_changes.inserts);
        const insertedSentences = await userSentencesModel.add(
          newUser.id,
          insertsArray,
          current_language.id
        );
        new_user_sentences = { ...new_user_sentences, ...insertedSentences };
      }

      if (sentence_changes.updates && Object.keys(sentence_changes.updates).length > 0) {
        const updatedSentences = await userSentencesModel.update(
          newUser.id,
          current_language.id,
          sentence_changes.updates
        );
        new_user_sentences = { ...new_user_sentences, ...updatedSentences };
      }

      // Note: deletes are not processed during registration (nothing to delete for new user)
    }

    // Respond with user data, dictionary and tokens
    res.status(201).json({
      message: 'User registered successfully',
      user_profile: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        profile_picture: newUser.profile_picture,
        
        age: newUser.age,
        preferences: newUser.preferences,
        notifications: newUser.notifications,
        joined_date: newUser.joined_date,
      },
      user_progress: {
        energy: newUser.energy,
        coins: newUser.coins,
        languages: new_user_languages,
      },
      user_vocabulary: new_user_vocabulary,
      user_sentences: new_user_sentences,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error during registration',
    });
  }
};

export default registerController;
