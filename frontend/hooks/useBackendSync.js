import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/defaults';
import { DEFAULT_VOCABULARY_CHANGES } from './useVocabulary';
import { syncUserData } from '../api/user';

const SYNC_INTERVAL_MS = 1000 * 60 * 5; // 5 minute

// Module-scoped sync state — shared across the single hook instance
let hasUnsyncedChanges = false;
let lastSyncTime = null;
let hasShownSyncError = false; // Track if we've already shown error banner for sync

/**
 * Reset sync state (e.g., on logout).
 * Can be imported and called directly without going through context.
 */
export const resetSyncState = () => {
  hasUnsyncedChanges = false;
  lastSyncTime = null;
  hasShownSyncError = false;
};

/**
 * Hook to manage syncing userProgress and userVocabulary with the backend.
 *
 * Sync triggers:
 * - Every 1 minute (if there are unsynced changes)
 * - When isOnline transitions from false → true
 * - When the app goes to background/inactive
 *
 * Uses refs internally so sync always reads the latest data
 * without causing effect re-registrations.
 *
 * @param {boolean} isOnline - Network connectivity status
 * @param {Object} userProgress - Current user progress state
 * @param {boolean} isProgressLoaded - Whether userProgress has loaded from storage
 * @param {Object} vocabularyChanges - Pending vocabulary changes { inserts, updates, deletes }
 * @param {boolean} isVocabularyChangesLoaded - Whether vocabularyChanges has loaded from storage
 * @returns {{ forceSync: () => Promise<boolean> }} forceSync resolves true if nothing is left
 *   unsynced afterwards, false if the sync attempt failed and changes are still pending
 */

export const useBackendSync = (isOnline, isAuthenticated, userProgress, isProgressLoaded, vocabularyChanges, isVocabularyChangesLoaded, setVocabularyChanges) => {
  const syncIntervalRef = useRef(null);
  const wasOnlineRef = useRef(isOnline);
  const isOnlineRef = useRef(isOnline);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Keep a ref of the latest data to avoid stale closures
  const userProgressRef = useRef(userProgress);

  // Track whether the initial load has been skipped (to avoid syncing defaults)
  const hasInitializedRef = useRef(false);
  // Last coins/energy values we know are reflected server-side, so we can
  // tell a genuine local change apart from userProgress simply being
  // replaced by reference (e.g. a language switch or a fresh SET from the
  // server carries no new coins/energy, so it isn't something to push back).
  const lastSyncedProgressRef = useRef({ coins: userProgress.coins, energy: userProgress.energy });

  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { userProgressRef.current = userProgress; }, [userProgress]);

  // Auto-mark dirty only when something that actually needs syncing changed:
  // coins/energy, or a pending vocabulary insert/update/delete. Reference
  // changes to userProgress/userVocabulary that don't touch those (switching
  // languages, applying a SET from the server, bulk-seeding vocabulary
  // during onboarding) must NOT mark dirty - there's nothing new to push.
  useEffect(() => {

    if (!isProgressLoaded || !isVocabularyChangesLoaded) return;

    const hasVocabChanges =
      Object.keys(vocabularyChanges?.inserts || {}).length > 0 ||
      Object.keys(vocabularyChanges?.updates || {}).length > 0 ||
      Object.keys(vocabularyChanges?.deletes || {}).length > 0;

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      lastSyncedProgressRef.current = { coins: userProgress.coins, energy: userProgress.energy };
      // Changes carried over from a previous session (e.g. app closed before
      // they synced) are real and still need flushing - only the progress
      // baseline itself should skip marking dirty on this first run.
      if (hasVocabChanges) hasUnsyncedChanges = true;
      return;
    }

    const progressChanged =
      userProgress.coins !== lastSyncedProgressRef.current.coins ||
      userProgress.energy !== lastSyncedProgressRef.current.energy;

    if (progressChanged) {
      lastSyncedProgressRef.current = { coins: userProgress.coins, energy: userProgress.energy };
    }

    if (progressChanged || hasVocabChanges) {
      hasUnsyncedChanges = true;
    }
  }, [userProgress.coins, userProgress.energy, vocabularyChanges, isProgressLoaded, isVocabularyChangesLoaded]);

  // Sync to backend — only runs if online, authenticated, and there are unsynced changes.
  // Resolves true once nothing is left unsynced (synced successfully, or there
  // was nothing pending), false if a sync attempt failed and changes remain pending.
  const performSync = useCallback(async () => {
    if (!isOnlineRef.current) return true;
    if (!isAuthenticatedRef.current) return true;
    if (!hasUnsyncedChanges) return true;

    try {
      // Read vocabulary changes from AsyncStorage before syncing
      let vocabularyChanges = DEFAULT_VOCABULARY_CHANGES;
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_VOCABULARY_CHANGES);
        if (stored) {
          vocabularyChanges = JSON.parse(stored);
        }
      } catch (e) {
        console.error('[useBackendSync] Failed to read vocabulary changes:', e.message);
      }

      const hasVocabularyChanges =
        Object.keys(vocabularyChanges.inserts).length > 0 ||
        Object.keys(vocabularyChanges.updates).length > 0 ||
        Object.keys(vocabularyChanges.deletes).length > 0;

      const current_user_lang = userProgressRef.current?.languages?.find(lang => lang.is_current_language);
      const syncPayload = {
        user_progress: {
          coins: userProgressRef.current.coins,
          energy: userProgressRef.current.energy,
          current_user_languages_id: current_user_lang?.id,
        },
        vocabulary_changes: hasVocabularyChanges ? vocabularyChanges : undefined,
      };

      await syncUserData(syncPayload, { silent: hasShownSyncError });

      // Clear vocabulary changes via React state setter (usePersistedState will persist it)
      if (hasVocabularyChanges) {
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
      }

      hasUnsyncedChanges = false;
      lastSyncTime = Date.now();
      hasShownSyncError = false; // Reset on successful sync
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token is gone (logged out) — stop retrying
        hasUnsyncedChanges = false;
        return true;
      }
      // Mark that we've shown the error - subsequent retries will be silent
      hasShownSyncError = true;
      // Silently retry - don't spam console, banner was already shown on first error
      // Don't clear hasUnsyncedChanges — will retry on next interval
      return false;
    }
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current && hasUnsyncedChanges) {
      performSync();
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline, performSync]);

  // Auto-sync every 1 minute
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (hasUnsyncedChanges && isOnlineRef.current) {
        performSync();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, performSync]);

  // Sync on app going to background/inactive
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (hasUnsyncedChanges && isOnline) {
          performSync();
        }
      }
    });

    return () => subscription.remove();
  }, [isOnline, performSync]);

  // Exposed as "forceSync": sync immediately instead of waiting for the next
  // interval/trigger. A no-op (no network call) if nothing is actually
  // pending, since dirtiness is already tracked accurately above. Callers
  // that must not touch local data until it's safely on the server (e.g.
  // switching the current language) should check the resolved value before
  // proceeding.
  return { forceSync: performSync };
};