import apiClient from './client.js';

/**
 * Switch the authenticated user's current learning language.
 * @param {number} userLanguagesId - id of the user_languages row to make current
 * @returns {Promise<Object>} - { message, user_progress: { languages }, user_vocabulary, user_sentences }
 */
export const switchCurrentLanguage = async (userLanguagesId) => {
  try {
    const response = await apiClient.patch('/language/current', {
      user_languages_id: userLanguagesId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to switch language';
    throw new Error(message);
  }
};


/**
 * Remove a language pair from the authenticated user's account.
 * @param {number} userLanguagesId - id of the user_languages row to delete
 * @returns {Promise<Object>} - { message, user_progress: { languages }, user_vocabulary?, user_sentences? }
 *   user_vocabulary/user_sentences are only present when the deleted language was current
 */
export const deleteLanguage = async (userLanguagesId) => {
  try {
    const response = await apiClient.delete(`/language/${userLanguagesId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete language';
    throw new Error(message);
  }
};


/**
 * Add a new language pair to the authenticated user's account, making it current.
 * @param {Object} params
 * @param {number} params.native_language_id
 * @param {number} params.learning_language_id
 * @param {string} params.proficiency_level - one of N, A1, A2, B1, B2, C1, C2, EX
 * @returns {Promise<Object>} - { message, user_progress: { languages }, user_vocabulary, user_sentences }
 *   user_sentences is always empty for a newly-added pair (no proficiency-based seed for sentences)
 */
export const addLanguage = async ({ native_language_id, learning_language_id, proficiency_level }) => {
  try {
    const response = await apiClient.post('/language', {
      native_language_id,
      learning_language_id,
      proficiency_level,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to add language';
    throw new Error(message);
  }
};
