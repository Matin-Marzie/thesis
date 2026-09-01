import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DARK_COLORS } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { getMediaUrl } from '@/utils/mediaUrl';
import { formatDuration } from '@/utils/formatDuration';
import TouchableOpacity from '@/components/TouchableOpacity';

interface ProfileReel {
  id: string | number;
  thumbnail_url?: string;
  duration?: number;
  // Login seeds this list with a flat `language_id`; a reel prepended
  // right after creation carries the full `language` object instead
  // (same shape reels-service's GET /reels returns).
  language_id?: number;
  language?: { id: number };
}

// Built once at module load, not on every render/reel - a plain id -> flag
// lookup instead of scanning LANGUAGES_META's values on every call.
const LANGUAGE_FLAG_BY_ID: Record<number, string> = Object.fromEntries(
  Object.values(LANGUAGES_META).map((l) => [l.id, l.flag])
);

const getLanguageFlag = (languageId?: number) =>
  languageId != null ? LANGUAGE_FLAG_BY_ID[languageId] : undefined;

interface ProfileReelsProps {
  isDark: boolean;
  reels: ProfileReel[];
  title?: string;
  onReelPress?: (reel: ProfileReel) => void;
}

export function ProfileReels({ isDark, reels, title = 'My Reels', onReelPress }: ProfileReelsProps) {
  const router = useRouter();

  if (!reels?.length) return null;

  return (
    <View style={styles.reelsSection}>
      <Text style={[styles.sectionTitle, isDark && { color: DARK_COLORS.text }]}>{title}</Text>
      <View style={styles.reelsGrid}>
        {reels.map((reel) => {
          const languageFlag = getLanguageFlag(reel.language_id ?? reel.language?.id);
          return (
            <TouchableOpacity
              key={reel.id}
              style={[styles.reelTile, isDark && { backgroundColor: DARK_COLORS.surface }]}
              onPress={() => (onReelPress ? onReelPress(reel) : router.push(`/profileReel/${reel.id}`))}
              activeOpacity={0.85}
            >
              {reel.thumbnail_url ? (
                <Image source={{ uri: getMediaUrl(reel.thumbnail_url) }} style={styles.reelThumbnail} />
              ) : (
                <View style={styles.reelPlaceholder}>
                  <Ionicons name="film-outline" size={28} color={isDark ? DARK_COLORS.textSecondary : '#bbb'} />
                </View>
              )}
              {languageFlag && (
                <View style={styles.reelLanguageBadge}>
                  <Text style={styles.reelLanguageText}>{languageFlag}</Text>
                </View>
              )}
              <View style={styles.reelDurationBadge}>
                <Text style={styles.reelDurationText}>{formatDuration(reel.duration)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reelsSection: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 8,
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '0.5%',
    rowGap: 2,
  },
  reelTile: {
    width: '33%',
    aspectRatio: 9 / 16,
    borderRadius: 4,
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
  reelLanguageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  reelLanguageText: {
    fontSize: 11,
  },
});
