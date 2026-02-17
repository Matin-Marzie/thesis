import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getRefreshToken, clearTokens } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { getCurrentUser } from '../api/user';

// Custom hooks
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { usePersistedState, clearAllPersistedData } from '../hooks/usePersistedState';
import { useBackendSync } from '../hooks/useBackendSync';

// Vocabulary reducer
import { vocabularyReducer, VOCABULARY_ACTIONS } from '../hooks/useVocabulary';

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

  // Persisted state from custom hooks
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

  // Backend sync function (TODO: implement actual API call)
  const syncToBackend = useCallback(async () => {
    // TODO: Implement actual backend sync
    // const response = await fetch('/api/v1/users/sync', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userProfile, userProgress, userVocabulary }),
    // });
    console.log('[syncToBackend] Would sync to backend (not implemented)');
  }, []);

  // Backend sync from custom hook
  const { markDirty, resetSyncState } = useBackendSync(isOnline, syncToBackend);

  // Mark dirty when state changes
  useEffect(() => {
    if (isProfileLoaded) markDirty();
  }, [userProfile, isProfileLoaded, markDirty]);

  useEffect(() => {
    if (isProgressLoaded) markDirty();
  }, [userProgress, isProgressLoaded, markDirty]);

  useEffect(() => {
    if (isVocabularyLoaded) markDirty();
  }, [userVocabulary, isVocabularyLoaded, markDirty]);

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
            const data = await getCurrentUser();
            setUserProfile(data?.user_profile);
            setUserProgress(data?.user_progress);
            setUserVocabulary(data?.user_vocabulary);
            setIsAuthenticated(true);
            setHasCompletedOnboarding(true);
            return;
          }
        } catch {
          await clearTokens();
        }
      }

      const onboardingComplete = (await SecureStore.getItemAsync('onboarding_complete')) === 'true';
      setHasCompletedOnboarding(onboardingComplete);
      setIsAuthenticated(false);

    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      await clearTokens();
      setUserProfile(DEFAULT_USER_PROFILE);
      setUserProgress(DEFAULT_USER_PROGRESS);
    } finally {
      setIsLoading(false);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary]);

  // Check auth status once all persisted state is loaded
  useEffect(() => {
    if (isProfileLoaded && isProgressLoaded && isVocabularyLoaded) {
      console.log('[AppProvider] All state loaded, checking auth status');
      checkAuthStatus();
    }
  }, [isProfileLoaded, isProgressLoaded, isVocabularyLoaded, checkAuthStatus]);

  // Logout function
  const logout = useCallback(async (clearAllData = false) => {
    try {
      await clearTokens();

      if (clearAllData) {
        await clearAllPersistedData();
        setUserProgress(DEFAULT_USER_PROGRESS);
        setUserVocabulary(DEFAULT_USER_VOCABULARY);
        console.log('[logout] Cleared all data');
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        console.log('[logout] Cleared user profile, preserving progress');
      }

      await SecureStore.setItemAsync('onboarding_complete', 'false');
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserProfile(DEFAULT_USER_PROFILE);
      resetSyncState();

    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary, resetSyncState]);

  // Clear all offline data
  const clearAllOfflineData = useCallback(async () => {
    try {
      await clearAllPersistedData();
      setUserProfile(DEFAULT_USER_PROFILE);
      setUserProgress(DEFAULT_USER_PROGRESS);
      setUserVocabulary(DEFAULT_USER_VOCABULARY);
      resetSyncState();
      console.log('[clearAllOfflineData] All offline data cleared');
    } catch (error) {
      console.error('[clearAllOfflineData] Error:', error);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary, resetSyncState]);

  const value = {
    userProfile, setUserProfile, updateUserProfile,
    userProgress, setUserProgress,
    userVocabulary, vocabularyDispatch,
    isAuthenticated, setIsAuthenticated, checkAuthStatus,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    isOnline,
    logout,
    clearAllOfflineData,
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
