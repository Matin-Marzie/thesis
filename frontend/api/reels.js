import reelsClient from './reelsClient';

/**
 * Fetch reels from the reels service
 * @param {Object} params - Query parameters
 * @param {string} params.learning_language_code - Learning language code (e.g., 'fa')
 * @param {string} params.native_language_code - Native language code (e.g., 'en')
 * @param {number} params.limit - Number of reels to fetch (default: 10)
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @param {Array<number|string>} [params.dueWordIds] - FIFO-ordered (oldest due
 *   first) word ids from the on-device FSRS queue (see utils/fsrs.getDueWords),
 *   sent so the recommendation engine's Stage 2 (SpacedRepetitionPrioritizer)
 *   can rank reels covering a due word first. Sent for guests too - reels-service
 *   ranks guest results by due-word coverage the same way, just without a
 *   comprehensibility filter or content-based ranking (both need a known account).
 * @param {Array<number|string>} [params.excludeReelIds] - Reel ids already shown
 *   this session, so guests (no server-side account to dedup against) don't
 *   keep seeing the same due-word reel resurface on every "load more".
 * @returns {Promise<Object>} - Reels data
 */
export const fetchReels = async ({
  learning_language_code,
  native_language_code,
  limit = 10,
  isAuthenticated = false,
  dueWordIds = [],
  excludeReelIds = [],
}) => {
  try {
    const params = {
      learning_language_code,
      native_language_code,
      limit,
      ...(dueWordIds.length > 0 && { due_word_ids: dueWordIds.join(',') }),
      ...(excludeReelIds.length > 0 && { exclude_reel_ids: excludeReelIds.join(',') }),
    };

    const response = await reelsClient.get('/reels', {
      params,
      // Skip auth header for guest users to get random reels
      skipAuth: !isAuthenticated,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch the current user's own reels, full shape (dialogue sentences,
 * tokens, translations, stats) - reels-service's GET /reels/mine, used to
 * populate the profile "My Reels" list right after login, since the Node
 * backend's login payload only carries a few flat columns with no dialogue.
 * @param {number} [limit=30]
 * @returns {Promise<{reels: Object[], total: number}>}
 */
export const fetchMyReels = async (limit = 30) => {
  const response = await reelsClient.get('/reels/mine', {
    params: { limit },
  });
  return response.data;
};

/**
 * Fetch one reel's dialogue (sentences, tokens, all-language translations)
 * on demand - reels-service's GET /reels/{id}/dialogue. Used to lazily load
 * subtitles when the viewer presses the subtitle button on a reel that
 * arrived without dialogue (e.g. the Node-backed creator-profile reel list).
 * @param {number|string} reelId
 * @returns {Promise<import('../types/dialogue').Dialogue>}
 */
export const fetchReelDialogue = async (reelId) => {
  const response = await reelsClient.get(`/reels/${reelId}/dialogue`);
  return response.data;
};

export default {
  fetchReels,
  fetchMyReels,
  fetchReelDialogue,
};
