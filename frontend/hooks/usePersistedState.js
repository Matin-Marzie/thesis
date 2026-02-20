import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Safely parse JSON with fallback
 */
const safeJSONParse = (str, fallback) => {
  if (!str || str === 'undefined' || str === 'null') return fallback;
  try {
    const parsed = JSON.parse(str);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch (e) {
    console.warn('[safeJSONParse] Failed to parse:', e.message);
    return fallback;
  }
};

/**
 * Hook for state that persists to AsyncStorage
 * @param {string} key - AsyncStorage key
 * @param {any} defaultValue - Default value if nothing stored
 * @param {function} [validator] - Optional function to validate loaded data
 * @returns {{ value: any, setValue: function, isLoaded: boolean }}
 */
export const usePersistedState = (key, defaultValue, validator = null) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitialLoadComplete = useRef(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedStr = await AsyncStorage.getItem(key);
        const loaded = safeJSONParse(storedStr, null);

        if (loaded !== null) {
          // If validator provided, use it to check data
          if (validator) {
            if (validator(loaded)) {
              setValue(loaded);
            } else {
            }
          } else {
            setValue(loaded);
          }
        }
      } catch (e) {
      } finally {
        isInitialLoadComplete.current = true;
        setIsLoaded(true);
      }
    })();
  }, [key]);

  // Persist to AsyncStorage whenever value changes (after initial load)
  useEffect(() => {
    if (!isInitialLoadComplete.current) return;

    (async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`[${key}] Failed to persist to AsyncStorage:`, e);
      }
    })();
  }, [key, value]);

  // Wrapped setValue that also marks changes
  const setPersistedValue = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  return { value, setValue: setPersistedValue, isLoaded };
};

/**
 * Hook to clear specific keys from AsyncStorage
 */
export const clearPersistedKeys = async (keys) => {
  try {
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
  } catch (e) {
    console.error('[clearPersistedKeys] Error:', e);
  }
};

/**
 * Hook to clear all AsyncStorage
 */
export const clearAllPersistedData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('[clearAllPersistedData] Error:', e);
  }
};
