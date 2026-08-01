import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { GoogleSigninButton, GoogleSignin, statusCodes, User as GoogleUser } from '@react-native-google-signin/google-signin';
import { PRIMARY_COLOR } from '@/constants/App';
import { requestVerificationCode } from '../../api/auth';
import { useColorScheme } from '@/components/useColorScheme';


// Hardcoded client IDs for Google Sign-In


interface RegisterScreenProps {
  onRegisterSuccess?: () => void;
}


// First name: only alphabetic, max 35 chars
const FIRST_NAME_REGEX = /^[A-Za-z]{1,35}$/;
// Email: basic email format
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
// Must match the backend's resend cooldown (backend/utils/verificationRateLimit.js)
const RESEND_COOLDOWN_SECONDS = 60;


export default function RegisterScreen({ onRegisterSuccess }: RegisterScreenProps = {}) {

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  // Configure Google Sign-In on mount
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: GOOGLE_CLIENT_ID_WEB,
  //     offlineAccess: true,
  //   });
  // }, []);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Remembers when we last sent a code for which email, so that if the user
  // goes back from verify-email.tsx and presses REGISTER again for the same
  // email within the resend cooldown, we skip calling send-code again instead
  // of hitting the backend's cooldown error - the pending code is already
  // sitting in the DB server-side, no need to resend or track a token for it.
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  const validateForm = () => {
    const newErrors = {};

    if (!FIRST_NAME_REGEX.test(firstName.trim())) {
      newErrors.firstName = 'First name must be alphabetic and max 35 characters';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Email is invalid';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // reset previous errors

    try {
      const trimmedEmail = email.trim();
      const trimmedFirstName = firstName.trim();

      // In case user register.tsx <- verify-email.tsx and presses REGISTER again with the same email,
      // Don't send another code to email 
      const stillCoolingDown =
        lastSentEmail === trimmedEmail &&
        lastSentAt !== null &&
        Date.now() - lastSentAt < RESEND_COOLDOWN_SECONDS * 1000;

      let sentAt = lastSentAt;

      if (!stillCoolingDown) {
        // Check if email is already registered + request 6-digit code
        await requestVerificationCode(trimmedEmail);
        sentAt = Date.now();
        setLastSentEmail(trimmedEmail);
        setLastSentAt(sentAt);
      }

      router.push({
        pathname: '/onboarding/verify-email',
        params: {
          email: trimmedEmail,
          firstName: trimmedFirstName,
          password,
          lastSentAt: String(sentAt),
        },
      });
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    // try {
    //   await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    //   const userInfo: GoogleUser = await GoogleSignin.signIn();
    //   console.log('Google User Info:', userInfo);
    //   // Send userInfo.idToken to backend for authentication
    //   // Example: await googleAuth(userInfo.idToken)
    //   // For now, just show success and update context
    //   // You should implement backend call here
    //   Alert.alert('Google Sign-In Success', `Welcome, ${userInfo.user.name || userInfo.user.email}`);
    //   // Optionally, update user context and navigate
    //   // await userProfile, userProgress, updateUserProfile(userInfo.user);
    //   // update user data
    //   // setIsAuthenticated(true);
    //   // router.replace('/(tabs)');
    // } catch (error: any) {
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     // user cancelled
    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     setErrors({ general: 'Google Sign-In is in progress.' });
    //   } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    //     setErrors({ general: 'Google Play Services not available or outdated.' });
    //   } else {
    //     setErrors({ general: error.message || 'Google Sign-In failed.' });
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };




  return (
    <KeyboardAvoidingView
      key={colorScheme}
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={32} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && { color: '#fff' }]}>Create Account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name Input */}
          <View style={{ marginBottom: 0 }}>
            <TextInput
              style={[
                styles.input,
                styles.firstNameInput,
                isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
                errors.firstName && styles.inputError,
              ]}
              placeholder="First Name"
              placeholderTextColor={isDark ? '#888' : undefined}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors({ ...errors, firstName: null });
              }}
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 0 }}>
            <TextInput
              style={[
                styles.input,
                styles.emailInput,
                isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
                errors.email && styles.inputError,
              ]}
              placeholder="Email"
              placeholderTextColor={isDark ? '#888' : undefined}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 0 }}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
                  errors.password && styles.inputError,
                ]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#888' : undefined}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
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
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Server Error */}
          </View>
          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              (loading || firstName.trim() === '' || email.trim() === '' || password.trim() === '' || password.length < 8) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={
              loading ||
              firstName.trim() === '' ||
              email.trim() === '' ||
              password.trim() === '' ||
              password.length < 8
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.registerButtonText}>Registering...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>REGISTER</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && { color: '#aaa' }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Google Sign-In Button */}
        {/* <View style={{ alignItems: 'center'}}>
          <GoogleSigninButton
            style={{ width: width * 0.8, height: 56 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
            disabled={loading}
          />
        </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#aaa',
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderTopWidth: 1,
  },
  firstNameInput: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  emailInput: {
    borderTopWidth: 0,
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
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    marginTop: 0,
    marginBottom: 12,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
});
