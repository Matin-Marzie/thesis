import { createContext, useContext, useCallback, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { sentenceReducer, sentenceChangesReducer, DEFAULT_SENTENCE_CHANGES, SENTENCE_ACTIONS } from '../hooks/useSentences';
import { DEFAULT_USER_SENTENCES, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} SentenceContextType
 * @property {Object} userSentences
 * @property {Function} setUserSentences
 * @property {Function} sentenceDispatch
 * @property {Object} sentenceChanges
 * @property {Function} setSentenceChanges
 * @property {boolean} isSentencesLoaded
 * @property {boolean} isSentenceChangesLoaded
 */

/** @type {import('react').Context<SentenceContextType>} */
const SentenceContext = createContext({});

export const SentenceProvider = ({ children }) => {
  const {
    value: userSentences,
    setValue: setUserSentences,
    isLoaded: isSentencesLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_SENTENCES, DEFAULT_USER_SENTENCES, validators.userSentences);

  const {
    value: sentenceChanges,
    setValue: setSentenceChanges,
    isLoaded: isSentenceChangesLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_SENTENCE_CHANGES, DEFAULT_SENTENCE_CHANGES, validators.sentenceChanges);

  // Dispatch that applies reducer logic, tracks changes, and persists both
  const sentenceDispatch = useCallback((action) => {
    setUserSentences((prev) => sentenceReducer(prev, action));
    if (action.type !== SENTENCE_ACTIONS.SET) {
      setSentenceChanges((prev) => sentenceChangesReducer(prev, action));
    }
  }, [setUserSentences, setSentenceChanges]);

  const value = useMemo(() => ({
    userSentences, setUserSentences, sentenceDispatch,
    sentenceChanges, setSentenceChanges,
    isSentencesLoaded, isSentenceChangesLoaded,
  }), [
    userSentences, setUserSentences, sentenceDispatch,
    sentenceChanges, setSentenceChanges,
    isSentencesLoaded, isSentenceChangesLoaded,
  ]);

  return <SentenceContext.Provider value={value}>{children}</SentenceContext.Provider>;
};

// Custom hook to use the SentenceContext
export const useSentenceContext = () => {
  const context = useContext(SentenceContext);
  if (!context) {
    throw new Error('useSentenceContext must be used within a SentenceProvider');
  }
  return context;
};

export default SentenceContext;
