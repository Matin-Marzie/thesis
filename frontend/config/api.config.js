// API Configuration

// Base url for authentication, user engagement, and other services
export const API_BASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1`;

// Base url for reels service
export const REELS_API_BASE_URL = `${process.env.EXPO_PUBLIC_REELS_RECOMMENDATION_URL}/api/v1`;

// Base url for media served by the CDN (reel videos/thumbnails, profile
// pictures) - the DB stores these as paths only, so this is prefixed on
// the frontend to build the full, requestable URL.
export const CDN_URL = process.env.EXPO_PUBLIC_CDN_URL;

export default {
  API_BASE_URL,
  REELS_API_BASE_URL,
  CDN_URL,
};