import apiClient from './client.js';

/**
 * Get current user profile with language preferences
 * @returns {Promise<Object>} - { success, data: { user, languages } }
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Get user error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - { username?, first_name?, last_name?, email?, profile_picture? }
 * @returns {Promise<Object>} - { success, data: { user } }
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.patch('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user's vocabulary progress
 * @returns {Promise<Object>} - User's learned words and progress
 */
export const getUserVocabulary = async () => {
  try {
    const response = await apiClient.get('/users/vocabulary');
    return response.data;
  } catch (error) {
    console.error('Get vocabulary error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user's energy
 * @param {number} energyChange - Amount to add/subtract
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserEnergy = async (energyChange) => {
  try {
    const response = await apiClient.patch('/users/energy', { energy: energyChange });
    return response.data;
  } catch (error) {
    console.error('Update energy error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user's coins
 * @param {number} coinsChange - Amount to add/subtract
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserCoins = async (coinsChange) => {
  try {
    const response = await apiClient.patch('/users/coins', { coins: coinsChange });
    return response.data;
  } catch (error) {
    console.error('Update coins error:', error.response?.data || error.message);
    throw error;
  }
};
