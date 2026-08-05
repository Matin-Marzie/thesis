import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loginUser, loginWithGoogle } from '../../api/auth';
import { PRIMARY_COLOR } from '@/constants/App';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { useAuth } from '@/context/AuthContext';
import { VOCABULARY_ACTIONS, DEFAULT_VOCABULARY_CHANGES } from '@/hooks/useVocabulary';
import { useColorScheme } from '@/components/useColorScheme';
import TouchableOpacity from '@/components/TouchableOpacity';
import { GoogleSigninButton, GoogleSignin, statusCodes, isSuccessResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;


export default function LoginScreen() {

  // Configure Google Sign-In on mount
  useEffect(() => {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID_WEB,
        offlineAccess: true,
      });
  }, []);

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const { userProfile, updateUserProfile } = useProfile();
  const { userProgress, setUserProgress } = useProgress();
  const { vocabularyChanges, vocabularyDispatch, setVocabularyChanges } = useVocabularyContext();
  const { setIsAuthenticated, setHasCompletedOnboarding, hasCompletedOnboarding, setPendingGoogleAuth } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasInput = usernameOrEmail.trim().length > 3 && password.length > 7;

  // If onboarding was already completed on this device (guest progress:
  // energy, coins, language, vocabulary, all unlinked to any account), ask
  // the user how logging in should handle it before proceeding - merge it
  // into the account, overwrite it with the account's own saved progress,
  // or cancel. Skips straight to `proceed(false)` when there's no local
  // progress at stake.
  const promptLoginStrategy = (proceed: (merge: boolean) => void) => {
    if (!hasCompletedOnboarding) {
      proceed(false);
      return;
    }
    Alert.alert(
      'You have progress on this device',
      "This device has an active language-learning session - energy, coins, your selected language, and word progress - that isn't linked to any account yet.\n\n" +
      "Merge combines it with the account's saved progress: whichever has more coins/energy is kept, any languages you have here that the account doesn't are added to it, and for words you've studied in both places, the better mastery level wins.\n\n" +
      "Overwrite discards this device's current session entirely and replaces it with whatever is already saved on that account.\n\n" +
      "This can't be undone once you continue.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Overwrite', style: 'destructive', onPress: () => proceed(false) },
        { text: 'Merge', style: 'default', onPress: () => proceed(true) },
      ]
    );
  };

  const buildMergePayload = () => ({
    user_profile: {
      age: userProfile.age,
      preferences: userProfile.preferences,
      notifications: userProfile.notifications,
    },
    user_progress: userProgress,
    // Only the manually-tracked changes, not the full vocabulary - the
    // full vocabulary can be thousands of words and blow past Express's
    // JSON body size limit. Mirrors what the register flows already send.
    vocabulary_changes: vocabularyChanges,
  });

  const handleLogin = () => {
    setError('');

    const isEmail = usernameOrEmail.includes('@');

    if (isEmail && !EMAIL_REGEX.test(usernameOrEmail.trim())) {
      setError('Email is in wrong format');
      return;
    }

    if (!isEmail && !USERNAME_REGEX.test(usernameOrEmail.trim())) {
      setError('Username is in wrong format');
      return;
    }

    promptLoginStrategy(async (merge) => {
      setLoading(true);
      try {
        const credentials: any = isEmail
          ? { email: usernameOrEmail.trim(), password: password.trim() }
          : { username: usernameOrEmail.trim(), password: password.trim() };

        if (merge) {
          Object.assign(credentials, buildMergePayload());
        }

        // Backend login request
        const response = await loginUser(credentials);
        if (response.status === 200) {
          setIsAuthenticated(true);
          setHasCompletedOnboarding(true); // runtime only

          // update user data
          if (response.data) {
            await updateUserProfile(response.data?.user_profile);
            await setUserProgress(response.data?.user_progress);
            vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: response.data?.user_vocabulary });
          }
          if (!merge) {
            // Overwrite discarded the local session entirely
            setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
          }
          router.replace('/(tabs)');
        }

      } catch (error: any) {
        setError(error.message); // show error
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGoogleSignIn = () => {
    setError('');
    promptLoginStrategy(async (merge) => {
      setLoading(true);
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (!isSuccessResponse(response)) {
          // user cancelled the native picker
          return;
        }

        const { idToken } = response.data;
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        try {
          const payload: any = { idToken, platform };
          if (merge) {
            Object.assign(payload, buildMergePayload());
          }

          const apiResponse = await loginWithGoogle(payload);

          if (apiResponse.status === 200) {
            setIsAuthenticated(true);
            setHasCompletedOnboarding(true); // runtime only

            if (apiResponse.data) {
              await updateUserProfile(apiResponse.data?.user_profile);
              await setUserProgress(apiResponse.data?.user_progress);
              vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: apiResponse.data?.user_vocabulary });
            }
            if (!merge) {
              // Overwrite discarded the local session entirely - clear any
              // pending local vocabulary changes too, so a later background
              // sync doesn't push the discarded guest data into this account.
              setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
            }
            router.replace('/(tabs)');
          }
        } catch (apiError: any) {
          if (apiError.code === 'GOOGLE_ACCOUNT_NOT_FOUND') {
            if (hasCompletedOnboarding) {
              // Onboarding was already done on this device, but no backend
              // account exists for this Google identity - the onboarding
              // group is off-limits once onboarding is complete (see
              // app/_layout.tsx), so point the user at Sign up instead.
              setError('No account found for this Google login. Please Sign up first.');
            } else {
              // No profile data collected yet - collect it via onboarding,
              // then questions.tsx finishes registration with this idToken.
              setPendingGoogleAuth({ idToken, platform });
              router.push('/onboarding/questions');
            }
            return;
          }
          throw apiError;
        }
      } catch (error: any) {
        if (isErrorWithCode(error)) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled
          } else if (error.code === statusCodes.IN_PROGRESS) {
            setError('Google Sign-In is in progress.');
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            setError('Google Play Services not available or outdated.');
          } else {
            setError(error.message || 'Google Sign-In failed.');
          }
        } else {
          setError(error.message || 'Google Sign-In failed.');
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={32} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && { color: '#eee' }]}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              styles.emailUsernameInput,
              isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
            ]}
            placeholder="Username or Email"
            placeholderTextColor={isDark ? '#888' : undefined}
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
              ]}
              placeholder="Password"
              placeholderTextColor={isDark ? '#888' : undefined}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={isDark ? '#aaa' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={() =>
              router.push({
                pathname: '/onboarding/forgot-password',
                // Only carry it over if what's typed actually looks like an
                // email - usernameOrEmail may hold a username instead.
                params: usernameOrEmail.includes('@') ? { email: usernameOrEmail.trim() } : {},
              })
            }
          >
            <Text style={styles.forgotPasswordLinkText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, (!hasInput || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!hasInput || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loginButtonText}>Logging in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* SIGN UP */}
          <View style={styles.registerLink}>
            <Text style={[styles.registerLinkText, isDark && { color: '#aaa' }]}>Don't have an account? </Text>

            {hasCompletedOnboarding ? (
              <TouchableOpacity onPress={() => router.push('/onboarding/register')}>
                <Text style={styles.registerLinkLink}>Sign up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push('/onboarding/questions')}>
                <Text style={styles.registerLinkLink}>Get Started</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

        {/* Google Sign-In Button */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
            <GoogleSigninButton
              style={{ width: width * 0.8, height: 56 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
              disabled={loading}
            />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 0 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#aaa' },
  form: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  emailUsernameInput: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeIcon: { position: 'absolute', right: 12, padding: 4 },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordLinkText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerLinkText: {
    color: '#666',
    fontSize: 16,
  },
  registerLinkLink: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});