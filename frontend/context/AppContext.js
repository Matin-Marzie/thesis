import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // Checks internet connection in OS level
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshToken, clearTokens } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { getCurrentUser } from '../api/user';
import * as SecureStore from 'expo-secure-store';


/**
 * @typedef {Object} userProfile
 * @property {string} [id]
 * @property {string} [username]
 * @property {string} [email]
 */

/**
 * @typedef {Object} AppContextType
 * @property {userProfile} userProfile
 * @property {boolean} isAuthenticated
 * @property {(isAuthenticated: boolean) => void} setIsAuthenticated
 * @property {boolean} hasCompletedOnboarding
 * @property {(hasCompletedOnboarding: boolean) => void} setHasCompletedOnboarding
 * @property {boolean} isLoading
 * @property {(isLoading: boolean) => void} setIsLoading
 * @property {boolean} isOnline
 * @property {() => Promise<void>} checkAuthStatus
 * @property {() => Promise<void>} logout
 */

/** @type {import('react').Context<AppContextType>} */
const AppContext = createContext({});
export const AppProvider = ({ children }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Track if user data has changed since last sync
  const hasUnsyncedChanges = useRef(false);
  const lastSyncTime = useRef(null);
  const syncIntervalRef = useRef(null);


  const defaultUserProfile = {
    // Profile
    id: null,
    first_name: 'Guest',
    last_name: null,
    username: 'guest_user',
    email: 'guest@example.com',
    profile_picture: null,
    joined_date: null,
    age: null,
    preferences: '',
    notifications: true,
  }

  const defaultUserProgress = {
    // Progress
    // total_experience: 0, // Database will compute this, total experience across all languages
    energy: 100,
    coins: 20,
    languages: [
      {
        id: null,
        is_current_language: true,
        native_language: {
          id: 1,
          name: 'English',
          code: 'en',
        },
        learning_language: {
          id: 2,
          name: 'Greek',
          code: 'el',
        },
        created_at: null,
        proficiency_level: 'N',
        experience: 0
      },
    ],
  }

  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [userProgress, setUserProgress] = useState(defaultUserProgress);
  const [userVocabulary, setUserVocabulary] = useState({}); // { word_id: { language_id, mastery_level, last_review, created_at } }


  // Sync user data with backend
  const syncWithBackend = async () => {
    if (!isOnline) return;
    if (!hasUnsyncedChanges.current) return;
    try {
      // Get current user_progress from AsyncStorage
      // const progressStr = await AsyncStorage.getItem('user_progress');

      // const userProfile = JSON.parse(profileStr);

      // TO DO
      // Call backend API to sync user profile
      // const response = await fetch('/api/v1/users/sync', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userProfile),
      // });

      // if (!response.ok) {
      //   throw new Error('Sync failed: ' + response.status);
      // }

      // Mark as synced
      hasUnsyncedChanges.current = false;
      lastSyncTime.current = Date.now();
    } catch (error) {
      console.error('[Sync] Error - will retry on next interval:', error.message);
      // Don't clear hasUnsyncedChanges - will retry on next interval
    }
  };


  // TO DO: handle user profile


  // ----------------------------------------------------------------------------------------------------------
  // update user profile in memory and asyncStorage
  const updateUserProfile = async (newUserProfile) => {
    try {
      setUserProfile(newUserProfile); // memory update
      await AsyncStorage.setItem('user_profile', JSON.stringify(newUserProfile)); // persistent update
    } catch (error) {
      console.error('[updateUserProfile] Error saving to AsyncStorage:', error);
    }
  };

  // update user progress locally and mark for sync
  const updateUserProgress = async (newUserProgress) => {
    try {
      setUserProgress(prevUserProgress => {
        const mergedUserProgress = { ...prevUserProgress, ...newUserProgress };
        // Save merged user progress to AsyncStorage
        AsyncStorage.setItem('user_progress', JSON.stringify(mergedUserProgress));
        return mergedUserProgress;
      });
      hasUnsyncedChanges.current = true; // Mark for backend sync
    } catch (error) {
      console.error('[updateUserProgress] Error saving to AsyncStorage:', error);
    }
  };

  // update user vocabulary memory+locally and mark for sync
  const updateUserVocabulary = async (newUserVocabulary) => {
    try {
      setUserVocabulary(newUserVocabulary); // memory update
      await AsyncStorage.setItem('user_vocabulary', JSON.stringify(newUserVocabulary)); // persistent update
    } catch (error) {
      console.error('[updateUserVocabulary] Error saving to AsyncStorage:', error);
    }
  };
  // ----------------------------------------------------------------------------------------------------------



  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Auto-sync every 1 minute if changes exist
  useEffect(() => {
    // Start sync interval
    syncIntervalRef.current = setInterval(() => {
      if (hasUnsyncedChanges.current) {
        syncWithBackend();
      }
    }, 60000); // 60 seconds = 1 minute

    // Cleanup interval on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline]);

  // Background sync when app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Sync when app goes to background or becomes inactive
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (hasUnsyncedChanges.current && isOnline) {
          syncWithBackend();
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [isOnline]);

  // Check for existing auth session on app load
  // refetch user profile after access token refresh
  const checkAuthStatus = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        // Try to refresh access token
        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            // TO DO: SYNC WITH BACKEND user_profile, user_progress and user_vocabulary
            // TO DO: for now just fetch user data
            const data = await getCurrentUser();

            await updateUserProfile(data?.user_profile);
            await updateUserProgress(data?.user_progress);
            await updateUserVocabulary(data?.user_vocabulary);
            setIsAuthenticated(true);

            // 3️⃣ AUTHENTICATED ⇒ SKIP ONBOARDING
            setHasCompletedOnboarding(true);
            return; // Success - exit early
          }
        } catch {
          await clearTokens();
        }
      }

      // // not authenticated → Check if user has completed onboarding
      const onboardingComplete = (await SecureStore.getItemAsync('onboarding_complete')) === 'true';

      setHasCompletedOnboarding(onboardingComplete);
      // No token or refresh failed - user not authenticated
      setIsAuthenticated(false);

    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      await clearTokens();
      await updateUserProfile(defaultUserProfile);
      await updateUserProgress(defaultUserProgress);
      await updateUserVocabulary({});
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: load user data and check auth status
  useEffect(() => {
    (async () => {
      try {
        const                                                                                                                                                                                                                                              profileStr = await AsyncStorage.getItem('user_profile');
        if (profileStr) setUserProfile(JSON.parse(profileStr))

        const progressStr = await AsyncStorage.getItem('user_progress');
        if (progressStr) setUserProgress(JSON.parse(progressStr));                                                                                                                                                                                                                                                                                                                                                                              

        const vocabularyStr = await AsyncStorage.getItem('user_vocabulary');
        if (vocabularyStr) setUserVocabulary(JSON.parse(vocabularyStr));
      } catch (e) {
        console.error('[AppProvider] Failed to load user data from AsyncStorage:', e);
      } finally {
        checkAuthStatus();
      }
    })();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      // clear tokens in SecureStore
      await clearTokens();

      // Clear AsyncStorage and SecureStore
      await AsyncStorage.clear();
      await SecureStore.setItemAsync('onboarding_complete', 'false');

      // reset memory state
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setUserProfile(defaultUserProfile);
      setUserProgress(defaultUserProgress);
      setUserVocabulary({});

      // Reset sync refs
      hasUnsyncedChanges.current = false;
      lastSyncTime.current = null;

    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    userProfile, setUserProfile, updateUserProfile,
    userProgress, setUserProgress, updateUserProgress,
    userVocabulary, setUserVocabulary, updateUserVocabulary,
    isAuthenticated, setIsAuthenticated, checkAuthStatus,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    isOnline,
    logout,
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