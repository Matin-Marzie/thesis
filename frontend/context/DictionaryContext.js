import { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDictionaryByCodes } from '../api/dictionary';
import { normalizeWord } from '../utils/wordNormalizer';
import { useProgress } from './ProgressContext';
import { useNetwork } from './NetworkContext';
import { useAuth } from './AuthContext';

const DICTIONARY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// The API (and the cache, which stores the raw API response) sends `words`
// as columnar JSON ({ columns, rows }) to avoid repeating the same keys
// across ~11k word objects. Expand it back to row objects once here so
// every other consumer (Wordle, WordOfWonders, VocabularySearchField, etc.)
// can keep reading `word.written_form` etc. as before.
function expandColumnarWords(words) {
  if (!words || Array.isArray(words)) return words ?? [];
  const { columns, rows } = words;
  if (!Array.isArray(columns) || !Array.isArray(rows)) return [];
  return rows.map((row) => {
    const obj = {};
    for (let i = 0; i < columns.length; i++) obj[columns[i]] = row[i];
    return obj;
  });
}

function expandDictionaryPayload(raw) {
  if (!raw) return raw;
  return { ...raw, words: expandColumnarWords(raw.words) };
}

/**
 * @typedef {Object} DictionaryContextType
 * @property {Object|null} dictionary - The dictionary data
 * @property {boolean} dictionaryLoading - Whether dictionary is loading
 * @property {string|null} dictionaryError - Error message if any
 * @property {(writtenForm: string) => Object[]} getWordsByWrittenForm - looks up dictionary word entries by written_form (normalized per the current learning language before hashing/comparing); homographs come back together in one array - disambiguate by id
 * @property {(learningCode: string, nativeCode: string) => Promise<Object|null>} fetchDictionary - Manual fetch function, returns dictionary data
 * @property {() => Promise<void>} reload - Reload current dictionary
 */

/** @type {import('react').Context<DictionaryContextType>} */
const DictionaryContext = createContext({});

export const DictionaryProvider = ({ children }) => {
  const { userProgress } = useProgress();
  const { isOnline } = useNetwork();
  const { hasCompletedOnboarding } = useAuth();

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
      const expanded = expandDictionaryPayload(cached.data);
      if (requestIdRef.current === currentRequestId) {
        setDictionary(expanded);
        setLoading(false);
      }
      return expanded;
    }

    // --- Offline strategy ---
    if (!isOnline) {
      const expanded = cached?.data ? expandDictionaryPayload(cached.data) : null;
      if (requestIdRef.current === currentRequestId) {
        if (expanded) setDictionary(expanded);
        setLoading(false);
      }
      return expanded;
    }

    // --- Use stale cache while fetching ---
    if (cached?.data && requestIdRef.current === currentRequestId) {
      setDictionary(expandDictionaryPayload(cached.data));
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
      const expanded = expandDictionaryPayload(res);
      setDictionary(expanded);
      return expanded;
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

  // Bucket dictionary words by written_form (normalized per the current
  // learning language via utils/wordNormalizer.js - trim/case/diacritics
  // don't matter for identity) so string lookups (e.g. resolving the word
  // tapped in a reel subtitle, or a Wordle/WordOfWonders guess) are O(1)
  // instead of scanning the full ~11k-word list. Homographs (same
  // written_form, different word id - e.g. different meaning/POS) share a
  // bucket; callers with a known id should disambiguate within it.
  const learningLanguageCode = currentLang?.learning_language?.code;

  const writtenFormBuckets = useMemo(() => {
    const map = Object.create(null);
    const words = dictionary?.words;
    if (!Array.isArray(words)) return map;

    for (const item of words) {
      const key = normalizeWord(item?.written_form, learningLanguageCode);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }

    return map;
  }, [dictionary, learningLanguageCode]);

  const getWordsByWrittenForm = useCallback((writtenForm) => {
    return writtenFormBuckets[normalizeWord(writtenForm, learningLanguageCode)] ?? [];
  }, [writtenFormBuckets, learningLanguageCode]);

  const value = useMemo(() => ({
    dictionary,
    dictionaryLoading: loading,
    dictionaryError: error,
    getWordsByWrittenForm,
    fetchDictionary,
    reload,
  }), [dictionary, loading, error, getWordsByWrittenForm, fetchDictionary, reload]);

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
