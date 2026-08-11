import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useUserReels } from '@/context/UserReelsContext';
import { useAuth } from '@/context/AuthContext';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { formatCompactNumber } from '@/utils/formatCompactNumber';
import { fixMediaUrl } from '@/utils/fixMediaUrl';
import { PRIMARY_COLOR, DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import { useColorScheme } from '@/components/useColorScheme';

const formatDuration = (seconds?: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userProfile } = useProfile();
  const { userProgress } = useProgress();
  const { userReels } = useUserReels();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const currentLanguage = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
  const languageMeta = Object.values(LANGUAGES_META).find((l) => l.id === Number(currentLanguage?.learning_language?.id));

  const initial = (userProfile?.first_name || userProfile?.username || '?').charAt(0).toUpperCase();

  const cardStyle = [styles.card, isDark && { backgroundColor: DARK_COLORS.surface }];
  const statValueStyle = [styles.statValue, isDark && { color: DARK_COLORS.text }];
  const statLabelStyle = [styles.statLabel, isDark && { color: DARK_COLORS.textSecondary }];
  const dividerStyle = [styles.statDivider, isDark && { backgroundColor: DARK_COLORS.border }];

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        {userProfile && (
          <>
            {/* User Identity */}
            <View style={styles.userSection}>
              <View style={styles.avatarRing}>
                {userProfile?.profile_picture ? (
                  <Image source={{ uri: userProfile.profile_picture }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarInitial}>
                    <Text style={styles.avatarInitialText}>{initial}</Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, isDark && { color: DARK_COLORS.text }]}>
                  {userProfile.first_name || userProfile.username}
                </Text>
                <Text style={[styles.userHandle, isDark && { color: DARK_COLORS.textSecondary }]}>
                  @{userProfile.username}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={cardStyle}>
              <View style={styles.statTile}>
                <Text style={styles.statIcon}>{languageMeta?.flag || '🏳️'}</Text>
                <Text style={statValueStyle}>{currentLanguage?.proficiency_level || 'A1'}</Text>
                <Text style={statLabelStyle}>Level</Text>
              </View>
              <View style={dividerStyle} />
              <View style={styles.statTile}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={statValueStyle}>{formatCompactNumber(currentLanguage?.experience || 0)}</Text>
                <Text style={statLabelStyle}>XP</Text>
              </View>
              <View style={dividerStyle} />
              <View style={styles.statTile}>
                <Text style={styles.statIcon}>🪙</Text>
                <Text style={statValueStyle}>{formatCompactNumber(userProgress?.coins || 0)}</Text>
                <Text style={statLabelStyle}>Coins</Text>
              </View>
              <View style={dividerStyle} />
              <View style={styles.statTile}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={statValueStyle}>{formatCompactNumber(userProgress?.energy || 0)}</Text>
                <Text style={statLabelStyle}>Energy</Text>
              </View>
            </View>

            {/* My Reels */}
            {userReels?.length > 0 && (
              <View style={styles.reelsSection}>
                <Text style={[styles.sectionTitle, isDark && { color: DARK_COLORS.text }]}>My Reels</Text>
                <View style={styles.reelsGrid}>
                  {userReels.map((reel) => (
                    <View key={reel.id} style={[styles.reelTile, isDark && { backgroundColor: DARK_COLORS.surface }]}>
                      {reel.thumbnail_url ? (
                        <Image source={{ uri: fixMediaUrl(reel.thumbnail_url) }} style={styles.reelThumbnail} />
                      ) : (
                        <View style={styles.reelPlaceholder}>
                          <Ionicons name="film-outline" size={28} color={isDark ? DARK_COLORS.textSecondary : '#bbb'} />
                        </View>
                      )}
                      <View style={styles.reelDurationBadge}>
                        <Text style={styles.reelDurationText}>{formatDuration(reel.duration)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Auth Buttons - Show only when not authenticated */}
        {!isAuthenticated && (
          <View style={styles.authSection}>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => router.push('/onboarding/register')}
            >
              <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isDark && { backgroundColor: DARK_COLORS.surface }]}
              onPress={() => router.push('/onboarding/login')}
            >
              <Text style={styles.loginText}>LOGIN</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarInitial: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#eee',
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
  },
  reelsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reelTile: {
    width: '31.5%',
    aspectRatio: 9 / 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelDurationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  reelDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
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
