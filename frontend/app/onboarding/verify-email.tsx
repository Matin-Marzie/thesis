import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import { registerUser, requestVerificationCode } from '../../api/auth';
import { useAppContext } from '../../context/AppContext';
import { VOCABULARY_ACTIONS } from '@/hooks/useVocabulary';
import { useColorScheme } from '@/components/useColorScheme';

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Carried forward as route params from register.tsx (in-memory navigation
  // state only, lost if the app is killed).
  const params = useLocalSearchParams<{
    email: string;
    firstName: string;
    password: string;
    lastSentAt: string;
  }>();
  const { email, firstName, password } = params;

  const {
    userProfile,
    userProgress,
    vocabularyChanges,
    updateUserProfile,
    setUserProgress,
    vocabularyDispatch,
    setIsAuthenticated,
  } = useAppContext();

  const [sixDigitCode, setSixDigitCode] = useState('');
  const [isCodeInputFocused, setIsCodeInputFocused] = useState(false);
  const codeInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // Kept in sync with register.tsx's own lastSentAt: if the code was actually
  // sent some seconds ago (e.g. reused after going back), start the countdown
  // from what's actually left, not a fresh 60s.
  const [cooldown, setCooldown] = useState(() => {
    const sentAt = Number(params.lastSentAt);
    if (!sentAt) return RESEND_COOLDOWN_SECONDS;
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (sixDigitCode.length !== 6) {
      setErrors({ general: 'Enter the 6-digit code' });
      return;
    }
    if (!firstName || !password) {
      setErrors({ general: 'Registration session expired. Please register again.' });
      router.replace('/onboarding/register');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        password,
        user_profile: {
          ...userProfile,
          first_name: firstName,
          email,
        },
        user_progress: userProgress,
        vocabulary_changes: vocabularyChanges,
      };

      const response = await registerUser({
        ...payload,
        email_verification_code: sixDigitCode,
      });

      if (response.status === 201) {
        setIsAuthenticated(true);
        if (response.data) {
          await updateUserProfile(response.data?.user_profile);
          await setUserProgress(response.data?.user_progress);
          vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: response.data?.user_vocabulary });
        }
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrors({});
    try {
      await requestVerificationCode(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setSixDigitCode('');
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      key={colorScheme}
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
          <Text style={styles.title}>Verify Email</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.subtitleWrap}>
            <Text style={[styles.subtitle, isDark && { color: '#aaa' }]}>Enter the 6-digit code sent to </Text>
            <Text style={[styles.subtitle, styles.emailText, isDark && { color: '#fff' }]}>{email}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.codeBoxesRow}
            onPress={() => codeInputRef.current?.focus()}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const isActive = isCodeInputFocused && i === sixDigitCode.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    isDark && { backgroundColor: '#1c1c1c', borderColor: '#333' },
                    isActive && styles.codeBoxActive,
                    errors.general && styles.codeBoxError,
                  ]}
                >
                  <Text style={[styles.codeBoxText, isDark && { color: '#fff' }]}>{sixDigitCode[i] ?? ''}</Text>
                </View>
              );
            })}

            <TextInput
              ref={codeInputRef}
              style={styles.hiddenInput}
              pointerEvents="none"
              value={sixDigitCode}
              onChangeText={(text) => {
                setSixDigitCode(text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH));
                if (errors.general) setErrors({});
              }}
              onFocus={() => setIsCodeInputFocused(true)}
              onBlur={() => setIsCodeInputFocused(false)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              editable={!loading}
              caretHidden
              autoFocus
            />
          </TouchableOpacity>

          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

          <TouchableOpacity
            style={[
              styles.registerButton,
              (loading || sixDigitCode.length !== 6) &&
                (isDark ? { backgroundColor: '#444', opacity: 1 } : styles.buttonDisabled),
            ]}
            onPress={handleVerify}
            disabled={loading || sixDigitCode.length !== 6}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.registerButtonText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>VERIFY</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || resending}>
              <Text
                style={[
                  styles.footerLink,
                  (cooldown > 0 || resending) && (isDark ? { color: '#aaa' } : styles.registerButtonTextDisabled),
                ]}>
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend code (${cooldown}s)`
                  : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
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
  subtitleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    color: '#333',
  },
  codeBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  codeBox: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  codeBoxActive: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  },
  codeBoxError: {
    borderColor: '#ff3b30',
  },
  codeBoxText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // opacity: 0 exactly makes RN treat the view as non-interactive for hit
    // testing on iOS, so a blurred input can't be tapped to refocus - use a
    // barely-nonzero value instead, visually identical but still tappable.
    opacity: 0.01,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
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
  footerLink: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
});
