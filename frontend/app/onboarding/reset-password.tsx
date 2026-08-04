import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import { resetPassword } from '../../api/auth';
import { useColorScheme } from '@/components/useColorScheme';
import TouchableOpacity from '@/components/TouchableOpacity';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Carried forward as route params from verify-reset-code.tsx (in-memory
  // navigation state only, lost if the app is killed).
  const params = useLocalSearchParams<{ email: string; code: string }>();
  const { email, code } = params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ general?: string; password?: string }>({});

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const hasInput =
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    !passwordsMismatch;

  const handleReset = async () => {
    if (newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await resetPassword({ email, code, new_password: newPassword });

      Alert.alert(
        'Password Reset',
        response.data?.message || 'Your password has been reset. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Pop this screen, then verify-reset-code, then forgot-password,
              // landing back on login
              router.back();
              router.back();
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      key={colorScheme}
      style={styles.container}
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
          <Text style={styles.title}>Reset Password</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.subtitle, isDark && { color: '#aaa' }]}>
            Choose a new password for your account.
          </Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                styles.passwordInputTop,
                isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
              ]}
              placeholder="New Password"
              placeholderTextColor={isDark ? '#888' : undefined}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              autoFocus
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

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                styles.passwordInputBottom,
                isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
              ]}
              placeholder="Confirm New Password"
              placeholderTextColor={isDark ? '#888' : undefined}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={isDark ? '#aaa' : '#666'}
              />
            </TouchableOpacity>
          </View>

          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!hasInput || loading) &&
                (isDark ? { backgroundColor: '#444', opacity: 1 } : styles.buttonDisabled),
            ]}
            onPress={handleReset}
            disabled={!hasInput || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Resetting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>RESET PASSWORD</Text>
            )}
          </TouchableOpacity>
        </View>
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordInputTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  passwordInputBottom: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 0,
  },
  eyeIcon: { position: 'absolute', right: 12, padding: 4 },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 1,
  },
});
