import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { VideoView, VideoPlayer } from 'expo-video';
import { FontAwesome } from '@expo/vector-icons';
import { formatMs } from './formatMs';

interface SubtitleVideoPreviewProps {
  player: VideoPlayer;
  isPlaying: boolean;
  currentTimeMs: number;
  onTogglePlay: () => void;
}

export function SubtitleVideoPreview({ player, isPlaying, currentTimeMs, onTogglePlay }: SubtitleVideoPreviewProps) {
  return (
    <View style={styles.videoWrapper}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
      <Pressable style={styles.playOverlay} onPress={onTogglePlay}>
        <FontAwesome name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
      </Pressable>
      <View style={styles.timeBadge}>
        <Text style={styles.timeBadgeText}>{formatMs(currentTimeMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoWrapper: { height: 260, backgroundColor: '#000' },
  video: { flex: 1 },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
