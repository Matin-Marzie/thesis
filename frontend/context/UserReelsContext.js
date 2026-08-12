import { createContext, useContext, useCallback, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_USER_REELS, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} UserReelsContextType
 * @property {Array} userReels
 * @property {Function} setUserReels
 * @property {(reel: Object) => void} prependUserReel
 * @property {(reelId: number|string) => void} removeUserReel
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
  // list, without waiting for the next login's fetch to surface it.
  const prependUserReel = useCallback((reel) => {
    setUserReels((prev) => [reel, ...prev.filter((r) => r.id !== reel.id)]);
  }, [setUserReels]);

  // Drops a deleted reel from local state so the profile grid/pager reflect
  // the deletion immediately, without waiting on the next login's fetch.
  const removeUserReel = useCallback((reelId) => {
    setUserReels((prev) => prev.filter((r) => r.id !== reelId));
  }, [setUserReels]);

  const value = useMemo(() => ({
    userReels, setUserReels, prependUserReel, removeUserReel,
    isUserReelsLoaded,
  }), [userReels, setUserReels, prependUserReel, removeUserReel, isUserReelsLoaded]);

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
