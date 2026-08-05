import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getRefreshToken } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { usePersistedState } from '../hooks/usePersistedState';
import { useBackendSync } from '../hooks/useBackendSync';
import { STORAGE_KEYS, validators } from '../constants/defaults';

import { useNetwork } from './NetworkContext';
import { useProfile } from './ProfileContext';
import { useProgress } from './ProgressContext';
import { useVocabularyContext } from './VocabularyContext';
import { useVibrationSettings } from './VibrationContext';
import { useReminderSettings } from './ReminderContext';

/**
 * @typedef {Object} AuthContextType
 * @property {boolean} isAuthenticated
 * @property {Function} setIsAuthenticated
 * @property {boolean} hasCompletedOnboarding
 * @property {Function} setHasCompletedOnboarding
 * @property {boolean} isLoading
 * @property {Function} setIsLoading
 * @property {{ idToken: string, platform: string } | null} pendingGoogleAuth
 * @property {Function} setPendingGoogleAuth
 * @property {() => Promise<void>} initApp
 * @property {() => Promise<void>} forceSync
 */

/** @type {import('react').Context<AuthContextType>} */
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { isOnline, setIsBackendServerReachable } = useNetwork();
  const { isProfileLoaded } = useProfile();
  const { userProgress, isProgressLoaded } = useProgress();
  const { userVocabulary, isVocabularyLoaded, isVocabularyChangesLoaded, setVocabularyChanges } = useVocabularyContext();
  const { isVibrationSettingsLoaded } = useVibrationSettings();
  const { isReminderSettingsLoaded } = useReminderSettings();

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Holds { idToken, platform } for a brand-new Google sign-in that has no
  // account yet - set while the user is routed through onboarding to collect
  // real profile data, then consumed to finish creating the account.
  // Intentionally in-memory only (not persisted): idTokens expire in ~1hr,
  // so surviving an app restart isn't useful and just adds a stale value.
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(null);

  const {
    value: hasCompletedOnboarding,
    setValue: setHasCompletedOnboarding,
    isLoaded: isOnboardingLoaded,
  } = usePersistedState(STORAGE_KEYS.ONBOARDING_COMPLETE, false, validators.onboardingComplete);

  // Backend sync periodically from custom hook
  const { forceSync } = useBackendSync(isOnline, isAuthenticated, userProgress, isProgressLoaded, userVocabulary, isVocabularyLoaded, setVocabularyChanges);

  // Check for existing auth session on app load
  const initApp = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();

      // [3] Check if there is a refreshToken:
      if (refreshToken) {
        // [4]
        if (isOnline) {
          // [5] Try to refresh access token from server
          try {
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
              setIsAuthenticated(true);
              // Sync local changes with backend (push dirty data, then pull fresh data)
              await forceSync();
            }
          } catch (refreshError) {
            // Check if server is unreachable (network error or 5xx)
            // refreshAccessToken sets isServerUnreachable flag for these cases
            if (refreshError.isServerUnreachable) {
              // Server is not reachable - allow offline mode since user has a refresh token
              console.warn('Server not reachable during init, entering offline mode:', refreshError.message);
              setIsBackendServerReachable(false);
              setIsAuthenticated(true); // Allow access to local data
            } else {
              // Auth error (invalid/expired refresh token) - user needs to re-login
              console.error('Auth error during init:', refreshError.message);
              setIsAuthenticated(false);
            }
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
  }, [isOnline, forceSync]);

  // Initialization Logic of Application
  // 1. Wait for persisted state to load
  // 2. Check auth status and if dirty data needs to be synced
  useEffect(() => {
    if (isProfileLoaded && isProgressLoaded && isVocabularyLoaded && isVocabularyChangesLoaded && isOnboardingLoaded && isVibrationSettingsLoaded && isReminderSettingsLoaded && isOnline !== null) {
      // [1] All persisted state is loaded - check the code above
      // [2] reroute to /onboarding/landing if user hasn't completed onboarding - check /app/_layout.js
      initApp(); // (check auth, sync dirty data if online, etc)
    }
  }, [isProfileLoaded, isProgressLoaded, isVocabularyLoaded, isVocabularyChangesLoaded, isOnboardingLoaded, isVibrationSettingsLoaded, isReminderSettingsLoaded, initApp, isOnline]);

  const value = useMemo(() => ({
    isAuthenticated, setIsAuthenticated, initApp,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    pendingGoogleAuth, setPendingGoogleAuth,
    forceSync,
  }), [
    isAuthenticated, setIsAuthenticated, initApp,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    pendingGoogleAuth, setPendingGoogleAuth,
    forceSync,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
