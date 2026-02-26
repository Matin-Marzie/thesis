import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRefreshToken } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';

// Custom hooks
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { usePersistedState } from '../hooks/usePersistedState';
import { useBackendSync } from '../hooks/useBackendSync';

// Vocabulary reducer & changes tracker
import { vocabularyReducer, vocabularyChangesReducer, DEFAULT_VOCABULARY_CHANGES, VOCABULARY_ACTIONS } from '../hooks/useVocabulary';

// Constants
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_PROGRESS,
  DEFAULT_USER_VOCABULARY,
  STORAGE_KEYS,
  validators,
} from '../constants/defaults';


/**
 * @typedef {Object} AppContextType
 * @property {Object} userProfile
 * @property {Object} userProgress
 * @property {Object} userVocabulary
 * @property {Function} vocabularyDispatch
 * @property {boolean} isAuthenticated
 * @property {boolean} hasCompletedOnboarding
 * @property {boolean} isLoading
 * @property {boolean} isOnline
 * @property {() => Promise<void>} initApp
 * @property {(clearAllData?: boolean) => Promise<void>} logout
 */

/** @type {import('react').Context<AppContextType>} */
const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBackendServerReachable, setIsBackendServerReachable] = useState(false);

  // Network status from custom hook
  const isOnline = useNetworkStatus();

  // [1] On app load, Persisted state(fetch from localStorage) from custom hooks
  const {
    value: hasCompletedOnboarding,
    setValue: setHasCompletedOnboarding,
    isLoaded: isOnboardingLoaded,
  } = usePersistedState(STORAGE_KEYS.ONBOARDING_COMPLETE, false, validators.onboardingComplete);

  const {
    value: userProfile,
    setValue: setUserProfile,
    isLoaded: isProfileLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE, validators.userProfile);

  const {
    value: userProgress,
    setValue: setUserProgress,
    isLoaded: isProgressLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_PROGRESS, DEFAULT_USER_PROGRESS, validators.userProgress);

  const {
    value: userVocabulary,
    setValue: setUserVocabulary,
    isLoaded: isVocabularyLoaded,
  } = usePersistedState(STORAGE_KEYS.USER_VOCABULARY, DEFAULT_USER_VOCABULARY, validators.userVocabulary);

  // Persisted vocabulary changes for offline sync tracking
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

  // Backend sync periodically from custom hook
  const { forceSync } = useBackendSync(isOnline, isAuthenticated, userProgress, isProgressLoaded, userVocabulary, isVocabularyLoaded, setVocabularyChanges);

  // Update user profile helper 
  const updateUserProfile = useCallback(async (newUserProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      ...newUserProfile,
    }));
  }, [setUserProfile]);

  // Check for existing auth session on app load
  const initApp = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();

      // [3] Check if there is a refreshToken:
      if (refreshToken) {
        // [4] 
        if (isOnline) {
          // [5] 
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            setIsAuthenticated(true);
            // Sync local changes with backend (push dirty data, then pull fresh data)
            await forceSync();
          }
        }
        // Offline mode - allow access to persisted data, sync will happen when they go online (handled by useBackendSync)
        else {
          setIsAuthenticated(true);
        }
      }
      // No refreshToken - guest user || onboarding not completed
      else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('initApp check error:', error);
    } finally {
      setIsLoading(false);
    }

    // [4] check isOnline, if yes:
    // refreshAcessToken
  }, [setUserProfile, setUserProgress, setUserVocabulary, isOnline, forceSync]);

  // Initialization Logic of Application
  // 1. Wait for persisted state to load
  // 2. Check auth status and if dirty data needs to be synced
  useEffect(() => {
    if (isProfileLoaded && isProgressLoaded && isVocabularyLoaded && isVocabularyChangesLoaded && isOnboardingLoaded && isOnline !== null) {
      // [1] All persisted state is loaded - check the code above
      // [2] reroute to /onboarding/landing if user hasn't completed onboarding - check /app/_layout.js
      initApp(); // (check auth, sync dirty data if online, etc)
    }
  }, [isProfileLoaded, isProgressLoaded, isVocabularyLoaded, isVocabularyChangesLoaded, isOnboardingLoaded, initApp, isOnline]);

  const value = {
    userProfile, setUserProfile, updateUserProfile,
    userProgress, setUserProgress,
    userVocabulary, setUserVocabulary, vocabularyDispatch,
    setVocabularyChanges,
    isAuthenticated, setIsAuthenticated, initApp,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    isOnline,
    forceSync,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
