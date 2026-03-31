import { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { fetchReels as fetchReelsApi } from '../api/reels';
import { useAppContext } from './AppContext';
import { REELS_LIMIT } from '../constants/Reels';

/**
 * @typedef {Object} Reel
 * @property {number} id
 * @property {string} url
 * @property {string} thumbnail_url
 * @property {string} title
 * @property {number} duration
 * @property {string} created_at
 * @property {Object} language
 * @property {Object} created_by
 * @property {Object} stats
 * @property {Object} user_interaction
 * @property {Object} dialogue
 */

/**
 * @typedef {Object} ReelsContextType
 * @property {Reel[]} reels
 * @property {boolean} isLoading
 * @property {boolean} isFetchingMore
 * @property {boolean} hasMore
 * @property {string|null} error
 * @property {(refresh?: boolean) => Promise<void>} fetchReels
 * @property {() => void} resetReels
 */

/** @type {import('react').Context<ReelsContextType>} */
const ReelsContext = createContext({});

export const ReelsProvider = ({ children }) => {
  const { userProgress, isAuthenticated } = useAppContext();
  
  // State
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Get current language settings from userProgress
  const currentLanguage = useMemo(() => {
    const languages = userProgress?.languages || [];
    return languages.find(lang => lang.is_current_language) || languages[0];
  }, [userProgress?.languages]);

  const learningLanguageCode = currentLanguage?.learning_language?.code || 'el';
  const nativeLanguageCode = currentLanguage?.native_language?.code || 'en';

  /**
   * Fetch reels - handles both initial load and fetching more
   * Backend returns random reels each time
   * @param {boolean} refresh - If true, replaces existing reels
   */
  const fetchReels = useCallback(async (refresh = false) => {
    // Prevent duplicate requests
    if (isLoading || isFetchingMore) return;
    
    // Don't fetch more if we've reached the end (unless refreshing)
    if (!refresh && !hasMore) return;

    const isInitialLoad = reels.length === 0 || refresh;

    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      setError(null);

      const response = await fetchReelsApi({
        learning_language_code: learningLanguageCode,
        native_language_code: nativeLanguageCode,
        limit: REELS_LIMIT,
        isAuthenticated,
      });

      const newReels = response?.reels || [];
      const totalAvailable = response?.total_reels_available_in_db_for_learning_language || 0;

      if (refresh) {
        setReels(newReels);
      } else {
        // Append new reels, avoiding duplicates
        setReels(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewReels = newReels.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNewReels];
        });
      }

      // Check if there are more reels available
      setHasMore(reels.length + newReels.length < totalAvailable);

    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to fetch reels');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [
    isLoading,
    isFetchingMore,
    hasMore,
    reels.length,
    learningLanguageCode,
    nativeLanguageCode,
    isAuthenticated,
  ]);

  /**
   * Reset reels state (useful when switching languages)
   */
  const resetReels = useCallback(() => {
    setReels([]);
    setHasMore(true);
    setError(null);
  }, []);

  const contextValue = useMemo(() => ({
    reels,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchReels,
    resetReels,
  }), [
    reels,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchReels,
    resetReels,
  ]);

  return (
    <ReelsContext.Provider value={contextValue}>
      {children}
    </ReelsContext.Provider>
  );
};

export const useReelsContext = () => {
  const context = useContext(ReelsContext);
  if (!context) {
    throw new Error('useReelsContext must be used within a ReelsProvider');
  }
  return context;
};

export default ReelsContext;
