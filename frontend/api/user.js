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
export const syncUserData = async (syncPayload) => {
  try {
    const response = await apiClient.post('/user/sync', syncPayload);
    return response.data;
  } catch (error) {
    console.error('Sync error:', error.response?.data || error.message);
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
 * Update user profile
 * @param {Object} userData - { user_profile }
 * @returns {Promise<Object>} - { message, user_profile }
 */
// NOT TESTED AND NOT USING THIS FUNCTION
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.patch('/user/me', userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error.response?.data || error.message);
    throw error;
  }
};