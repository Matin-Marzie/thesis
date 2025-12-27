import { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // Checks internet connection in OS level
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshToken, clearTokens } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { getCurrentUser } from '../api/user';
import * as SecureStore from 'expo-secure-store';
import { useDictionary } from '../hooks/useDictionary';


/**
 * @typedef {Object} User
 * @property {string} [id]
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [displayName]
 */

/**
 * @typedef {Object} AppContextType
 * @property {User | null} user
 * @property {(user: User | null) => void} setUser
 * @property {boolean} isAuthenticated
 * @property {(isAuthenticated: boolean) => void} setIsAuthenticated
 * @property {boolean} hasCompletedOnboarding
 * @property {(hasCompletedOnboarding: boolean) => void} setHasCompletedOnboarding
 * @property {boolean} isLoading
 * @property {(isLoading: boolean) => void} setIsLoading
 * @property {boolean} isOnline
 * @property {() => Promise<void>} checkAuthStatus
 * @property {(userData: User, accessToken: string, refreshToken?: string) => Promise<void>} login
 * @property {() => Promise<void>} logout
 * @property {(userData: Partial<User>) => void} updateUser
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


  const defaultUser = {
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

    total_experience: 0, // Database will compute this, total experience across all languages

    // Progress
    energy: 100,
    coins: 20,

    languages: [
      {
        is_current_language: true,
        native_language_id: 1,
        native_language_name: 'English',
        native_language_code: 'en',
        learning_language_id: 2,
        learning_language_name: 'Greek',
        learning_language_code: 'el',
        created_at: null,
        proficiency_level: 'A1',
        experience: 0,
        learned_vocabulary: [], // { id: 100000, mastery_level: 1, last_review: null, created_at: null }
      },
    ],
  }

  const [user, setUser] = useState(defaultUser);

  // all available words in the learning language
  const [dictionary, setDictionary] = useState({});
  const [dictionaryLoading, setDictionaryLoading] = useState(false);


  // Sync user data with backend
  const syncWithBackend = async () => {
    if (!isOnline) {
      console.log('[Sync] Offline - skipping sync');
      return;
    }

    if (!hasUnsyncedChanges.current) {
      console.log('[Sync] No changes to sync');
      return;
    }

    try {
      // Get current user_profile from AsyncStorage
      const profileStr = await AsyncStorage.getItem('user_profile');
      if (!profileStr) {
        console.log('[Sync] No user_profile to sync');
        hasUnsyncedChanges.current = false;
        return;
      }

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
      console.log('[Sync] Success');

    } catch (error) {
      console.error('[Sync] Error - will retry on next interval:', error.message);
      // Don't clear hasUnsyncedChanges - will retry on next interval
    }
  };

  // Update user data locally and mark for sync
  const updateUser = async (newUser) => {
    try {
      setUser(prevUser => {
        const mergedUser = { ...prevUser, ...newUser };
        // Save merged user to AsyncStorage
        AsyncStorage.setItem('user_profile', JSON.stringify(mergedUser));
        return mergedUser;
      });
      hasUnsyncedChanges.current = true; // Mark for backend sync
    } catch (error) {
      console.error('[updateUser] Error saving to AsyncStorage:', error);
    }
  };

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
      console.log('refreshToken:', refreshToken);

      if (refreshToken) {
        // Try to refresh access token
        try {
          const newAccessToken = await refreshAccessToken();
          console.log('newAccessToken:', newAccessToken);

          if (newAccessToken) {
            // Fetch user profile
            const userData = await getCurrentUser();

            updateUser(userData.data?.user);
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
      const { getItem } = await import('expo-secure-store');
      const onboardingComplete =
        (await SecureStore.getItemAsync('onboarding_complete')) === 'true';

      setHasCompletedOnboarding(onboardingComplete);

      // No token or refresh failed - user not authenticated
      setIsAuthenticated(false);

    } catch (error) {
      console.error('Auth check error:', error);
      setUser(defaultUser);
      setIsAuthenticated(false);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: load user profile from AsyncStorage and check auth status
  useEffect(() => {
    (async () => {
      try {
        const profileStr = await AsyncStorage.getItem('user_profile');
        if (profileStr) {
          setUser(JSON.parse(profileStr));
        }
      } catch (e) {
        console.error('[AppProvider] Failed to load user_profile from AsyncStorage:', e);
      } finally {
        checkAuthStatus();
      }
    })();
  }, []);

  // Handling Dictionary
  const isDictionaryEnabled = useMemo(
    () =>
      hasCompletedOnboarding &&
      user?.languages?.some(l => l.is_current_language),
    [hasCompletedOnboarding, user?.languages]
  );


  // Using the custom hook hooks/useDictionary
  const { dictionary: dict, dictionaryLoading: dictLoading } = useDictionary({ user, enabled: isDictionaryEnabled, isOnline });

  // Sync dictionary state
  useEffect(() => {
    setDictionary(dict || {});
    setDictionaryLoading(dictLoading);
  }, [dict, dictLoading]);



  // Logout function
  const logout = async () => {
    try {
      // clear tokens in SecureStore
      await clearTokens();

      // Clear AsyncStorage and SecureStore
      await AsyncStorage.clear(); 
      // await SecureStore.setItemAsync('onboarding_complete', 'false');

      // reset memory state
      updateUser(defaultUser);
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setDictionary({});
      setDictionaryLoading(false);

      // Reset sync refs
      hasUnsyncedChanges.current = false;
      lastSyncTime.current = null;

    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user, setUser,
    dictionary, setDictionary,
    isAuthenticated, setIsAuthenticated,
    hasCompletedOnboarding, setHasCompletedOnboarding,
    isLoading, setIsLoading,
    isOnline,
    checkAuthStatus,
    logout,
    updateUser,
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