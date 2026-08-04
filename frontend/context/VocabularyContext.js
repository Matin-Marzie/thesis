import { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { vocabularyReducer, vocabularyChangesReducer, DEFAULT_VOCABULARY_CHANGES, VOCABULARY_ACTIONS } from '../hooks/useVocabulary';
import { DEFAULT_USER_VOCABULARY, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} VocabularyContextType
 * @property {Object} userVocabulary
 * @property {Function} setUserVocabulary
 * @property {Function} vocabularyDispatch
 * @property {(wordIds: number[], mastery_level?: number) => void} bulkAddVocabulary
 * @property {Object} vocabularyChanges
 * @property {Function} setVocabularyChanges
 * @property {boolean} isVocabularyLoaded
 * @property {boolean} isVocabularyChangesLoaded
 */

/** @type {import('react').Context<VocabularyContextType>} */
const VocabularyContext = createContext({});

export const VocabularyProvider = ({ children }) => {
  const {
    value: userVocabulary,
    setValue: setUserVocabulary,
    isLoaded: isVocabularyLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_VOCABULARY, DEFAULT_USER_VOCABULARY, validators.userVocabulary);

  const {
    value: vocabularyChanges,
    setValue: setVocabularyChanges,
    isLoaded: isVocabularyChangesLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_VOCABULARY_CHANGES, DEFAULT_VOCABULARY_CHANGES, validators.vocabularyChanges);

  // Dispatch that applies reducer logic, tracks changes, and persists both
  const vocabularyDispatch = useCallback((action) => {
    setUserVocabulary((prev) => vocabularyReducer(prev, action));
    if (action.type !== VOCABULARY_ACTIONS.SET) {
      setVocabularyChanges((prev) => vocabularyChangesReducer(prev, action));
    }
  }, [setUserVocabulary, setVocabularyChanges]);

  // Bulk add vocabulary without tracking changes(vocabularyChanges) (for onboarding auto-fill)
  const bulkAddVocabulary = useCallback((wordIds, mastery_level = 3) => {
    setUserVocabulary((prev) => vocabularyReducer(prev, {
      type: VOCABULARY_ACTIONS.ADD_MANY,
      payload: { wordIds, mastery_level },
    }));
    // Note: We do NOT update vocabularyChanges here - these are not synced to backend
  }, [setUserVocabulary]);

  const value = {
    userVocabulary, setUserVocabulary, vocabularyDispatch, bulkAddVocabulary,
    vocabularyChanges, setVocabularyChanges,
    isVocabularyLoaded, isVocabularyChangesLoaded,
  };

  return <VocabularyContext.Provider value={value}>{children}</VocabularyContext.Provider>;
};

// Custom hook to use the VocabularyContext
export const useVocabularyContext = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabularyContext must be used within a VocabularyProvider');
  }
  return context;
};

export default VocabularyContext;
