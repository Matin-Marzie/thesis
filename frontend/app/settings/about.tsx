import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { PRIMARY_COLOR, APP_TAGLINE, DARK_COLORS } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';

export default function AboutScreen() {
  const isDark = useColorScheme() === 'dark';
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const iconColor = isDark ? DARK_COLORS.textSecondary : '#888';
  const sectionStyle = [styles.section, isDark && { backgroundColor: DARK_COLORS.surface }];
  const sectionTitleStyle = [styles.sectionTitle, isDark && { color: DARK_COLORS.textSecondary }];
  const descriptionStyle = [styles.description, isDark && { color: DARK_COLORS.textSecondary }];
  const badgeStyle = [styles.badge, isDark && { backgroundColor: 'rgba(15, 134, 144, 0.2)' }];
  const dividerStyle = [styles.divider, isDark && { backgroundColor: DARK_COLORS.border }];
  const authorNameStyle = [styles.authorName, isDark && { color: DARK_COLORS.text }];
  const authorMetaStyle = [styles.authorMeta, isDark && { color: DARK_COLORS.textSecondary }];

  return (
    <ScrollView
      style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo} />
        </View>
        <Text style={[styles.appName, isDark && { color: DARK_COLORS.text }]}>Glosy</Text>
        <Text style={[styles.tagline, isDark && { color: DARK_COLORS.textSecondary }]}>{APP_TAGLINE}</Text>
        <View style={badgeStyle}>
          <Text style={styles.badgeText}>Version {version}</Text>
        </View>
      </View>

      <Text style={sectionTitleStyle}>About the App</Text>
      <View style={sectionStyle}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.iconBubble, isDark && { backgroundColor: 'rgba(15, 134, 144, 0.2)' }]}>
            <Ionicons name="film-outline" size={18} color={PRIMARY_COLOR} />
          </View>
          <Text style={[styles.cardTitle, isDark && { color: DARK_COLORS.text }]}>Learn by watching</Text>
        </View>
        <Text style={descriptionStyle}>
          Swipe through subtitled short-form video reels, build vocabulary as you go, and
          reinforce what you learn with quick, playable games like Wordle-style challenges.
        </Text>
      </View>

      <Text style={sectionTitleStyle}>Academic Project</Text>
      <View style={sectionStyle}>
        <View style={styles.authorRow}>
          <View style={[styles.iconBubble, isDark && { backgroundColor: 'rgba(15, 134, 144, 0.2)' }]}>
            <Ionicons name="school-outline" size={18} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.authorText}>
            <Text style={authorNameStyle}>Mohammad Matin Marzie</Text>
            <Text style={authorMetaStyle}>Ionian University</Text>
          </View>
        </View>
        <View style={dividerStyle} />
        <Text style={descriptionStyle}>
          Glosy was developed as part of a thesis on mobile-assisted language learning using
          short-form video reels and hypercasual games.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e6f4f5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
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
    padding: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e6f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorText: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  authorMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 14,
  },
});
