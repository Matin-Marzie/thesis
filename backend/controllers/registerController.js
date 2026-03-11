import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/password.js';
import { generateUsername } from '../utils/username.js';
import { logEvents } from '../middleware/logEvents.js';
import RegisterSchema from '../validation/RegisterSchema.js';
import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';

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
      user_profile,
      user_progress,
      vocabulary_changes,
    } = value;

    // Check if email already exists
    const emailExists = await usersModel.findByEmail(user_profile.email);
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
    const accessToken = jwt.sign(
      {
        id: newUser.id,
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
      3, // mastery_level = "Understood"
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
