/**
 * Default values for user state
 */

export const DEFAULT_USER_PROFILE = {
  id: null,
  first_name: 'Guest',
  last_name: null,
  username: 'guest_user',
  email: 'guest@example.com',
  profile_picture: null,
  joined_date: null,
  age: null,
  preferences: '',
  notifications: true,
};

export const DEFAULT_USER_PROGRESS = {
  energy: 100,
  coins: 20,
  languages: [
    {
      id: null,
      is_current_language: true,
      native_language: {
        id: 1,
        name: 'English',
        code: 'en',
      },
      learning_language: {
        id: 2,
        name: 'Greek',
        code: 'el',
      },
      created_at: null,
      proficiency_level: 'N',
      experience: 0
    },
  ],
};

export const DEFAULT_USER_VOCABULARY = {};

export const DEFAULT_USER_REELS = [];

export const DEFAULT_VIBRATION_SETTINGS = {
  enabled: true,
  buttons: true,
  animations: true,
  wordOfWonders: true,
  wordle: true,
};

// Default reminder time is 8:00 PM, matching what onboarding schedules on first grant
export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  hour: 20,
  minute: 0,
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_PROGRESS: 'user_progress',
  USER_VOCABULARY: 'user_vocabulary',
  USER_VOCABULARY_CHANGES: 'user_vocabulary_changes',
  USER_REELS: 'user_reels',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  VIBRATION_SETTINGS: 'vibration_settings',
  REMINDER_SETTINGS: 'reminder_settings',
};

// Validators for loaded data
export const validators = {
  userProfile: (data) =>
    data && typeof data === 'object' && data.username,

  userProgress: (data) =>
    data && typeof data === 'object' &&
    data.energy !== undefined &&
    data.coins !== undefined,

  userVocabulary: (data) =>
    data && typeof data === 'object',

  userReels: (data) =>
    Array.isArray(data),

  vocabularyChanges: (data) =>
    data && typeof data === 'object' &&
    typeof data.inserts === 'object' &&
    typeof data.updates === 'object' &&
    typeof data.deletes === 'object',

  onboardingComplete: (data) =>
    typeof data === 'boolean',

  vibrationSettings: (data) =>
    data && typeof data === 'object' &&
    typeof data.enabled === 'boolean' &&
    typeof data.buttons === 'boolean' &&
    typeof data.animations === 'boolean' &&
    typeof data.wordOfWonders === 'boolean' &&
    typeof data.wordle === 'boolean',

  reminderSettings: (data) =>
    data && typeof data === 'object' &&
    typeof data.enabled === 'boolean' &&
    Number.isInteger(data.hour) && data.hour >= 0 && data.hour <= 23 &&
    Number.isInteger(data.minute) && data.minute >= 0 && data.minute <= 59,
};
