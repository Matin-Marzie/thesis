import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getRefreshToken } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { getCurrentUser } from '../api/user';

// Custom hooks
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { usePersistedState } from '../hooks/usePersistedState';
import { useBackendSync } from '../hooks/useBackendSync';

// Vocabulary reducer
import { vocabularyReducer } from '../hooks/useVocabulary';

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
 * @property {() => Promise<void>} checkAuthStatus
 * @property {(clearAllData?: boolean) => Promise<void>} logout
 */

/** @type {import('react').Context<AppContextType>} */
const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Network status from custom hook
  const isOnline = useNetworkStatus();

  // On app load, Persisted state(fetch from localStorage) from custom hooks
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

  // Dispatch that applies reducer logic and persists via usePersistedState
  const vocabularyDispatch = useCallback((action) => {
    setUserVocabulary((prev) => vocabularyReducer(prev, action));
  }, [setUserVocabulary]);

  // Backend sync from custom hook
  useBackendSync(isOnline, userProgress, isProgressLoaded, userVocabulary, isVocabularyLoaded);

  // Update user profile helper
  const updateUserProfile = useCallback(async (newUserProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      ...newUserProfile,
    }));
  }, [setUserProfile]);

  // Check for existing auth session on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            // userProfile, userProgress, and userVocabulary will be loaded from AsyncStorage by their respective hooks.
            const data = await getCurrentUser();
            // setUserProfile(data?.user_profile);
            // setUserProgress(data?.user_progress);
            // setUserVocabulary(data?.user_vocabulary);
            setIsAuthenticated(true);
            setHasCompletedOnboarding(true);
            return;
          }
        } catch {

        }
      }

      const onboardingComplete = (await SecureStore.getItemAsync('onboarding_complete')) === 'true';
      setHasCompletedOnboarding(onboardingComplete);
      setIsAuthenticated(false);

    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary]);

  // Initialization Logic of Application
  // 1. Wait for persisted state to load
  // 2. Check auth status and if dirty data needs to be synced
  useEffect(() => {
    if (isProfileLoaded && isProgressLoaded && isVocabularyLoaded) {
      checkAuthStatus();
    }
  }, [isProfileLoaded, isProgressLoaded, isVocabularyLoaded, checkAuthStatus]);

  const value = {
    userProfile, setUserProfile, updateUserProfile,
    userProgress, setUserProgress,
    userVocabulary, vocabularyDispatch,
    isAuthenticated, setIsAuthenticated, checkAuthStatus,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    isOnline,
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
