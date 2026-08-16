import apiClient from './client.js';

/**
 * Get current user profile with language preferences
 * @returns {Promise<Object>} - { success, data: { user, languages } }
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Get user error:', error.response?.data || error.message);
    throw error;
  }
};


/**
 * Sync user progress and vocabulary changes with the backend
 * @param {Object} syncPayload
 * @param {Object} syncPayload.user_progress - { energy, coins, current_user_languages_id }
 * @param {Object|null} syncPayload.vocabulary_changes - { inserts, updates, deletes }
 * @returns {Promise<Object>} - { message, results }
 */
/**
 * @param {Object} options
 * @param {boolean} [options.silent=false] - If true, suppress error banner (for background sync)
 */
export const syncUserData = async (syncPayload, options = {}) => {
  try {
    const response = await apiClient.post('/user/sync', syncPayload, {
      silent: options.silent || false,
    });
    return response.data;
  } catch (error) {
    // Error handling is done by the caller and/or apiClient interceptor (shows banner)
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
 * Update user profile (first_name, last_name, username, profile_picture, age, preferences, notifications)
 * @param {Object} userData - fields to update, e.g. { first_name, last_name, username }
 * @returns {Promise<Object>} - { message, data: { user } }
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.patch('/user/profile', userData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update profile';
    throw new Error(message);
  }
};


/**
 * Upload/replace the current user's profile picture
 * @param {Object} asset - { uri, mimeType, fileName } from expo-image-picker
 * @returns {Promise<Object>} - { message, data: { user } }
 */
export const uploadProfilePicture = async (asset) => {
  const form = new FormData();
  form.append('profile_picture', {
    uri: asset.uri,
    name: asset.fileName || `profile-picture-${Date.now()}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  });

  try {
    const response = await apiClient.patch('/user/profile-picture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update profile picture';
    throw new Error(message);
  }
};


/**
 * Permanently delete the current user's account and all associated data
 * @returns {Promise<Object>} - { message }
 */
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/user/me');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete account';
    throw new Error(message);
  }
};