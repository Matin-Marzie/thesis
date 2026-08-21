import apiClient from './client.js';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Get current user profile with language preferences
 * @returns {Promise<Object>} - { success, data: { user, languages, user_vocabulary, user_sentences } }
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
 * Get another user's public profile (id, username, first_name, last_name,
 * profile_picture, joined_date - no private fields). Works for guests too.
 * @param {number|string} userId
 * @returns {Promise<Object>} - { success, data: { user } }
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to load profile';
    throw new Error(message);
  }
};

/**
 * Get a user's published reels (most recent first). Works for guests too;
 * if the caller is authenticated, each reel's user_interaction reflects
 * the caller's own like/save state.
 * @param {number|string} userId
 * @param {number} [limit]
 * @returns {Promise<Object>} - { success, data: { reels } }
 */
export const getUserReels = async (userId, limit) => {
  try {
    const response = await apiClient.get(`/user/${userId}/reels`, {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to load reels';
    throw new Error(message);
  }
};


/**
 * Sync user progress, vocabulary changes, and sentence changes with the backend
 * @param {Object} syncPayload
 * @param {Object} syncPayload.user_progress - { energy, coins, current_user_languages_id }
 * @param {Object|null} [syncPayload.vocabulary_changes] - { inserts, updates, deletes }
 * @param {Object|null} [syncPayload.sentence_changes] - { inserts, updates, deletes }
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
  try {
    const fileName = asset.fileName || `profile-picture-${Date.now()}.jpg`;
    const contentType = asset.mimeType || 'image/jpeg';
    const info = await FileSystem.getInfoAsync(asset.uri);
    const presign = await apiClient.post('/user/profile-picture/upload-url', {
      fileName,
      contentType,
      size: info.exists ? info.size : undefined,
    });
    const upload = await FileSystem.uploadAsync(presign.data.url, asset.uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': contentType },
    });
    if (upload.status < 200 || upload.status >= 300) throw new Error('Profile picture upload failed');
    const response = await apiClient.patch('/user/profile-picture', { key: presign.data.key });
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
 * Remove the current user's profile picture, reverting to the default avatar
 * @returns {Promise<Object>} - { message, data: { user } }
 */
export const deleteProfilePicture = async () => {
  try {
    const response = await apiClient.delete('/user/profile-picture');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to remove profile picture';
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