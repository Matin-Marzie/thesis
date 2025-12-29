import { useEffect, useMemo, useRef, useState, useCallback, useContext, use } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDictionaryByCodes } from '../api/dictionary';
import { useAppContext } from '../context/AppContext';

export const useDictionary = () => {
  const { userProgress, isOnline } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const DICTIONARY_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const requestIdRef = useRef(0);

  // ✅ stable derived state - triggers refetch when is_current_language changes
  const currentLang = useMemo(() => {
    return userProgress?.languages?.find(l => l.is_current_language) || null;
  }, [userProgress?.languages]);

  const cacheKey = useMemo(() => {
    if (!currentLang) return null;
    return `dictionary:${currentLang.learning_language.code}:${currentLang.native_language.code}`;
  }, [
    currentLang?.learning_language.code,
    currentLang?.native_language.code,
  ]);

  // ✅ stable callback
  const loadDictionary = useCallback(async () => {
    if (!currentLang || !cacheKey) return;

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

    // --- Fresh cache ---
    if (
      cached?.timestamp &&
      Date.now() - cached.timestamp < DICTIONARY_TTL
    ) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // --- Offline strategy ---
    if (!isOnline) {
      if (cached?.data) setData(cached.data);
      setLoading(false);
      return;
    }

    // --- Use stale cache while fetching ---
    if (cached?.data) {
      setData(cached.data);
    }

    try {
      const res = await getDictionaryByCodes(
        currentLang.learning_language.code,
        currentLang.native_language.code
      );

      // race-condition guard
      if (requestIdRef.current !== currentRequestId) return;

      const payload = {
        data: res,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
      setData(res);

    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(err.message);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [
    cacheKey,
    currentLang,
    isOnline,
  ]);

  // Trigger refetch only when currentLang changes
  useEffect(() => {
    loadDictionary();
  }, [loadDictionary]);

  return {
    dictionary: data,
    dictionaryLoading: loading,
    dictionaryError: error,
    reload: loadDictionary,
  };
};
