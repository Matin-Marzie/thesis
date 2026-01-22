import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

const SYNC_INTERVAL_MS = 60000; // 1 minute

/**
 * Hook to manage syncing state with backend
 * @param {boolean} isOnline - Network connectivity status
 * @param {function} syncFn - Function to call for syncing (should return Promise)
 * @returns {{ markDirty: function, forceSync: function }}
 */
export const useBackendSync = (isOnline, syncFn) => {
  const hasUnsyncedChanges = useRef(false);
  const lastSyncTime = useRef(null);
  const syncIntervalRef = useRef(null);

  // Sync function wrapper
  const performSync = useCallback(async () => {
    if (!isOnline) return;
    if (!hasUnsyncedChanges.current) return;

    try {
      await syncFn();
      hasUnsyncedChanges.current = false;
      lastSyncTime.current = Date.now();
      console.log('[useBackendSync] Sync completed');
    } catch (error) {
      console.error('[useBackendSync] Sync error - will retry:', error.message);
      // Don't clear hasUnsyncedChanges - will retry on next interval
    }
  }, [isOnline, syncFn]);

  // Mark that there are changes to sync
  const markDirty = useCallback(() => {
    hasUnsyncedChanges.current = true;
  }, []);

  // Force immediate sync
  const forceSync = useCallback(async () => {
    hasUnsyncedChanges.current = true;
    await performSync();
  }, [performSync]);

  // Reset sync state (e.g., on logout)
  const resetSyncState = useCallback(() => {
    hasUnsyncedChanges.current = false;
    lastSyncTime.current = null;
  }, []);

  // Auto-sync interval
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (hasUnsyncedChanges.current) {
        performSync();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [performSync]);

  // Sync on app background/inactive
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (hasUnsyncedChanges.current && isOnline) {
          performSync();
        }
      }
    });

    return () => subscription.remove();
  }, [isOnline, performSync]);

  return { markDirty, forceSync, resetSyncState };
};
