import { createContext, useContext, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_USER_PROGRESS, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} ProgressContextType
 * @property {Object} userProgress
 * @property {Function} setUserProgress
 * @property {boolean} isProgressLoaded
 */

/** @type {import('react').Context<ProgressContextType>} */
const ProgressContext = createContext({});

export const ProgressProvider = ({ children }) => {
  const {
    value: userProgress,
    setValue: setUserProgress,
    isLoaded: isProgressLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_PROGRESS, DEFAULT_USER_PROGRESS, validators.userProgress);

  const value = useMemo(() => ({
    userProgress, setUserProgress,
    isProgressLoaded,
  }), [userProgress, setUserProgress, isProgressLoaded]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

// Custom hook to use the ProgressContext
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
