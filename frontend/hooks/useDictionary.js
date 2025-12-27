import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDictionaryByCodes } from '../api/dictionary';

export const useDictionary = ({ user, enabled, isOnline }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const DICTIONARY_TTL = 3 * 24 * 60 * 60 * 1000;
  const requestIdRef = useRef(0);

  // ✅ stable derived state
  const currentLang = useMemo(() => {
    return user?.languages?.find(l => l.is_current_language) || null;
  }, [user?.languages]);

  const cacheKey = useMemo(() => {
    if (!currentLang) return null;
    return `dictionary:${currentLang.learning_language_code}:${currentLang.native_language_code}`;
  }, [
    currentLang?.learning_language_code,
    currentLang?.native_language_code,
  ]);

  // ✅ stable callback (no eslint hack)
  const loadDictionary = useCallback(async () => {
    if (!enabled || !currentLang || !cacheKey) return;

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
        currentLang.learning_language_code,
        currentLang.native_language_code
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
    enabled,
    isOnline,
    cacheKey,
    currentLang,
  ]);

  // ✅ eslint-compliant effect
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
