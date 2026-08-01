import { useCallback } from 'react';
import { deleteAccount as deleteAccountRequest } from '../api/user';
import { clearTokens } from '../api/tokens';
import { clearAllPersistedData } from './usePersistedState';
import { resetSyncState } from './useBackendSync';
import { useAppContext } from '../context/AppContext';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_PROGRESS,
  DEFAULT_USER_VOCABULARY,
} from '../constants/defaults';
import { DEFAULT_VOCABULARY_CHANGES } from './useVocabulary';

/**
 * Custom hook that permanently deletes the user's account on the backend,
 * then clears local session/data exactly like a full logout.
 * If the backend request fails, local data is left untouched.
 *
 * @returns {{ deleteAccount: () => Promise<void> }}
 */
export function useDeleteAccount() {
  const {
    setUserProfile,
    setUserProgress,
    setUserVocabulary,
    setVocabularyChanges,
    setIsAuthenticated,
    setHasCompletedOnboarding,
  } = useAppContext();

  const deleteAccount = useCallback(async () => {
    // Let this throw on failure - only clear local session once the account is actually gone
    await deleteAccountRequest();

    resetSyncState();
    await clearTokens();
    await clearAllPersistedData();

    setUserProgress(DEFAULT_USER_PROGRESS);
    setUserVocabulary(DEFAULT_USER_VOCABULARY);
    setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setUserProfile(DEFAULT_USER_PROFILE);
  }, [setUserProfile, setUserProgress, setUserVocabulary, setVocabularyChanges, setIsAuthenticated, setHasCompletedOnboarding]);

  return { deleteAccount };
}
