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
import { registerUser,  } from '../../api/auth';
import { useAppContext } from '../../context/AppContext';


// Hardcoded client IDs for Google Sign-In


interface RegisterScreenProps {
  onRegisterSuccess?: () => void;
}


// First name: only alphabetic, max 35 chars
const FIRST_NAME_REGEX = /^[A-Za-z]{1,35}$/;
// Email: basic email format
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;


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

  const { user, updateUserProfile, setUserProgress, setUserVocabulary, setIsAuthenticated } = useAppContext();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      const payload = {
        ...user,
        first_name: firstName.trim(),
        email: email.trim(),
        password,
      };

      const response = await registerUser(payload);

      if (response.status === 201) {
        setIsAuthenticated(true); // we have set the token previously in auth.js

        // update user data
        if (response.data) {
          await updateUserProfile(response.data?.user_profile);
          await setUserProgress(response.data?.user_progress);
          await setUserVocabulary(response.data?.user_vocabulary);
        }
        router.replace('/(tabs)');
      }
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
    //   // await updateUserProfile(userInfo.user);
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
      style={styles.container}
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
            onPress={() => router.push('/onboarding/landing')}
          >
            <Ionicons name="arrow-back" size={32} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.title}>Creat Account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name Input */}
          <View style={{ marginBottom: 0 }}>
            <TextInput
              style={[styles.input, styles.firstNameInput, errors.firstName && styles.inputError]}
              placeholder="First Name"
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
              style={[styles.input, styles.emailInput, errors.email && styles.inputError]}
              placeholder="Email"
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
                style={[styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Password"
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
                  color="#666"
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.registerButtonText,
                  (loading || firstName.trim() === '' || email.trim() === '' || password.trim() === '') && styles.registerButtonTextDisabled,
                ]}
              >
                REGISTER
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
    backgroundColor: '#fff',
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
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 1,
  },
  registerButtonTextDisabled: {
    color: '#888',
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
