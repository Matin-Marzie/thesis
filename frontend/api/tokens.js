import * as SecureStore from 'expo-secure-store';

// Constants for secure storage keys
const REFRESH_TOKEN_KEY = 'refresh_token';

// ✅ SECURE: Access token stored ONLY in memory (cleared on app restart)
let accessToken = null;

/**
 * Set access token in memory
 * @param {string} token - JWT access token
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Get access token from memory
 * @returns {string|null} - JWT access token or null
 */
export const getAccessToken = () => {
  return accessToken;
};

/**
 * Store refresh token securely using Expo SecureStore
 * Uses iOS Keychain / Android Keystore for encryption
 * @param {string} token - JWT refresh token
 */
export const storeRefreshToken = async (token) => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
};

/**
 * Get refresh token from SecureStore
 * @returns {Promise<string|null>} - JWT refresh token or null
 */
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Clear all tokens (both memory and SecureStore)
 * Called on logout or when refresh token is invalid
 */
export const clearTokens = async () => {
  try {
    accessToken = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};
