export const REELS_LIMIT = 4;

// Matches the limit authController.js uses when fetching a user's reels at
// login (reelModel.getLatestByUser) - keeps the profile's local preview list
// bounded to the same size regardless of whether it came from login or a
// same-session publish.
export const USER_REELS_PREVIEW_LIMIT = 6;
