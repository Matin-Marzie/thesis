import { useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppContext from '../context/AppContext';

/**
 * @typedef {Object} WordProgress
 * @property {string} language_id
 * @property {number} mastery_level
 * @property {string} last_review
 * @property {string} created_at
 */

const VOCABULARY_STORAGE_KEY = 'user_vocabulary';

export const useVocabulary = () => {
  const { userVocabulary, setUserVocabulary } = useContext(AppContext);

  // Sync to AsyncStorage whenever vocabulary changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(userVocabulary));
      } catch (e) {
        console.error('[useVocabulary] Failed to sync to AsyncStorage:', e);
      }
    })();
  }, [userVocabulary]);


  // Add or update a single word
  const addOrUpdateWord = useCallback((wordId, data) => {
    setUserVocabulary((prev) => ({
      ...prev,
      [wordId]: data, // O(1) operation
    }));
  }, [setUserVocabulary]);


  // Remove a word by ID
  const removeWord = useCallback((wordId) => {
    setUserVocabulary((prev) => {
      const updated = { ...prev };
      delete updated[wordId]; // O(1) operation
      return updated;
    });
  }, [setUserVocabulary]);

  return {
    userVocabulary,
    addOrUpdateWord,
    removeWord,
  };
};
