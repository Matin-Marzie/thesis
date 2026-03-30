import reelsClient from './reelsClient';

/**
 * Fetch reels from the reels service
 * @param {Object} params - Query parameters
 * @param {string} params.learning_language_code - Learning language code (e.g., 'fa')
 * @param {string} params.native_language_code - Native language code (e.g., 'en')
 * @param {number} params.limit - Number of reels to fetch (default: 4)
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @returns {Promise<Object>} - Reels data
 */
export const fetchReels = async ({
  learning_language_code,
  native_language_code,
  limit = 4, // For now fetch only 4 to test refeching more reels, because datbase has very few reels, 
  isAuthenticated = false,
}) => {
  try {
    const response = await reelsClient.get('/reels', {
      params: {
        learning_language_code,
        native_language_code,
        limit,
      },
      // Skip auth header for guest users to get random reels
      skipAuth: !isAuthenticated,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  fetchReels,
};
