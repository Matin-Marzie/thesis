import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/password.js';
import { generateUsername } from '../utils/username.js';
import UserSchema from '../validation/UserSchema.js';
import { logEvents } from '../middleware/logEvents.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import dictionaryModel from '../models/dictionaryModel.js';

const registerController = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = UserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Extract all validated fields from RegistrationSchema
    const {
      password,
      first_name,
      email,
      age,
      preferences,
      notifications,
      energy,
      coins,
      total_experience,
      languages,
    } = value;

    // Check if email already exists
    const emailExists = await usersModel.findByEmail(email);
    if (emailExists) {
      return res.status(409).json({
        message: 'Email already in use',
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Try to create user with different username variations
    let newUser = null;
    const usernameVariations = [
      generateUsername(email),        // First: just email prefix
      generateUsername(email, '_'),   // Second: email_12345
      generateUsername(email, '.'),   // Third: email.12345
    ];

    for (const usernameAttempt of usernameVariations) {
      try {
        newUser = await usersModel.create({
          email,
          password_hash,
          username: usernameAttempt,
          first_name,
          age,
          preferences,
          notifications,
          energy,
          coins,
          total_experience,
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
      finally {
        // Log registration
        logEvents(
          `New user registered: ${newUser.email} (${newUser.username})`,
          'authLog.log'
        );
      }
    }

    // If all username attempts failed
    if (!newUser) {
      return res.status(500).json({
        message: 'Failed to create user - unable to generate unique username',
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );


    // Save refresh token to database
    await usersModel.updateRefreshToken(newUser.id, refreshToken);

    // Add Languages
    const new_user_languages = await userLanguagesModel.addUserLanguages(newUser.id, languages);
    const current_language = new_user_languages.find(lang => lang.is_current_language);

    // // Add Learned Vocabulary words
    const total_vocabulary_words = [];

    // Collect vocabulary words from all languages
    for (const lang of languages) {
      if (lang.learned_vocabulary && lang.learned_vocabulary.length > 0) {
        for (const word of lang.learned_vocabulary) {
          total_vocabulary_words.push({
            user_id: newUser.id,
            word_id: word.id,
            mastery_level: word.mastery_level,
            last_review: word.last_review,
            created_at: word.created_at,
          });
        }
      }
    }

    // Add all vocabulary words at once
    await userVocabularyModel.addVocabulary(total_vocabulary_words);

    // Fetch learned_vocabulary for current language
    const learned_vocabulary = await userVocabularyModel.getLearnedVocabulary(
      newUser.id,
      current_language.learning_language_id,
      current_language.native_language_id
    );
    // Attach learned_vocabulary to current language object
    new_user_languages.forEach(lang => {
      if (lang.is_current_language) {
        lang.learned_vocabulary = learned_vocabulary;
      }
    });

    // Respond with user data, dictionary and tokens
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        profile_picture: newUser.profile_picture,
        energy: newUser.energy,
        coins: newUser.coins,
        age: newUser.age,
        preferences: newUser.preferences,
        notifications: newUser.notifications,
        joined_date: newUser.joined_date,
        total_experience: newUser.total_experience,
        languages: new_user_languages,
      },
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
