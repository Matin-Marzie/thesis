import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { REMINDER_NOTIFICATION_ID } from '@/utils/notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProviders } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';
import { DictionaryProvider } from '../context/DictionaryContext';
import { ReelsProvider } from '../context/ReelsContext';
import { PRIMARY_COLOR } from '@/constants/App';
import ServerErrorBanner from '@/components/ServerErrorBanner';
import SessionExpiredBanner from '@/components/SessionExpiredBanner';
import { useLogout } from '@/hooks/useLogout';
import { apiEvents, API_EVENTS } from '@/api/apiEvents';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  {/* Render the app wrapped in the domain context providers */ }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppProviders>
        <DictionaryProvider>
          <ReelsProvider>
            <BottomSheetModalProvider>
              <RootLayoutNav />
            </BottomSheetModalProvider>
          </ReelsProvider>
        </DictionaryProvider>
      </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading, hasCompletedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { logout } = useLogout();
  const [sessionExpiredTrigger, setSessionExpiredTrigger] = useState<number | null>(null);

  // A previously-authenticated session was definitively invalidated (refresh
  // token past its absolute cap, or revoked via reuse detection). Reuse the
  // same logout() the settings screen uses - it clears tokens, resets local
  // state, and sets hasCompletedOnboarding=false, which the effect below
  // then naturally routes to /onboarding/landing. Just show a banner on top.
  useEffect(() => {
    const unsubscribe = apiEvents.on(API_EVENTS.AUTH_SESSION_EXPIRED, () => {
      logout();
      setSessionExpiredTrigger(Date.now());
    });
    return () => { unsubscribe(); };
  }, [logout]);

  
  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSettingsScreen = segments[0] === 'settings';
    const inModal = segments[0] === 'modal';
    const inGames = segments[0] === 'games';
    const inReelScreen = segments[0] === 'profileReel';
    const inCreatorScreen = segments[0] === 'creator';
    const inLoginOrRegister =
      segments[1] === 'login' ||
      segments[1] === 'register' ||
      segments[1] === 'verify-email' ||
      segments[1] === 'forgot-password' ||
      segments[1] === 'verify-reset-code' ||
      segments[1] === 'reset-password';

    // [2] Check: onboardingComplete? — if NO, redirect to onboarding
    if (!hasCompletedOnboarding) {
      if (!inOnboardingGroup) {
        router.replace('/onboarding/landing');
      }
    } else {
      // [] Main app — allow access to app (tabs, settings, modal, games)
      // Also allow access to login/register for guest users
      if (!inTabsGroup && !inSettingsScreen && !inModal && !inGames && !inReelScreen && !inCreatorScreen && !inLoginOrRegister) {
        router.replace('/(tabs)');
      }
    }
  }, [hasCompletedOnboarding, isLoading, segments]);

  // Deep-link into the Reels tab when the practice reminder notification is tapped
  useEffect(() => {
    if (isLoading || !hasCompletedOnboarding) return;

    const goToReels = (identifier: string) => {
      if (identifier === REMINDER_NOTIFICATION_ID) {
        router.push('/(tabs)/reels');
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) goToReels(response.notification.request.identifier);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      goToReels(response.notification.request.identifier);
    });

    return () => subscription.remove();
  }, [isLoading, hasCompletedOnboarding, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ServerErrorBanner />
      <SessionExpiredBanner trigger={sessionExpiredTrigger} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Settings',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="settings/account"
          options={{
            headerShown: true,
            title: 'Account',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{
            headerShown: true,
            title: 'Notifications',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="settings/vibrations"
          options={{
            headerShown: true,
            title: 'Vibrations',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="settings/about"
          options={{
            headerShown: true,
            title: 'About',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="games/wordle"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="games/wordofwonders"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profileReel/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="creator/[id]"
          options={{
            headerShown: true,
            title: 'Profile',
            headerStyle: {
              backgroundColor: PRIMARY_COLOR,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="creator/[id]/reel/[reelId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
