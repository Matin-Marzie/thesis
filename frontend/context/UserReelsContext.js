import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_USER_REELS, STORAGE_KEYS, validators } from '../constants/defaults';
import { fetchMyReels } from '../api/reels';

/**
 * @typedef {Object} UserReelsContextType
 * @property {Array} userReels
 * @property {Function} setUserReels
 * @property {(reel: Object) => void} prependUserReel
 * @property {(reelId: number|string) => void} removeUserReel
 * @property {boolean} isUserReelsLoaded
 * @property {boolean} isFetchingUserReels
 * @property {() => Promise<void>} refreshUserReels
 */

/** @type {import('react').Context<UserReelsContextType>} */
const UserReelsContext = createContext({});

export const UserReelsProvider = ({ children }) => {
  const {
    value: userReels,
    setValue: setUserReels,
    isLoaded: isUserReelsLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_REELS, DEFAULT_USER_REELS, validators.userReels);

  const [isFetchingUserReels, setIsFetchingUserReels] = useState(false);

  // Full-shape (dialogue sentences/translations/stats) refetch from
  // reels-service's GET /reels/mine - the Node login/register response no
  // longer carries user_reels at all, so this is the only source for the
  // profile "My Reels" list. Best-effort: a failed fetch just leaves
  // whatever was already persisted in place.
  const refreshUserReels = useCallback(async () => {
    setIsFetchingUserReels(true);
    try {
      const { reels } = await fetchMyReels();
      setUserReels(reels);
    } catch {
      // Keep existing state; caller has no user-facing error path here.
    } finally {
      setIsFetchingUserReels(false);
    }
  }, [setUserReels]);

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
    isUserReelsLoaded, isFetchingUserReels, refreshUserReels,
  }), [
    userReels, setUserReels, prependUserReel, removeUserReel,
    isUserReelsLoaded, isFetchingUserReels, refreshUserReels,
  ]);

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
