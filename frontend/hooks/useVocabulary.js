import { useCallback, useContext } from 'react';
import AppContext from '../context/AppContext';

/**
 * @typedef {Object} WordProgress
 * @property {string} language_id
 * @property {number} mastery_level
 * @property {string} last_review
 * @property {string} created_at
 */

export const useVocabulary = () => {
  const { userVocabulary, setUserVocabulary } = useContext(AppContext);

  // Note: AsyncStorage persistence is now handled centrally in AppContext
  // This hook only provides convenient methods to manipulate vocabulary


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
