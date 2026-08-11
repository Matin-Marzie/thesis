import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';

interface ProfileAuthButtonsProps {
  isDark: boolean;
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function ProfileAuthButtons({ isDark, onCreateAccount, onLogin }: ProfileAuthButtonsProps) {
  return (
    <View style={styles.authSection}>
      <TouchableOpacity style={styles.createAccountButton} onPress={onCreateAccount}>
        <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, isDark && { backgroundColor: DARK_COLORS.surface }]}
        onPress={onLogin}
      >
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  authSection: {
    paddingVertical: 20,
    gap: 16,
  },
  createAccountButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  loginText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
