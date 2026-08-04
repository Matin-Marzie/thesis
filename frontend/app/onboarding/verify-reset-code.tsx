import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import { requestPasswordReset, verifyResetCode } from '../../api/auth';
import { useColorScheme } from '@/components/useColorScheme';
import TouchableOpacity from '@/components/TouchableOpacity';

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

export default function VerifyResetCodeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Carried forward as route params from forgot-password.tsx (in-memory
  // navigation state only, lost if the app is killed).
  const params = useLocalSearchParams<{ email: string; lastSentAt: string }>();
  const { email } = params;

  const [sixDigitCode, setSixDigitCode] = useState('');
  const [isCodeInputFocused, setIsCodeInputFocused] = useState(false);
  const codeInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // Kept in sync with forgot-password.tsx's own lastSentAt: if the code was
  // actually sent some seconds ago (e.g. reused after going back), start the
  // countdown from what's actually left, not a fresh 60s.
  const [cooldown, setCooldown] = useState(() => {
    const sentAt = Number(params.lastSentAt);
    if (!sentAt) return RESEND_COOLDOWN_SECONDS;
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
  });
  const [errors, setErrors] = useState<{ general?: string }>({});
  // Set on a 429 (too many wrong attempts) - blocks further verify calls
  // until the user requests a fresh code, which resets attempts server-side.
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  // Set on a plain wrong-code response - blocks re-submitting the same
  // rejected code; cleared as soon as the user edits it.
  const [codeRejected, setCodeRejected] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (maxAttemptsReached || codeRejected) return;

    if (sixDigitCode.length !== CODE_LENGTH) {
      setErrors({ general: 'Enter the 6-digit code' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await verifyResetCode({ email, code: sixDigitCode });

      router.push({
        pathname: '/onboarding/reset-password',
        params: { email, code: sixDigitCode },
      });
    } catch (error: any) {
      setErrors({ general: error.message });
      if (error.status === 429) {
        setMaxAttemptsReached(true);
      } else {
        setCodeRejected(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrors({});
    try {
      await requestPasswordReset(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setSixDigitCode('');
      // A fresh code resets attempts server-side, so verifying is allowed again
      setMaxAttemptsReached(false);
      setCodeRejected(false);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setResending(false);
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
          <Text style={styles.title}>Verify Code</Text>
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
                const next = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
                // Editing a rejected code re-activates VERIFY; a maxed-out
                // code stays blocked regardless, until the user resends
                if (next !== sixDigitCode) {
                  setCodeRejected(false);
                }
                setSixDigitCode(next);
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
              styles.submitButton,
              (loading || sixDigitCode.length !== CODE_LENGTH || maxAttemptsReached || codeRejected) &&
                (isDark ? { backgroundColor: '#444', opacity: 1 } : styles.buttonDisabled),
            ]}
            onPress={handleVerify}
            disabled={loading || sixDigitCode.length !== CODE_LENGTH || maxAttemptsReached || codeRejected}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>VERIFY</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || resending}>
              <Text
                style={[
                  styles.footerLink,
                  (cooldown > 0 || resending) && (isDark ? { color: '#aaa' } : styles.footerLinkDisabled),
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
  footerLinkDisabled: {
    color: '#888',
  },
});
