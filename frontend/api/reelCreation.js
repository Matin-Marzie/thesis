import apiClient from './client.js';
import * as FileSystem from 'expo-file-system/legacy';
import * as VideoThumbnails from 'expo-video-thumbnails';

const uploadToCdn = async (asset, presigned, contentType) => {
  // The device sends bytes directly to R2; the API never receives the media body.
  const upload = await FileSystem.uploadAsync(presigned.url, asset.uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': contentType },
  });
  if (upload.status < 200 || upload.status >= 300) {
    throw new Error(`Media upload failed (${upload.status}): ${upload.body || 'Cloudflare R2 rejected the upload'}`);
  }
};

/**
 * Upload a video and its synced subtitle lines to create a new reel.
 * Uses `apiClient` (the main Node backend on API_BASE_URL), not `reelsClient`
 * (the read-only reels-service) - the Node backend owns the write path.
 * @param {Object} params
 * @param {import('../types/createReel').WizardVideoAsset} params.video
 * @param {import('../types/createReel').WizardImageAsset|null} [params.thumbnail] - Optional cover image; when omitted, the phone extracts one from the video.
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
  try {
    let uploadThumbnail = thumbnail;
    if (!uploadThumbnail) {
      // Generate the fallback cover locally so large videos stay off the API server.
      const generated = await VideoThumbnails.getThumbnailAsync(video.uri, { time: 100 });
      uploadThumbnail = {
        uri: generated.uri,
        mimeType: 'image/jpeg',
        fileName: `thumbnail-${Date.now()}.jpg`,
      };
    }

    const videoFileName = video.fileName || `reel-${Date.now()}.mp4`;
    const videoContentType = video.mimeType || 'video/mp4';
    const thumbnailFileName = uploadThumbnail.fileName || `thumbnail-${Date.now()}.jpg`;
    const thumbnailContentType = uploadThumbnail.mimeType || 'image/jpeg';
    const thumbnailInfo = await FileSystem.getInfoAsync(uploadThumbnail.uri);
    if (!thumbnailInfo.exists || !thumbnailInfo.size) {
      throw new Error('The selected thumbnail file is unavailable on this device');
    }
    const presign = await apiClient.post('/reel/uploads/presign', {
      video: { fileName: videoFileName, contentType: videoContentType, size: video.fileSizeBytes },
      thumbnail: { fileName: thumbnailFileName, contentType: thumbnailContentType, size: thumbnailInfo.size },
    });
    await uploadToCdn(video, presign.data.video, videoContentType);
    onUploadProgress?.({ loaded: 1, total: 2 });
    await uploadToCdn(uploadThumbnail, presign.data.thumbnail, thumbnailContentType);
    onUploadProgress?.({ loaded: 2, total: 2 });

    const response = await apiClient.post('/reel', {
      videoKey: presign.data.video.key,
      thumbnailKey: presign.data.thumbnail?.key || null,
      title: title || null,
      language_id: languageId,
      duration: Math.round(video.durationMs / 1000),
      lines: lines.map((line, index) => ({
        position: index + 1,
        text: line.text,
        translations: line.translations
          .filter((t) => t.text.trim() && t.languageId)
          .map((t) => ({ text: t.text.trim(), translation_language_id: t.languageId })),
        start_time_ms: line.start_time_ms,
        end_time_ms: line.end_time_ms,
      })),
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
