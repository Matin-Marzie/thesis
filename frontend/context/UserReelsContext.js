import { createContext, useContext, useCallback, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_USER_REELS, STORAGE_KEYS, validators } from '../constants/defaults';
import { USER_REELS_PREVIEW_LIMIT } from '../constants/Reels';

/**
 * @typedef {Object} UserReelsContextType
 * @property {Array} userReels
 * @property {Function} setUserReels
 * @property {(reel: Object) => void} prependUserReel
 * @property {boolean} isUserReelsLoaded
 */

/** @type {import('react').Context<UserReelsContextType>} */
const UserReelsContext = createContext({});

export const UserReelsProvider = ({ children }) => {
  const {
    value: userReels,
    setValue: setUserReels,
    isLoaded: isUserReelsLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_REELS, DEFAULT_USER_REELS, validators.userReels);

  // Optimistically add a just-published reel to the front of the local
  // preview list, without waiting for the next login's fetch to surface it.
  const prependUserReel = useCallback((reel) => {
    setUserReels((prev) => [reel, ...prev.filter((r) => r.id !== reel.id)].slice(0, USER_REELS_PREVIEW_LIMIT));
  }, [setUserReels]);

  const value = useMemo(() => ({
    userReels, setUserReels, prependUserReel,
    isUserReelsLoaded,
  }), [userReels, setUserReels, prependUserReel, isUserReelsLoaded]);

  return <UserReelsContext.Provider value={value}>{children}</UserReelsContext.Provider>;
};

// Custom hook to use the UserReelsContext
export const useUserReels = () => {
  const context = useContext(UserReelsContext);
  if (!context) {
    throw new Error('useUserReels must be used within a UserReelsProvider');
  }
  return context;
};

export default UserReelsContext;
