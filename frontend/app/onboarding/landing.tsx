import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { APP_NAME, APP_TAGLINE, PRIMARY_COLOR, DARK_COLORS } from '../../constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import TouchableOpacity from '@/components/TouchableOpacity';

export default function LandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGetStarted = () => {
    // New users go to onboarding questions first
    router.push('/onboarding/questions');
  };

  const handleLogin = () => {
    // Existing users go straight to login
    router.push('/onboarding/login');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '' : '#e9e7e8' },
      ]}
    >

      {/* Content Overlay */}
      <View style={styles.overlay}>
        {/* logo Section */}
        <View style={styles.logoContainer}>
          {/* GIF */}
          <Image
            source={
              colorScheme === 'dark'
                ? require('../../assets/gifs/tail-moving-bg-black.gif')
                : require('../../assets/gifs/tail-moving.gif')
            }
            style={styles.gif}
            resizeMode="contain"
          />
          
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={[styles.sublogo, isDark && { color: DARK_COLORS.textSecondary }]}>{APP_TAGLINE}</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>GET STARTED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>ALREADY HAVE AN ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 300,
    height: 200,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    letterSpacing: 2,
  },
  sublogo: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  secondaryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
