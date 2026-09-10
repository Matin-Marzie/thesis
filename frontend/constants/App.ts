export const APP_NAME = 'glosy';
export const APP_TAGLINE = 'Personalized Language Learning';
export const PRIMARY_COLOR = '#0f8690';

// Coins awarded for answering a reels spaced-repetition review prompt
// (ReviewFeedbackRow) - granted at most once per reel, see ReelsList's
// handleReviewRatingChange. Matches WordOfWonders' GAME_WIN_REWARD.
export const REVIEW_COIN_REWARD = 20;

export const DARK_COLORS = {
  background: '#121212',
  surface: '#1c1c1c',
  border: '#333',
  text: '#fff',
  textSecondary: '#aaa',
  textMuted: '#888',
} as const;
