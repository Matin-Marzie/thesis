import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset } from '../../api/auth';
import { PRIMARY_COLOR } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import TouchableOpacity from '@/components/TouchableOpacity';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Carried forward from login.tsx when what the user typed there looked
  // like an email, so they don't have to retype it here.
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(emailParam ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // In case the user goes back from reset-password and submits the same
  // email again, don't send another code - same pattern as register.tsx.
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  const hasInput = EMAIL_REGEX.test(email.trim());

  const handleSendCode = async () => {
    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Email is in wrong format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const stillCoolingDown =
        lastSentEmail === trimmedEmail &&
        lastSentAt !== null &&
        Date.now() - lastSentAt < RESEND_COOLDOWN_SECONDS * 1000;

      let sentAt = lastSentAt;

      if (!stillCoolingDown) {
        await requestPasswordReset(trimmedEmail);
        sentAt = Date.now();
        setLastSentEmail(trimmedEmail);
        setLastSentAt(sentAt);
      }

      router.push({
        pathname: '/onboarding/verify-reset-code',
        params: {
          email: trimmedEmail,
          lastSentAt: String(sentAt),
        },
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container]}>
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
          <Text style={[styles.title, isDark && { color: '#eee' }]}>Forgot Password</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.subtitle, isDark && { color: '#aaa' }]}>
            Enter the email associated with your account. We'll send you a code to reset your password.
          </Text>

          <TextInput
            style={[
              styles.input,
              isDark && { backgroundColor: '#1c1c1c', borderColor: '#333', color: '#fff' },
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? '#888' : undefined}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, (!hasInput || loading) && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={!hasInput || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Sending...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>SEND CODE</Text>
            )}
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    marginTop: 8,
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
    opacity: 0.6,
  },
});
