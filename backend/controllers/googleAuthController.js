import jwt from 'jsonwebtoken';
import usersModel from '../models/usersModel.js';
import { generateUsernameFromName } from '../utils/username.js';
import { logEvents } from '../middleware/logEvents.js';
import GoogleAuthSchema from '../validation/GoogleAuthSchema.js';

const googleAuthController = async (req, res) => {
  try {
    // googleUser is set by verifyGoogleToken middleware
    const { google_id, email, email_verified, first_name, last_name, profile_picture } = req.googleUser;

    // Validate additional fields from req.body
    const { error, value } = GoogleAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { user_profile: { age, preferences, joined_date, notifications }, user_progress: { energy, coins, languages } } = value;

    // Check if user exists by Google ID
    let user = await usersModel.findByGoogleId(google_id);

    // If not found by Google ID, check by email
    if (!user) {
      user = await usersModel.findByEmail(email);

      // If email exists but not linked to Google, return error
      if (user && !user.google_id) {
        return res.status(409).json({
          message: 'An account with this email already exists. Please login with email and password.',
        });
      }
    }

    // -----Register-----
    // If user doesn't exist, create new user
    if (!user) {
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
        coins: coins || 0,
        joined_date,
        energy,
      });
      // TO Do: handle languages for new user

      logEvents(`New user registered via Google: ${email} (${username})`, 'authLog.log');
    } else {

      // -----Login-----
      logEvents(`User logged in via Google: ${email}`, 'authLog.log');
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

    // Return tokens in response body for React Native
    // Refresh token should be stored in SecureStore (expo-secure-store)
    // Access token should be kept in memory only
    res.status(200).json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        joined_date: user.joined_date,
        preferences: user.preferences,
        notifications: user.notifications,
        energy: user.energy,
        coins: user.coins,
        total_experience: user.total_experience,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication',
    });
  }
};

export default googleAuthController;
