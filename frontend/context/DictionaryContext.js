import { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDictionaryByCodes } from '../api/dictionary';
import { useAppContext } from './AppContext';

const DICTIONARY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * @typedef {Object} DictionaryContextType
 * @property {Object|null} dictionary - The dictionary data
 * @property {boolean} dictionaryLoading - Whether dictionary is loading
 * @property {string|null} dictionaryError - Error message if any
 * @property {(learningCode: string, nativeCode: string) => Promise<Object|null>} fetchDictionary - Manual fetch function, returns dictionary data
 * @property {() => Promise<void>} reload - Reload current dictionary
 */

/** @type {import('react').Context<DictionaryContextType>} */
const DictionaryContext = createContext({});

export const DictionaryProvider = ({ children }) => {
  const { userProgress, isOnline, hasCompletedOnboarding } = useAppContext();

  const [dictionary, setDictionary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  // Derive current language from userProgress
  const currentLang = useMemo(() => {
    return userProgress?.languages?.find(l => l.is_current_language) || null;
  }, [userProgress?.languages]);

  // Generate cache key for current language pair
  const getCacheKey = useCallback((learningCode, nativeCode) => {
    return `dictionary:${learningCode}:${nativeCode}`;
  }, []);

  // Core fetch function - can be called with explicit codes or uses currentLang
  // Returns the dictionary data (or null if failed)
  const fetchDictionary = useCallback(async (learningCode, nativeCode) => {
    if (!learningCode || !nativeCode) return null;

    const cacheKey = getCacheKey(learningCode, nativeCode);

    setLoading(true);
    setError(null);

    const currentRequestId = ++requestIdRef.current;

    // --- Read cache safely ---
    let cached = null;
    try {
      const cachedStr = await AsyncStorage.getItem(cacheKey);
      cached = cachedStr ? JSON.parse(cachedStr) : null;
    } catch (e) {
      console.warn('[Dictionary] Cache parse failed:', e);
    }

    // --- Fresh cache: return early ---
    if (cached?.timestamp && Date.now() - cached.timestamp < DICTIONARY_TTL) {
      if (requestIdRef.current === currentRequestId) {
        setDictionary(cached.data);
        setLoading(false);
      }
      return cached.data;
    }

    // --- Offline strategy ---
    if (!isOnline) {
      if (requestIdRef.current === currentRequestId) {
        if (cached?.data) setDictionary(cached.data);
        setLoading(false);
      }
      return cached?.data || null;
    }

    // --- Use stale cache while fetching ---
    if (cached?.data && requestIdRef.current === currentRequestId) {
      setDictionary(cached.data);
    }

    try {
      const res = await getDictionaryByCodes(learningCode, nativeCode);

      // Race-condition guard
      if (requestIdRef.current !== currentRequestId) return null;

      const payload = {
        data: res,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
      setDictionary(res);
      return res;
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return null;
      setError(err.message);
      return null;
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [getCacheKey, isOnline]);

  // Reload function - refetches using current language
  const reload = useCallback(async () => {
    if (!currentLang) return;
    await fetchDictionary(
      currentLang.learning_language.code,
      currentLang.native_language.code
    );
  }, [currentLang, fetchDictionary]);

  // Auto-fetch when current language changes (only if onboarding is completed)
  useEffect(() => {
    if (hasCompletedOnboarding && currentLang) {
      fetchDictionary(
        currentLang.learning_language.code,
        currentLang.native_language.code
      );
    }
  }, [
    hasCompletedOnboarding,
    currentLang?.learning_language?.code,
    currentLang?.native_language?.code,
    fetchDictionary,
  ]);

  const value = {
    dictionary,
    dictionaryLoading: loading,
    dictionaryError: error,
    fetchDictionary,
    reload,
  };

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
};

// Custom hook to use the DictionaryContext
export const useDictionaryContext = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionaryContext must be used within a DictionaryProvider');
  }
  return context;
};

export default DictionaryContext;
