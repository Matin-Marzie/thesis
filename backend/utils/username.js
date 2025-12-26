/**
 * Generate a unique username from email
 * @param {string} email - User's email
 * @param {string} separator - Separator between email and digits ('_', '.', or '')
 * @returns {string} Generated username
 */
export const generateUsername = (email, separator = '') => {
  // Extract username from email (part before @)
  const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (separator === '') {
    return emailPrefix;
  }
  
  // Generate 5 random digits
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // Ensures 5 digits (10000-99999)
  
  return `${emailPrefix}${separator}${randomDigits}`;
};

/**
 * Generate username from first name and last name with random digits
 * Used for Google OAuth registration
 * @param {string} first_name - User's first name
 * @param {string} last_name - User's last name (optional)
 * @returns {string} Generated username (e.g., johnsmith12345 or john12345)
 */
export const generateUsernameFromName = (first_name, last_name = '') => {
  // Combine first name and last name, remove non-alphanumeric characters
  const namePart = `${first_name}${last_name}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  
  // Generate 5 random digits
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // Ensures 5 digits (10000-99999)
  
  return `${namePart}${randomDigits}`;
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
export const isValidUsername = (username) => {
  // Username must be 3-50 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};
