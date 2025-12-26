/**
 * API Module Index
 * 
 * Re-exports all API functions for backward compatibility
 * Import from specific modules for better tree-shaking:
 * 
 * import { loginUser } from './api/auth';
 * import { getCurrentUser } from './api/user';
 * import { getAccessToken } from './api/tokens';
 */

// Export client
export { default as apiClient } from './client.js';

// Export auth functions
export {
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  logoutUser,
} from './auth.js';

// Export user functions
export {
  getCurrentUser,
  updateUserProfile,
  getUserVocabulary,
  updateUserEnergy,
  updateUserCoins,
} from './user.js';

// Export token management functions
export {
  setAccessToken,
  getAccessToken,
  storeRefreshToken,
  getRefreshToken,
  clearTokens,
} from './tokens.js';

// Default export for backward compatibility
import apiClient from './client.js';
export default apiClient;
