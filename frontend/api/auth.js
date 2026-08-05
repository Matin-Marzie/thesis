import axios from 'axios';
import apiClient from './client.js';
import { setAccessToken, storeRefreshToken, getRefreshToken } from './tokens.js';
import { API_BASE_URL } from '../config/api.config.js';
import { apiEvents, API_EVENTS } from './apiEvents.js';

/**
 * Register a new user
 * @param {Object} userData - {}
 * @returns {Promise<Object>} - { success, data: { user, accessToken, refreshToken } }
 */
export const registerUser = async (newUser) => {
  try {
    const response = await apiClient.post('/register', newUser);

    // Store tokens from response body
    setAccessToken(response.data.accessToken);
    await storeRefreshToken(response.data.refreshToken);

    return response; // return full response (status + data)

  } catch (error) {
    // normalize error
    const message =
      error.response?.data?.message ||
      error.message ||
      'Registration failed';

    throw new Error(message);
  }
};


/**
 * Request a 6-digit email verification code to be sent to the given address.
 * Does NOT create a user or return tokens. The code itself is verified
 * server-side (stored hashed in the DB, keyed by email) - just resubmit the
 * same email + the code the user typed to registerUser().
 * @param {string} email
 * @returns {Promise<Object>} - full axios response; response.data = { message, expires_in_minutes }
 */
export const requestVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/register/send-code', { email });
    return response;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to send verification code';

    throw new Error(message);
  }
};




/**
 * Request a 6-digit password reset code to be sent to the given address.
 * Always resolves the same way regardless of whether the email is
 * registered (server response is generic to prevent account enumeration) -
 * submit the same email + the code the user typed to resetPassword().
 * @param {string} email
 * @returns {Promise<Object>} - full axios response; response.data = { message }
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to request password reset';

    throw new Error(message);
  }
};


/**
 * Verify a password reset code without resetting the password yet.
 * Does not consume the code - resetPassword() still re-verifies it as the
 * real, single-use gate before changing anything.
 * @param {Object} data - { email, code }
 * @returns {Promise<Object>} - full axios response; response.data = { message }
 */
export const verifyResetCode = async ({ email, code }) => {
  try {
    const response = await apiClient.post('/auth/verify-reset-code', { email, code });
    return response;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to verify code';

    // status is attached so the UI can tell a 429 (too many attempts, needs
    // a resend) apart from a plain wrong-code 400 without string-matching
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    throw normalizedError;
  }
};


/**
 * Reset password using the code sent by requestPasswordReset().
 * Does not log the user in - no tokens are returned, the caller should
 * redirect to login.
 * @param {Object} data - { email, code, password }
 * @returns {Promise<Object>} - full axios response; response.data = { message }
 */
export const resetPassword = async ({ email, code, new_password }) => {
  try {
    const response = await apiClient.post('/auth/reset-password', { email, code, new_password });
    return response;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to reset password';

    throw new Error(message);
  }
};


/**
 * Login with username and password
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} - { success, data: { user, accessToken, refreshToken } }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);

    // Store tokens from response body
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    if (response.data?.refreshToken) {
      await storeRefreshToken(response.data.refreshToken);
    }

    return response; // return full response (status + data)

  } catch (error) {
    // normalize error
    const message =
      error.response?.data?.message ||
      error.message ||
      'Login failed';

    throw new Error(message);
  }
};




/**
 * Login with an existing Google account. Does not create an account - if
 * none exists yet, rejects with a normalized Error whose .code is
 * 'GOOGLE_ACCOUNT_NOT_FOUND', so the caller can route to onboarding and
 * finish sign-up via registerWithGoogle instead.
 * @param {Object} data - { idToken, platform }
 * @returns {Promise<Object>} - full axios response; response.data = { user_profile, user_progress, user_vocabulary, accessToken, refreshToken }
 */
export const loginWithGoogle = async (data) => {
  try {
    const response = await apiClient.post('/auth/google/login', data);

    // Store tokens from response body
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }

    if (response.data?.refreshToken) {
      await storeRefreshToken(response.data.refreshToken);
    }

    return response; // return full response (status + data)
  } catch (error) {
    // Extract error message and throw clean error (not raw axios error).
    // status/code are attached so callers can tell a missing account
    // (GOOGLE_ACCOUNT_NOT_FOUND) apart from other failures.
    const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
    const normalizedError = new Error(errorMessage);
    normalizedError.status = error.response?.status;
    normalizedError.code = error.response?.data?.code;
    throw normalizedError;
  }
};

/**
 * Register a new account with Google, using profile/progress data collected
 * during onboarding. If the account already exists, the backend responds
 * the same way a login would rather than erroring.
 * @param {Object} data - { idToken, platform, user_profile, user_progress }
 * @returns {Promise<Object>} - full axios response; response.data = { user_profile, user_progress, user_vocabulary, accessToken, refreshToken }
 */
export const registerWithGoogle = async (data) => {
  try {
    const response = await apiClient.post('/auth/google/register', data);

    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }

    if (response.data?.refreshToken) {
      await storeRefreshToken(response.data.refreshToken);
    }

    return response; // return full response (status + data)
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Google registration failed';
    const normalizedError = new Error(errorMessage);
    normalizedError.status = error.response?.status;
    normalizedError.code = error.response?.data?.code;
    throw normalizedError;
  }
};




/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} - New access token
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Send refresh token in request body (not cookies)
    const response = await axios.post(
      `${API_BASE_URL}/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // TO DO: remove data.data
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);

      // Update refresh token if backend rotates it
      if (response.data?.data?.refreshToken) {
        await storeRefreshToken(response.data.data.refreshToken);
      }

      return response.data.data.accessToken;
    }

    throw new Error('Failed to refresh token');
  } catch (error) {
    // Preserve error type for proper handling in initApp
    // Network errors: error.response is undefined and error.code might be 'ERR_NETWORK'
    // Server errors: error.response?.status >= 500
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const isServerError = error.response?.status >= 500;
    
    if (isNetworkError || isServerError) {
      // Emit server error event so the banner shows
      apiEvents.emit(API_EVENTS.SERVER_ERROR, {
        isNetworkError,
        status: error.response?.status,
        message: 'Server not reachable',
      });
      
      // Create error with specific type for offline mode handling
      const networkError = new Error('Server not reachable');
      networkError.isServerUnreachable = true;
      networkError.originalError = error;
      throw networkError;
    }
    
    // Auth error (invalid/expired refresh token) - throw clean error
    const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';
    throw new Error(errorMessage);
  }
};

/**
 * Logout user (clears tokens from backend and local storage)
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      // Send refresh token in request body to invalidate on backend
      await apiClient.post('/logout', { refreshToken });
    }
  } catch (error) {
    // Silently fail - tokens will still be cleared locally - check hooks/useLogout.js
    console.warn('Logout API call failed:', error.message);
  }
};
