import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { fixMediaUrl } from '@/utils/fixMediaUrl';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileReels } from '@/components/profile/ProfileReels';
import TouchableOpacity from '@/components/TouchableOpacity';
import { getUserById, getUserReels } from '@/api/user';

interface CreatorProfile {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
  joined_date: string | null;
}

// Public, read-only profile for ANOTHER user - reached by tapping a creator's
// avatar in the reels feed. Unlike (tabs)/profile.tsx, this fetches its data
// from the backend on every visit rather than reading the locally-persisted
// ProfileContext/ProgressContext/UserReelsContext, which only ever hold the
// current device's own account.
export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [reels, setReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, reelsRes] = await Promise.all([
        getUserById(id),
        getUserReels(id),
      ]);
      setProfile(profileRes?.data?.user ?? null);
      setReels(reelsRes?.data?.reels ?? []);
    } catch (err: any) {
      setError(err?.message || 'Could not load this profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReelPress = useCallback(
    (reel: any) => {
      if (!profile) return;
      router.push({
        pathname: `/creator/${id}/reel/${reel.id}`,
        params: {
          creatorUsername: profile.username || '',
          creatorProfilePicture: profile.profile_picture || '',
        },
      });
    },
    [router, id, profile]
  );

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}
    >
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      )}

      {!isLoading && error && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, isDark && { color: DARK_COLORS.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && profile && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ProfileHeader
              isDark={isDark}
              firstName={profile.first_name || undefined}
              username={profile.username}
              profilePicture={fixMediaUrl(profile.profile_picture || undefined)}
              showSettingsLink={false}
            />

            <ProfileReels
              isDark={isDark}
              reels={reels}
              title="Reels"
              onReelPress={handleReelPress}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {},
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
