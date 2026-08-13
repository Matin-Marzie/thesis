import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import TouchableOpacity from '../components/TouchableOpacity';
import { useColorScheme } from '../components/useColorScheme';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { DARK_COLORS } from '../constants/App';
import { DEFAULT_USER_PROFILE } from '../constants/defaults';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL, OSS_LICENSES_URL, FEEDBACK_URL } from '../config/legal.config';

export default function SettingsScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useProfile();

  const handleOpenFeedback = async () => {
    try {
      // WebBrowser opens a separate browser process with no JS bridge back
      // to the app, so the only way to hand it the signed-in user's email
      // (to save them retyping it) is via a URL query param - the page
      // reads it and pre-fills the field. Skip it for guests/unauthenticated
      // users so the form doesn't get the placeholder default email.
      const email = isAuthenticated && userProfile?.email && userProfile.email !== DEFAULT_USER_PROFILE.email
        ? userProfile.email
        : null;
      const url = email ? `${FEEDBACK_URL}?email=${encodeURIComponent(email)}` : FEEDBACK_URL;
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Open feedback error:', error);
      Alert.alert('Could not open page', 'Please try again later.');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
    } catch (error) {
      console.error('Open privacy policy error:', error);
      Alert.alert('Could not open page', 'Please try again later.');
    }
  };

  const handleOpenTermsOfUse = async () => {
    try {
      await WebBrowser.openBrowserAsync(TERMS_OF_USE_URL);
    } catch (error) {
      console.error('Open terms of use error:', error);
      Alert.alert('Could not open page', 'Please try again later.');
    }
  };

  const handleOpenOssLicenses = async () => {
    try {
      await WebBrowser.openBrowserAsync(OSS_LICENSES_URL);
    } catch (error) {
      console.error('Open OSS licenses error:', error);
      Alert.alert('Could not open page', 'Please try again later.');
    }
  };

  const iconColor = isDark ? DARK_COLORS.text : '#333';
  const chevronColor = isDark ? DARK_COLORS.textSecondary : '#999';

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        {/* Menu Items */}
        <View style={[styles.menuSection, isDark && { backgroundColor: DARK_COLORS.surface }]}>
          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={() => router.push('/settings/account')}>
            <Ionicons name="person-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Account</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={() => router.push('/settings/vibrations')}>
            <Ionicons name="pulse-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Vibrations</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={() => router.push('/settings/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={handleOpenFeedback}>
            <Ionicons name="help-circle-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]}>
            <Ionicons name="information-circle-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={[styles.menuSection, isDark && { backgroundColor: DARK_COLORS.surface }]}>
          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={handleOpenPrivacyPolicy}>
            <Ionicons name="shield-checkmark-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={handleOpenTermsOfUse}>
            <Ionicons name="document-text-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && { borderBottomColor: DARK_COLORS.border }]} onPress={handleOpenOssLicenses}>
            <Ionicons name="code-slash-outline" size={24} color={iconColor} />
            <Text style={[styles.menuText, isDark && { color: DARK_COLORS.text }]}>Open Source Licenses</Text>
            <Ionicons name="chevron-forward" size={20} color={chevronColor} />
          </TouchableOpacity>
        </View>
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
});
