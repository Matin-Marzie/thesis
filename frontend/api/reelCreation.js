import apiClient from './client.js';

/**
 * Upload a video and its synced subtitle lines to create a new reel.
 * Uses `apiClient` (the main Node backend on API_BASE_URL), not `reelsClient`
 * (the read-only reels-service) - the Node backend owns the write path.
 * @param {Object} params
 * @param {import('../types/createReel').WizardVideoAsset} params.video
 * @param {import('../types/createReel').WizardImageAsset|null} [params.thumbnail] - Optional cover image; when omitted, the backend extracts one from the video's first frame.
 * @param {string|null} params.title
 * @param {number} params.languageId
 * @param {import('../types/createReel').DraftSubtitleLine[]} params.lines
 * @param {(progressEvent: any) => void} [onUploadProgress]
 * @returns {Promise<import('../types/createReel').CreateReelResponse>}
 */
export const createReel = async (
  { video, thumbnail, title, languageId, lines },
  onUploadProgress
) => {
  const form = new FormData();
  form.append('video', {
    uri: video.uri,
    name: video.fileName || `reel-${Date.now()}.mp4`,
    type: video.mimeType || 'video/mp4',
  });
  if (thumbnail) {
    form.append('thumbnail', {
      uri: thumbnail.uri,
      name: thumbnail.fileName || `thumbnail-${Date.now()}.jpg`,
      type: thumbnail.mimeType || 'image/jpeg',
    });
  }
  if (title) {
    form.append('title', title);
  }
  form.append('language_id', String(languageId));
  form.append('duration', String(Math.round(video.durationMs / 1000)));
  form.append(
    'lines',
    JSON.stringify(
      lines.map((line, index) => ({
        position: index + 1,
        text: line.text,
        translations: line.translations
          .filter((t) => t.text.trim() && t.languageId)
          .map((t) => ({ text: t.text.trim(), translation_language_id: t.languageId })),
        start_time_ms: line.start_time_ms,
        end_time_ms: line.end_time_ms,
      }))
    )
  );

  try {
    const response = await apiClient.post('/reel', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to publish reel';
    throw new Error(message);
  }
};

/**
 * Permanently delete one of the current user's reels.
 * @param {number|string} reelId
 * @returns {Promise<{message: string}>}
 */
export const deleteReel = async (reelId) => {
  try {
    const response = await apiClient.delete(`/reel/${reelId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete reel';
    throw new Error(message);
  }
};

/**
 * Report a reel for violating content guidelines.
 * @param {number|string} reelId
 * @param {string} reason - One of REPORT_REASONS in components/reels/ReportReelBottomSheetModal
 * @returns {Promise<{message: string}>}
 */
export const reportReel = async (reelId, reason) => {
  try {
    const response = await apiClient.post(`/reel/${reelId}/report`, { reason });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to report reel';
    throw new Error(message);
  }
};

/**
 * Toggle the current user's like on a reel. Likes it if not already liked,
 * unlikes it otherwise.
 * @param {number|string} reelId
 * @returns {Promise<{is_liked: boolean, likes_count: number}>}
 */
export const toggleLikeReel = async (reelId) => {
  try {
    const response = await apiClient.post(`/reel/${reelId}/like`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to like reel';
    throw new Error(message);
  }
};

/**
 * Toggle the current user's save (bookmark) on a reel. Saves it if not
 * already saved, unsaves it otherwise.
 * @param {number|string} reelId
 * @returns {Promise<{is_saved: boolean}>}
 */
export const toggleSaveReel = async (reelId) => {
  try {
    const response = await apiClient.post(`/reel/${reelId}/save`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to save reel';
    throw new Error(message);
  }
};
