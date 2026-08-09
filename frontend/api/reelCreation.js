import apiClient from './client.js';

/**
 * Upload a video and its synced subtitle lines to create a new reel.
 * Uses `apiClient` (the main Node backend on API_BASE_URL), not `reelsClient`
 * (the read-only reels-service) - the Node backend owns the write path.
 * @param {Object} params
 * @param {import('../types/createReel').WizardVideoAsset} params.video
 * @param {string|null} params.title
 * @param {string} params.description
 * @param {number} params.languageId
 * @param {number|null} params.translationLanguageId
 * @param {import('../types/createReel').DraftSubtitleLine[]} params.lines
 * @param {(progressEvent: any) => void} [onUploadProgress]
 * @returns {Promise<import('../types/createReel').CreateReelResponse>}
 */
export const createReel = async (
  { video, title, description, languageId, translationLanguageId, lines },
  onUploadProgress
) => {
  const form = new FormData();
  form.append('video', {
    uri: video.uri,
    name: video.fileName || `reel-${Date.now()}.mp4`,
    type: video.mimeType || 'video/mp4',
  });
  if (title) {
    form.append('title', title);
  }
  if (description) {
    form.append('description', description);
  }
  form.append('language_id', String(languageId));
  form.append('duration', String(Math.round(video.durationMs / 1000)));
  form.append(
    'lines',
    JSON.stringify(
      lines.map((line, index) => ({
        position: index + 1,
        text: line.text,
        translation: line.translation || null,
        translation_language_id: line.translation ? translationLanguageId : null,
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
