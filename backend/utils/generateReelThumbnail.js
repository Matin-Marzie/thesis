import path from 'path';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

// A hair past 0s rather than the literal first frame - frame zero is often
// a black/blank encoder keyframe warm-up on phone-recorded video.
const THUMBNAIL_TIMESTAMP_SECONDS = 0.1;
const THUMBNAIL_MAX_WIDTH = 720;

/**
 * Extracts a frame near the start of a video and saves it as a JPEG next to
 * the source video (same directory), for use as a reel's thumbnail when the
 * client doesn't upload one itself.
 * @param {string} videoPath - Absolute path to the source video file
 * @returns {Promise<string>} Absolute path to the generated thumbnail file
 */
export const generateReelThumbnail = (videoPath) => {
  const dir = path.dirname(videoPath);
  const filename = `${Date.now()}-${crypto.randomUUID()}.jpg`;
  const outputPath = path.join(dir, filename);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(THUMBNAIL_TIMESTAMP_SECONDS)
      .frames(1)
      // Scale to at most THUMBNAIL_MAX_WIDTH wide, never upscale (min() with
      // source width iw), height auto-computed to preserve aspect ratio.
      .videoFilters(`scale='min(${THUMBNAIL_MAX_WIDTH},iw)':-2`)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};
