import { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_USER_PROFILE, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} ProfileContextType
 * @property {Object} userProfile
 * @property {Function} setUserProfile
 * @property {Function} updateUserProfile
 * @property {boolean} isProfileLoaded
 */

/** @type {import('react').Context<ProfileContextType>} */
const ProfileContext = createContext({});

export const ProfileProvider = ({ children }) => {
  const {
    value: userProfile,
    setValue: setUserProfile,
    isLoaded: isProfileLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE, validators.userProfile);

  // Update user profile helper
  const updateUserProfile = useCallback(async (newUserProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      ...newUserProfile,
    }));
  }, [setUserProfile]);

  const value = {
    userProfile, setUserProfile, updateUserProfile,
    isProfileLoaded,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

// Custom hook to use the ProfileContext
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;
