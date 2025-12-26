import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProvider, useAppContext } from '../context/AppContext';
import { PRIMARY_COLOR } from '@/constants/App';

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

  // Render the app with the AppProvider to provide context
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading, hasCompletedOnboarding } = useAppContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';
    const inMoreScreen = segments[0] === 'more';
    const inModal = segments[0] === 'modal';
    const inGames = segments[0] === 'games';
    const inLoginOrRegister = segments[1] === 'login' || segments[1] === 'register';

    if (!hasCompletedOnboarding) {
      // User hasn't completed onboarding - keep them in onboarding flow
      if (!inOnboardingGroup) {
        router.replace('/onboarding/landing');
      }
    } else {
      // User completed onboarding - allow access to app (tabs, more, modal, games)
      // Also allow access to login/register for guest users
      if (!inTabsGroup && !inMoreScreen && !inModal && !inGames && !inLoginOrRegister) {
        router.replace('/(tabs)');
      }
    }
  }, [hasCompletedOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0f8690" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen 
          name="more" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'More',
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
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
