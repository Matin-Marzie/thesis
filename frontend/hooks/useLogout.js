import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens } from '../api/tokens';
import { logoutUser } from '../api/auth';
import { clearAllPersistedData } from './usePersistedState';
import { resetSyncState } from './useBackendSync';
import { useProfile } from '../context/ProfileContext';
import { useProgress } from '../context/ProgressContext';
import { useVocabularyContext } from '../context/VocabularyContext';
import { useSentenceContext } from '../context/SentenceContext';
import { useUserReels } from '../context/UserReelsContext';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_PROGRESS,
  DEFAULT_USER_VOCABULARY,
  DEFAULT_USER_SENTENCES,
  DEFAULT_USER_REELS,
  STORAGE_KEYS,
} from '../constants/defaults';
import { DEFAULT_VOCABULARY_CHANGES } from './useVocabulary';
import { DEFAULT_SENTENCE_CHANGES } from './useSentences';

/**
 * Custom hook that encapsulates all logout and data-clearing logic.
 * Pulls dependencies directly from the domain contexts.
 *
 * @returns {{ logout: (clearAllData?: boolean) => Promise<void>, clearAllOfflineData: () => Promise<void> }}
 */
export function useLogout() {
  const { setUserProfile } = useProfile();
  const { setUserProgress } = useProgress();
  const { setUserVocabulary, setVocabularyChanges } = useVocabularyContext();
  const { setUserSentences, setSentenceChanges } = useSentenceContext();
  const { setUserReels } = useUserReels();
  const { setIsAuthenticated, setHasCompletedOnboarding, forceSync } = useAuth();

  const logout = useCallback(async (clearAllData = false) => {
    try {
      // Sync any pending changes before logging out (token still valid here)
      try {
        await forceSync();
      } catch (syncError) {
        console.warn('[logout] Pre-logout sync failed, proceeding with logout:', syncError.message);
      }

      // Tell backend to invalidate refresh token (while token is still valid)
      try {
        await logoutUser();
      } catch (logoutError) {
        console.warn('[logout] Backend logout failed, proceeding:', logoutError.message);
      }

      // Stop sync listeners, then clear tokens
      resetSyncState();
      await clearTokens();

      if (clearAllData) {
        await clearAllPersistedData();
        setUserProgress(DEFAULT_USER_PROGRESS);
        setUserVocabulary(DEFAULT_USER_VOCABULARY);
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
        setUserSentences(DEFAULT_USER_SENTENCES);
        setSentenceChanges(DEFAULT_SENTENCE_CHANGES);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_VOCABULARY_CHANGES);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_SENTENCE_CHANGES);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_REELS);
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
        setSentenceChanges(DEFAULT_SENTENCE_CHANGES);
      }

      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserProfile(DEFAULT_USER_PROFILE);
      setUserReels(DEFAULT_USER_REELS);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [setUserProfile, setUserProgress, setUserVocabulary, setVocabularyChanges, setUserSentences, setSentenceChanges, setUserReels, setIsAuthenticated, setHasCompletedOnboarding, forceSync]);

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