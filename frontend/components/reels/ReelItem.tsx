import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { API_BASE_URL } from '@/config/api.config';
import { ReelOverlay } from './ReelOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Replaces "localhost" in video URLs with the actual LAN host so physical
// devices can reach the dev server (extracted from API_BASE_URL).
const fixVideoUrl = (url: string): string => {
  if (!url) return url;
  const apiHost = API_BASE_URL.match(/https?:\/\/([^:/]+)/)?.[1];
  if (apiHost && url.includes('localhost')) {
    return url.replace('localhost', apiHost);
  }
  return url;
};

interface ReelItemProps {
  item: any;
  // True when this card is the one currently visible in the FlatList viewport
  isActive: boolean;
  // False when the user navigates to a different tab
  isScreenFocused: boolean;
}

// Full-screen reel card: video player + buffering spinner + translucent overlay.
// Wrapped in React.memo so only active-index or focus changes trigger re-renders.
export const ReelItem = React.memo(
  ({ item, isActive, isScreenFocused }: ReelItemProps) => {
    const [isLiked, setIsLiked] = useState(
      item.user_interaction?.is_liked || false
    );
    const [isSaved, setIsSaved] = useState(
      item.user_interaction?.is_saved || false
    );
    // Show a spinner for the first 2 s while the video buffers
    const [isBuffering, setIsBuffering] = useState(true);

    // Video should play only when the card is visible AND the screen is active
    const shouldPlay = isActive && isScreenFocused;

    const videoUrl = fixVideoUrl(item.url);

    const player = useVideoPlayer(videoUrl, (p) => {
      p.loop = true;
      p.muted = false;
    });

    // Track the previous focus state to detect tab-switch returns
    const wasFocusedRef = useRef(isScreenFocused);

    // Hide buffering spinner after a short delay
    useEffect(() => {
      const timer = setTimeout(() => setIsBuffering(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    // Play / pause and optionally restart from the beginning on tab return
    useEffect(() => {
      if (shouldPlay) {
        // Returning to this tab after navigating away → restart from beginning
        if (!wasFocusedRef.current && isScreenFocused) {
          player.currentTime = 0;
        }
        player.play();
      } else {
        player.pause();
      }
      wasFocusedRef.current = isScreenFocused;
    }, [shouldPlay, player, isScreenFocused]);

    // TODO: wire to a real like API call
    const handleLike = () => setIsLiked((prev: boolean) => !prev);
    // TODO: wire to a real save API call
    const handleSave = () => setIsSaved((prev: boolean) => !prev);

    return (
      <View style={styles.reelContainer}>
        {/* Fullscreen video — sits behind everything */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />

        {/* Spinner shown while the video is still buffering */}
        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Creator info + action bar + title / language tag */}
        <ReelOverlay
          item={item}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLike}
          onSave={handleSave}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
