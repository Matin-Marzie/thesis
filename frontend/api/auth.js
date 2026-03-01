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
 * Login with Google OAuth
 * @param {Object} data - { idToken, platform, user } (Google ID token)
 * @returns {Promise<Object>} - { user, accessToken, refreshToken }
 */
export const loginWithGoogle = async (data) => {
  try {
    const response = await apiClient.post('/auth/google', data);

    // Store tokens from response body
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    if (response.data?.data?.refreshToken) {
      await storeRefreshToken(response.data.data.refreshToken);
    }

    return response.data;
  } catch (error) {
    // Extract error message and throw clean error (not raw axios error)
    const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
    throw new Error(errorMessage);
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
