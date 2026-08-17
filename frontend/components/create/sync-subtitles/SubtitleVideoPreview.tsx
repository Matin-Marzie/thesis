import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, VideoPlayer } from 'expo-video';

interface SubtitleVideoPreviewProps {
  player: VideoPlayer;
}

export function SubtitleVideoPreview({ player }: SubtitleVideoPreviewProps) {
  return (
    <View style={styles.videoWrapper}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
    </View>
  );
}

const styles = StyleSheet.create({
  videoWrapper: { height: 260, backgroundColor: '#000' },
  video: { flex: 1 },
});
