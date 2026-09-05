import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer, { getYoutubeMeta } from 'react-native-youtube-iframe';
import { FontAwesome } from '@expo/vector-icons';
import { useProgress } from '@/context/ProgressContext';
import { getVideosByCode } from '@/api/videos';
import { extractYoutubeVideoId } from '@/utils/youtube';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';

export default function VideosScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userProgress } = useProgress();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Only one player is ever mounted at a time - mounting a WebView per
  // video (up to ~45 of them) would be expensive, so tapping a thumbnail
  // swaps the single active player to that video instead.
  const [playingId, setPlayingId] = useState(null);
  // Videos whose owner disabled embedding (or any other unrecoverable
  // player error) - the uploader controls this, an app can't override it,
  // so these permanently fall back to "open in YouTube" instead of
  // re-attempting the broken inline player.
  const [erroredIds, setErroredIds] = useState(() => new Set());
  // Titles for videos that were seeded without one, fetched lazily via
  // YouTube's oEmbed endpoint - keyed by video row id, not video id, since
  // that's what everything else here keys on.
  const [fetchedTitles, setFetchedTitles] = useState({});

  const currentLang = useMemo(() => {
    return userProgress?.languages?.find((l) => l.is_current_language) || null;
  }, [userProgress?.languages]);

  const learningLanguageCode = currentLang?.learning_language?.code;

  useEffect(() => {
    if (!learningLanguageCode) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getVideosByCode(learningLanguageCode)
      .then((res) => {
        if (cancelled) return;
        setVideos(res?.videos || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [learningLanguageCode]);

  // Backfill titles for videos stored without one. oEmbed is gated by the
  // same "allow embedding" permission as playback, so this silently yields
  // no title for videos that have embedding disabled - that's expected,
  // not an error.
  useEffect(() => {
    const missing = videos.filter((v) => !v.title);
    if (missing.length === 0) return;

    let cancelled = false;

    missing.forEach((video) => {
      const videoId = extractYoutubeVideoId(video.youtube_url);
      if (!videoId) return;

      getYoutubeMeta(videoId)
        .then((meta) => {
          if (cancelled || !meta?.title) return;
          setFetchedTitles((current) => ({ ...current, [video.id]: meta.title }));
        })
        .catch(() => {
          // Embedding disabled, network error, etc. - just leave it untitled.
        });
    });

    return () => {
      cancelled = true;
    };
  }, [videos]);

  const handleToggle = useCallback((id) => {
    setPlayingId((current) => (current === id ? null : id));
  }, []);

  const handlePlayerError = useCallback((id) => {
    setPlayingId((current) => (current === id ? null : current));
    setErroredIds((current) => new Set(current).add(id));
  }, []);

  const openInYoutube = useCallback((url) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const videoId = extractYoutubeVideoId(item.youtube_url);
      if (!videoId) return null;
      const isPlaying = playingId === item.id;
      const hasErrored = erroredIds.has(item.id);
      const title = item.title || fetchedTitles[item.id];

      return (
        <View style={[styles.card, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}>
          {isPlaying ? (
            <YoutubePlayer
              height={220}
              videoId={videoId}
              play
              onChangeState={(state) => {
                if (state === 'ended') setPlayingId(null);
              }}
              onError={() => handlePlayerError(item.id)}
            />
          ) : (
            <TouchableOpacity
              onPress={() => (hasErrored ? openInYoutube(item.youtube_url) : handleToggle(item.id))}
              activeOpacity={0.85}
            >
              <Image source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} style={styles.thumbnail} />
              <View style={styles.playOverlay} pointerEvents="none">
                <FontAwesome name={hasErrored ? 'external-link' : 'play-circle'} size={48} color="#fff" />
              </View>
              {hasErrored && (
                <View style={styles.errorBadge} pointerEvents="none">
                  <Text style={styles.errorBadgeText}>Can't play here - tap to open in YouTube</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {!!title && (
            <TouchableOpacity onPress={() => (hasErrored ? openInYoutube(item.youtube_url) : handleToggle(item.id))}>
              <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]} numberOfLines={2}>
                {title}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [isDark, playingId, erroredIds, fetchedTitles, handleToggle, handlePlayerError, openInYoutube]
  );

  let content;
  if (loading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.centered}>
        <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>{error}</Text>
      </View>
    );
  } else if (!learningLanguageCode) {
    content = (
      <View style={styles.centered}>
        <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>No learning language selected.</Text>
      </View>
    );
  } else {
    content = (
      <FlatList
        style={styles.container}
        data={videos}
        keyExtractor={(item) => `video-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>No videos yet.</Text>
        }
      />
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 6,
  },
  errorBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    padding: 10,
  },
});
