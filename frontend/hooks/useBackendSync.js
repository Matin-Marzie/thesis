import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/defaults';
import { DEFAULT_VOCABULARY_CHANGES } from './useVocabulary';

const SYNC_INTERVAL_MS = 10000; // 1 minute

// Module-scoped sync state — shared across the single hook instance
let hasUnsyncedChanges = false;
let lastSyncTime = null;

/**
 * Reset sync state (e.g., on logout).
 * Can be imported and called directly without going through context.
 */
export const resetSyncState = () => {
  hasUnsyncedChanges = false;
  lastSyncTime = null;
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
 * @param {Object} userVocabulary - Current user vocabulary state
 * @param {boolean} isVocabularyLoaded - Whether userVocabulary has loaded from storage
 * @returns {{ forceSync: function }}
 */

export const useBackendSync = (isOnline, userProgress, isProgressLoaded, userVocabulary, isVocabularyLoaded, setVocabularyChanges) => {
  const syncIntervalRef = useRef(null);
  const wasOnlineRef = useRef(isOnline);
  const isOnlineRef = useRef(isOnline);

  // Keep refs of latest data to avoid stale closures
  const userProgressRef = useRef(userProgress);
  const userVocabularyRef = useRef(userVocabulary);

  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);
  useEffect(() => { userProgressRef.current = userProgress; }, [userProgress]);
  useEffect(() => { userVocabularyRef.current = userVocabulary; }, [userVocabulary]);

    // Auto-mark dirty when userProgress or userVocabulary changes (after initial load)
  useEffect(() => {
    if (isProgressLoaded || isVocabularyLoaded) {
      hasUnsyncedChanges = true;
    }
  }, [userProgress, isProgressLoaded, userVocabulary, isVocabularyLoaded]);

  // Sync to backend — only runs if online and there are unsynced changes
  const performSync = useCallback(async () => {
    if (!isOnlineRef.current) return;
    if (!hasUnsyncedChanges) return;

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

      console.log('userProgress:', userProgressRef.current.coins, userProgressRef.current.energy);
      console.log('vocabularyChanges:', vocabularyChanges);

      // API CALL
      // TODO: Replace with actual API call, e.g.:
      // await apiClient.put('/users/sync', {
      //   user_progress: userProgressRef.current,
      //   vocabulary_changes: hasVocabularyChanges ? vocabularyChanges : null,
      // });

      // Clear vocabulary changes via React state setter (usePersistedState will persist it)
      if (hasVocabularyChanges) {
        console.log('[useBackendSync] Clearing vocabulary changes');
        setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
      }

      hasUnsyncedChanges = false;
      lastSyncTime = Date.now();
      console.log('[useBackendSync] Sync completed');
    } catch (error) {
      console.error('[useBackendSync] Sync error - will retry:', error.message);
      // Don't clear hasUnsyncedChanges — will retry on next interval
    }
  }, []);

  // Force immediate sync
  const forceSync = useCallback(async () => {
    hasUnsyncedChanges = true;
    await performSync();
  }, [performSync]);

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

  return { forceSync };
};