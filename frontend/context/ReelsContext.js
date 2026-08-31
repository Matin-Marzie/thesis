import { createContext, useState, useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { fetchReels as fetchReelsApi } from '../api/reels';
import { useProgress } from './ProgressContext';
import { useAuth } from './AuthContext';
import { REELS_LIMIT } from '../constants/Reels';

/**
 * @typedef {Object} Reel
 * @property {number} id
 * @property {string} url
 * @property {string} thumbnail_url
 * @property {string|null} title
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
 * @property {(reel: Reel) => void} prependReel
 */

/** @type {import('react').Context<ReelsContextType>} */
const ReelsContext = createContext({});

export const ReelsProvider = ({ children }) => {
  const { userProgress, isProgressLoaded } = useProgress();
  const { isAuthenticated } = useAuth();
  
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
   * A sentence carries every available translation (all languages) - reels-service
   * caches the whole set rather than picking one server-side, so the same
   * cached dialogue serves every native language. Resolve the one matching
   * this viewer's native language once here, so downstream components can
   * keep reading a plain `sentence.translation` string as before.
   */
  const resolveSentenceTranslation = useCallback((sentence) => {
    const match = sentence.translations?.find((t) => t.language_code === nativeLanguageCode);
    return match?.text ?? null;
  }, [nativeLanguageCode]);

  const resolveReelTranslations = useCallback((reel) => {
    const sentences = reel?.dialogue?.sentences;
    if (!sentences) return reel;
    return {
      ...reel,
      dialogue: {
        ...reel.dialogue,
        sentences: sentences.map((sentence) => ({
          ...sentence,
          translation: resolveSentenceTranslation(sentence),
        })),
      },
    };
  }, [resolveSentenceTranslation]);

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

      const newReels = (response?.reels || []).map(resolveReelTranslations);
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
    resolveReelTranslations,
  ]);

  /**
   * Reset reels state (useful when switching languages)
   */
  const resetReels = useCallback(() => {
    setReels([]);
    setHasMore(true);
    setError(null);
  }, []);

  /**
   * Prepend a freshly-created reel to the feed (optimistic UI after publish).
   * reels-service's GET /reels is a random sample with no get-by-id / created-by
   * filter, so a refetch has no guarantee of surfacing the new reel - this
   * client-built copy is shown instead until the next natural refresh.
   */
  const prependReel = useCallback((reel) => {
    setReels((prev) => [reel, ...prev.filter((r) => r.id !== reel.id)]);
  }, []);

  // Auto-reset and refetch when the active learning language changes (e.g.
  // via the language switch sheet). Mirrors DictionaryContext's auto-fetch
  // effect - reacting to the language codes here (instead of having callers
  // invoke fetchReels themselves) avoids a stale-closure trap: a caller that
  // just updated userProgress and immediately called the fetchReels it held
  // from render would still be holding the OLD language's closure, since
  // this provider hasn't re-rendered with the new userProgress yet.
  //
  // Two things this must NOT treat as a "switch":
  //  1. Any change before isProgressLoaded - learningLanguageCode/nativeLanguageCode
  //     fall back to hardcoded defaults until persisted state loads, so the
  //     load itself looks like a language change.
  //  2. The specific render where isProgressLoaded first flips true - that's
  //     initial hydration to the user's real language, not a switch.
  // Only changes observed after both have settled are genuine switches.
  const languageKey = `${learningLanguageCode}:${nativeLanguageCode}`;
  const prevLanguageKeyRef = useRef(languageKey);
  const hasHydratedRef = useRef(false);
  useEffect(() => {
    if (!isProgressLoaded) {
      prevLanguageKeyRef.current = languageKey;
      return;
    }
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      prevLanguageKeyRef.current = languageKey;
      return;
    }
    if (prevLanguageKeyRef.current === languageKey) return;
    prevLanguageKeyRef.current = languageKey;
    setReels([]);
    setHasMore(true);
    setError(null);
    fetchReels(true);
  }, [languageKey, fetchReels, isProgressLoaded]);

  const contextValue = useMemo(() => ({
    reels,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchReels,
    resetReels,
    prependReel,
  }), [
    reels,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchReels,
    resetReels,
    prependReel,
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
