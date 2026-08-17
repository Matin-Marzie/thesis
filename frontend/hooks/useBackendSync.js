import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const hasPendingChanges = (changes) =>
  Object.keys(changes?.inserts || {}).length > 0 ||
  Object.keys(changes?.updates || {}).length > 0 ||
  Object.keys(changes?.deletes || {}).length > 0;

/**
 * @typedef {Object} ChangeSet
 * @property {string} key - payload key sent to /user/sync, e.g. 'vocabulary_changes'
 * @property {string} storageKey - AsyncStorage key (from STORAGE_KEYS) the changes are persisted under
 * @property {boolean} isLoaded - whether this change-set has finished loading from storage
 * @property {Object} changes - the current in-memory changes value (for dirty-tracking only;
 *   performSync re-reads storage directly, same as before, to avoid stale-closure changes)
 * @property {Function} setValue - setter to reset this change-set to defaultValue after a successful sync
 * @property {Object} defaultValue - the DEFAULT_*_CHANGES object for this change-set
 */

/**
 * Hook to manage syncing userProgress and any number of change-sets
 * (vocabulary_changes, sentence_changes, ...) with the backend.
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
 * @param {boolean} isAuthenticated
 * @param {Object} userProgress - Current user progress state
 * @param {boolean} isProgressLoaded - Whether userProgress has loaded from storage
 * @param {ChangeSet[]} changeSets - one entry per tracked changes-object (vocabulary, sentences, ...)
 * @returns {{ forceSync: () => Promise<boolean> }} forceSync resolves true if nothing is left
 *   unsynced afterwards, false if the sync attempt failed and changes are still pending
 */

export const useBackendSync = (isOnline, isAuthenticated, userProgress, isProgressLoaded, changeSets) => {
  const syncIntervalRef = useRef(null);
  const wasOnlineRef = useRef(isOnline);
  const isOnlineRef = useRef(isOnline);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Keep a ref of the latest data to avoid stale closures
  const userProgressRef = useRef(userProgress);
  const changeSetsRef = useRef(changeSets);

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
  useEffect(() => { changeSetsRef.current = changeSets; }, [changeSets]);

  const allChangeSetsLoaded = changeSets.every((cs) => cs.isLoaded);

  // Auto-mark dirty only when something that actually needs syncing changed:
  // coins/energy, or a pending insert/update/delete in any change-set.
  // Reference changes to userProgress/userSentences/userVocabulary that
  // don't touch those (switching languages, applying a SET from the server,
  // bulk-seeding vocabulary during onboarding) must NOT mark dirty - there's
  // nothing new to push.
  useEffect(() => {

    if (!isProgressLoaded || !allChangeSetsLoaded) return;

    const hasAnyChanges = changeSets.some((cs) => hasPendingChanges(cs.changes));

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      lastSyncedProgressRef.current = { coins: userProgress.coins, energy: userProgress.energy };
      // Changes carried over from a previous session (e.g. app closed before
      // they synced) are real and still need flushing - only the progress
      // baseline itself should skip marking dirty on this first run.
      if (hasAnyChanges) hasUnsyncedChanges = true;
      return;
    }

    const progressChanged =
      userProgress.coins !== lastSyncedProgressRef.current.coins ||
      userProgress.energy !== lastSyncedProgressRef.current.energy;

    if (progressChanged) {
      lastSyncedProgressRef.current = { coins: userProgress.coins, energy: userProgress.energy };
    }

    if (progressChanged || hasAnyChanges) {
      hasUnsyncedChanges = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProgress.coins, userProgress.energy, isProgressLoaded, allChangeSetsLoaded, ...changeSets.map((cs) => cs.changes)]);

  // Sync to backend — only runs if online, authenticated, and there are unsynced changes.
  // Resolves true once nothing is left unsynced (synced successfully, or there
  // was nothing pending), false if a sync attempt failed and changes remain pending.
  const performSync = useCallback(async () => {
    if (!isOnlineRef.current) return true;
    if (!isAuthenticatedRef.current) return true;
    if (!hasUnsyncedChanges) return true;

    try {
      // Read each change-set from AsyncStorage before syncing
      const currentChangeSets = changeSetsRef.current;
      const readChanges = await Promise.all(
        currentChangeSets.map(async (cs) => {
          try {
            const stored = await AsyncStorage.getItem(cs.storageKey);
            return stored ? JSON.parse(stored) : cs.defaultValue;
          } catch (e) {
            console.error(`[useBackendSync] Failed to read ${cs.key}:`, e.message);
            return cs.defaultValue;
          }
        })
      );

      const dirtyIndexes = readChanges
        .map((changes, i) => (hasPendingChanges(changes) ? i : -1))
        .filter((i) => i !== -1);

      const current_user_lang = userProgressRef.current?.languages?.find(lang => lang.is_current_language);
      const syncPayload = {
        user_progress: {
          coins: userProgressRef.current.coins,
          energy: userProgressRef.current.energy,
          current_user_languages_id: current_user_lang?.id,
        },
      };
      for (const i of dirtyIndexes) {
        syncPayload[currentChangeSets[i].key] = readChanges[i];
      }

      await syncUserData(syncPayload, { silent: hasShownSyncError });

      // Clear each dirty change-set via its React state setter (usePersistedState will persist it)
      for (const i of dirtyIndexes) {
        currentChangeSets[i].setValue(currentChangeSets[i].defaultValue);
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
