import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useLogout';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { updateUserProfile } from '@/api/user';
import { PRIMARY_COLOR, DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import { useColorScheme } from '@/components/useColorScheme';

const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;

export default function AccountScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { userProfile, setUserProfile } = useProfile();
  const { isAuthenticated } = useAuth();
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();

  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const hasChanges =
    firstName.trim() !== (userProfile?.first_name || '') ||
    (lastName.trim() || null) !== (userProfile?.last_name || null) ||
    username.trim() !== (userProfile?.username || '');

  const handleSave = async () => {
    if (!isAuthenticated) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedFirstName) {
      setError('First name is required');
      return;
    }
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError('Username must be 3-30 characters and can only contain letters, numbers, dots, and underscores');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const { data } = await updateUserProfile({
        first_name: trimmedFirstName,
        last_name: trimmedLastName || null,
        username: trimmedUsername,
      });
      await setUserProfile((prev: typeof userProfile) => ({ ...prev, ...data.user }));
      router.back();
    } catch (err: any) {
      setError(err.message || 'Could not update your account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // use Hook useLogout to perform logout and token clearing and API call to invalidate refresh token
              await logout(true);
            } catch (err) {
              console.error('Logout error:', err);
            } finally {
              setIsLoggingOut(false);
              router.replace('/onboarding/login');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteAccount();
              router.replace('/onboarding/login');
            } catch (err) {
              console.error('Delete account error:', err);
              Alert.alert(
                'Delete Failed',
                err instanceof Error ? err.message : 'Could not delete your account. Please try again.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const sectionStyle = [styles.section, isDark && { backgroundColor: DARK_COLORS.surface }];
  const sectionTitleStyle = [styles.sectionTitle, isDark && { color: DARK_COLORS.textSecondary }];
  const labelStyle = [styles.label, isDark && { color: DARK_COLORS.textSecondary }];
  const rowValueDisabledStyle = isDark ? { color: DARK_COLORS.textMuted } : styles.rowValueDisabled;
  const inputStyle = [
    styles.input,
    isDark && { backgroundColor: DARK_COLORS.background, borderColor: DARK_COLORS.border, color: DARK_COLORS.text },
    !isAuthenticated && styles.inputDisabled,
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['bottom']} style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {!isAuthenticated && (
              <View style={[styles.guestNotice, isDark && { backgroundColor: DARK_COLORS.surface }]}>
                <Ionicons name="information-circle-outline" size={20} color={PRIMARY_COLOR} />
                <Text style={[styles.guestNoticeText, isDark && { color: DARK_COLORS.textSecondary }]}>
                  Create an account to edit your profile and save your progress.
                </Text>
              </View>
            )}

            <Text style={sectionTitleStyle}>Profile</Text>
            <View style={sectionStyle}>
              <View style={styles.field}>
                <Text style={labelStyle}>First Name</Text>
                <TextInput
                  style={inputStyle}
                  value={firstName}
                  onChangeText={(text) => { setFirstName(text); if (error) setError(''); }}
                  placeholder="First Name"
                  placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
                  autoCapitalize="words"
                  editable={isAuthenticated && !saving}
                />
              </View>

              <View style={styles.field}>
                <Text style={labelStyle}>Last Name</Text>
                <TextInput
                  style={inputStyle}
                  value={lastName}
                  onChangeText={(text) => { setLastName(text); if (error) setError(''); }}
                  placeholder="Last Name (optional)"
                  placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
                  autoCapitalize="words"
                  editable={isAuthenticated && !saving}
                />
              </View>

              <View style={styles.field}>
                <Text style={labelStyle}>Username</Text>
                <TextInput
                  style={inputStyle}
                  value={username}
                  onChangeText={(text) => { setUsername(text); if (error) setError(''); }}
                  placeholder="Username"
                  placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={isAuthenticated && !saving}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {isAuthenticated && (
              <TouchableOpacity
                style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}

            <Text style={sectionTitleStyle}>Account</Text>
            <View style={sectionStyle}>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={labelStyle}>Email</Text>
                  <Text
                    style={[
                      styles.rowValue,
                      isDark && { color: DARK_COLORS.text },
                      !isAuthenticated && rowValueDisabledStyle,
                    ]}
                  >
                    {isAuthenticated ? userProfile?.email : 'Not signed in'}
                  </Text>
                </View>
              </View>
            </View>

            {isAuthenticated && (
              <TouchableOpacity
                style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                )}
                <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
              </TouchableOpacity>
            )}

            {isAuthenticated && (
              <View style={styles.dangerZone}>
                <Text style={[styles.dangerZoneTitle, isDark && { color: DARK_COLORS.textSecondary }]}>Danger Zone</Text>
                <TouchableOpacity
                  style={[styles.deleteAccountButton, isDark && { backgroundColor: DARK_COLORS.surface }, isDeletingAccount && styles.logoutButtonDisabled]}
                  onPress={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator size="small" color="#dc3545" />
                  ) : (
                    <Ionicons name="trash-outline" size={22} color="#dc3545" />
                  )}
                  <Text style={styles.deleteAccountText}>
                    {isDeletingAccount ? 'Deleting account...' : 'Delete Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  field: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  guestNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  guestNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  rowValueDisabled: {
    color: '#aaa',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dangerZone: {
    marginTop: 24,
  },
  dangerZoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
    gap: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
  },
});
