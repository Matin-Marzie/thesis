import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { clearTokens } from '../api/tokens';
import { clearAllPersistedData } from './usePersistedState';
import { resetSyncState } from './useBackendSync';
import { useAppContext } from '../context/AppContext';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_PROGRESS,
  DEFAULT_USER_VOCABULARY,
  STORAGE_KEYS,
} from '../constants/defaults';
import { DEFAULT_VOCABULARY_CHANGES } from './useVocabulary';

/**
 * Custom hook that encapsulates all logout and data-clearing logic.
 * Pulls dependencies directly from AppContext.
 *
 * @returns {{ logout: (clearAllData?: boolean) => Promise<void>, clearAllOfflineData: () => Promise<void> }}
 */
export function useLogout() {
  const {
    setUserProfile,
    setUserProgress,
    setUserVocabulary,
    setVocabularyChanges,
    setIsAuthenticated,
    setHasCompletedOnboarding,
    forceSync,
  } = useAppContext();

  const logout = useCallback(async (clearAllData = false) => {
    try {
      // Sync any pending changes before logging out
      await forceSync();

      await clearTokens();

      if (clearAllData) {
        await clearAllPersistedData();
        setUserProgress(DEFAULT_USER_PROGRESS);
        setUserVocabulary(DEFAULT_USER_VOCABULARY);
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_VOCABULARY_CHANGES);
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
      }

      await SecureStore.setItemAsync('onboarding_complete', 'false');
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserProfile(DEFAULT_USER_PROFILE);
      resetSyncState();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary, setVocabularyChanges, setIsAuthenticated, setHasCompletedOnboarding, forceSync]);

  const clearAllOfflineData = useCallback(async () => {
    try {
      await clearAllPersistedData();
      setUserProfile(DEFAULT_USER_PROFILE);
      setUserProgress(DEFAULT_USER_PROGRESS);
      resetSyncState();
      console.log('[clearAllOfflineData] All offline data cleared');
    } catch (error) {
      console.error('[clearAllOfflineData] Error:', error);
    }
  }, [setUserProfile, setUserProgress]);

  return { logout, clearAllOfflineData };
}