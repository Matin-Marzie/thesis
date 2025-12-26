import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // Checks internet connection in OS level
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshToken, clearTokens } from '../api/tokens';
import { refreshAccessToken } from '../api/auth';
import { getCurrentUser } from '../api/user';
import * as SecureStore from 'expo-secure-store';

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
        learning_language_id: 2,
        proficiency_level: 'A1',
        experience: 0,
        learned_vocabulary: [], // { id: 100000, mastery_level: 1, last_review: null, created_at: null }
      },
    ],
  }

  const [user, setUser] = useState(defaultUser);

  // all available words in the learning language
  const [dictionary, setDictionary] = useState([
  ]);
  //   // Example word entries
  //   add: { id: 7, written_form: "ADD", translation: "προσθέτω", transliteration: "", category: "", image_url: null, audio_url: null },
  //   admin: { id: 11, written_form: "ADMIN", translation: "διαχειριστής", transliteration: "", category: "", image_url: null, audio_url: null },
  //   aid: { id: 10, written_form: "AID", translation: "βοήθεια", transliteration: "", category: "", image_url: null, audio_url: null },
  //   amid: { id: 20, written_form: "AMID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   amino: { id: 21, written_form: "AMINO", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   and: { id: 19, written_form: "AND", translation: "και", transliteration: "", category: "", image_url: null, audio_url: null },
  //   dam: { id: 17, written_form: "DAM", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   damn: { id: 18, written_form: "DAMN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   dad: { id: 8, written_form: "DAD", translation: "μπαμπάς", transliteration: "", category: "", image_url: null, audio_url: null },
  //   diamond: { id: 1, written_form: "DIAMOND", translation: "Διαμάντι", transliteration: "", category: "", image_url: null, audio_url: null },
  //   did: { id: 9, written_form: "DID", translation: "κάνω(αόριστο)", transliteration: "", category: "", image_url: null, audio_url: null },
  //   do: { id: 16, written_form: "DO", translation: "κάνω", transliteration: "", category: "", image_url: null, audio_url: null },
  //   domain: { id: 2, written_form: "DOMAIN", translation: "πεδίο", transliteration: "", category: "", image_url: null, audio_url: null },
  //   id: { id: 24, written_form: "ID", translation: "ταυτότητα", transliteration: "", category: "", image_url: null, audio_url: null },
  //   maid: { id: 4, written_form: "MAID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   main: { id: 12, written_form: "MAIN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   man: { id: 15, written_form: "MAN", translation: "ο άνδρας", transliteration: "", category: "", image_url: null, audio_url: null },
  //   mid: { id: 14, written_form: "MID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   mind: { id: 5, written_form: "MIND", translation: "μυαλό", transliteration: "", category: "", image_url: null, audio_url: null },
  //   moan: { id: 22, written_form: "MOAN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   nomad: { id: 3, written_form: "NOMAD", translation: "νομάδας", transliteration: "", category: "", image_url: null, audio_url: null },
  //   nod: { id: 6, written_form: "NOD", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
  //   odd: { id: 13, written_form: "ODD", translation: "περιττός, ασυνήθιστος", transliteration: "", category: "", image_url: null, audio_url: null },
  //   omni: { id: 23, written_form: "OMNI", translation: "", transliteration: "", category: "", image_url: null, audio_url: null }


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
            // Backend returns { success, data: { user, languages } }
            setUser(userData.data?.user || userData);
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

  // On mount,
  // load user_profile from AsyncStorage,
  // Check auth status
  // TO Do: get user profile from backend if authenticated
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

  // Logout function
  const logout = async () => {
    try {
      await clearTokens();
      updateUser(defaultUser);
      setIsAuthenticated(false);
      await SecureStore.setItemAsync('onboarding_complete', 'false');
      setHasCompletedOnboarding(false);

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