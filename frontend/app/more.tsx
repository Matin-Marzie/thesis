import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import TouchableOpacity from '../components/TouchableOpacity';
import { useColorScheme } from '../components/useColorScheme';
import { DARK_COLORS } from '../constants/App';

export default function MoreScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { logout } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { deleteAccount } = useDeleteAccount();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
            } catch (error) {
              console.error('Logout error:', error);
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
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert(
                'Delete Failed',
                error instanceof Error ? error.message : 'Could not delete your account. Please try again.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const iconColor = isDark ? DARK_COLORS.text : '#333';
  const chevronColor = isDark ? DARK_COLORS.textSecondary : '#999';

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        {/* Menu Items */}
        <View style={[styles.menuSection, isDark && { backgroundColor: DARK_COLORS.surface }]}>
          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]}>
            <Ionicons name="help-circle-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]}>
            <Ionicons name="information-circle-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
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

        {/* Danger Zone */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 12,
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
