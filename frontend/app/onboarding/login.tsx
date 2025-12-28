import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../../api/auth';
import { PRIMARY_COLOR } from '@/constants/App';
import { useAppContext } from '@/context/AppContext';
// import { GoogleSigninButton, GoogleSignin, statusCodes, User as GoogleUser } from '@react-native-google-signin/google-signin';

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function LoginScreen() {

  // Configure Google Sign-In on mount
  // useEffect(() => {
  //     GoogleSignin.configure({
  //       webClientId: Platform.OS === 'ios' ? GOOGLE_CLIENT_ID_IOS : GOOGLE_CLIENT_ID_ANDROID,
  //       offlineAccess: true,
  //     });
  // }, []);

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const { updateUserProfile, updateUserProgress, updateUserVocabulary, setIsAuthenticated, setHasCompletedOnboarding } = useAppContext();
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasInput = usernameOrEmail.trim().length > 3 && password.length > 7;

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const isEmail = usernameOrEmail.includes('@');

    if (isEmail && !EMAIL_REGEX.test(usernameOrEmail.trim())) {
      setError('Email is in wrong format');
      setLoading(false);
      return;
    }

    if (!isEmail && !USERNAME_REGEX.test(usernameOrEmail.trim())) {
      setError('Username is in wrong format');
      setLoading(false);
      return;
    }

    try {
      const credentials = isEmail
        ? { email: usernameOrEmail.trim(), password: password.trim() }
        : { username: usernameOrEmail.trim(), password: password.trim() };

      const response = await loginUser(credentials);
      if (response.status === 200) {
        setIsAuthenticated(true);
        setHasCompletedOnboarding(true); // runtime only 

        // update user data
        if (response.data) {
          await updateUserProfile(response.data?.user_profile);
          await updateUserProgress(response.data?.user_progress);
          await updateUserVocabulary(response.data?.user_vocabulary);
        }
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      setError(error.message); // show error
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      // For web, you should implement Google Auth using expo-auth-session or another web-compatible method
      Alert.alert('Google Sign-In', 'Google Sign-In for web is not implemented.');
      return;
    }
    setLoading(true);
    setError('');
    // try {
    //   await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    //   const userInfo: GoogleUser = await GoogleSignin.signIn();
    //   // You can send userInfo.idToken to your backend for authentication
    //   console.log('Google User Info:', userInfo);
    //   Alert.alert('Google Sign-In Success', `Welcome, ${userInfo.user.name || userInfo.user.email}`);
    //   // Optionally, update user context and navigate
    //   // await updateUserProfile(userInfo.user);
    //   // await updateUserProgress();   // I DON'T KNOW
    //   // await updateUserVocabulary(); // CHECK
    //   // setIsAuthenticated(true);
    //   // router.replace('/(tabs)');
    // } catch (error: any) {
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     // user cancelled
    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     setError('Google Sign-In is in progress.');
    //   } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    //     setError('Google Play Services not available or outdated.');
    //   } else {
    //     setError(error.message || 'Google Sign-In failed.');
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/onboarding/landing')}
          >
            <Ionicons name="arrow-back" size={32} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, styles.emailUsernameInput]}
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
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
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, (!hasInput || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!hasInput || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/register')}>
              <Text style={styles.registerLinkLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Google Sign-In Button */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
            {/* <GoogleSigninButton
              style={{ width: width * 0.8, height: 56 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
              disabled={loading}
            /> */}
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6 },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerLinkText: { color: '#666', fontSize: 16 },
  registerLinkLink: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});