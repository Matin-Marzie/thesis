import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useReelsContext } from '@/context/ReelsContext';
import { PRIMARY_COLOR } from '@/constants/App';
import { API_BASE_URL } from '@/config/api.config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper to fix localhost URLs for physical device access
const fixVideoUrl = (url) => {
  if (!url) return url;
  // Extract host from API_BASE_URL (e.g., "10.92.60.147" from "http://10.92.60.147:3500/api/v1")
  const apiHost = API_BASE_URL.match(/https?:\/\/([^:/]+)/)?.[1];
  if (apiHost && url.includes('localhost')) {
    return url.replace('localhost', apiHost);
  }
  return url;
};

// Individual Reel Item Component
const ReelItem = React.memo(({ item, isActive, isScreenFocused }) => {
  const [isLiked, setIsLiked] = useState(item.user_interaction?.is_liked || false);
  const [isSaved, setIsSaved] = useState(item.user_interaction?.is_saved || false);
  const [isBuffering, setIsBuffering] = useState(true);
  const likeScale = useSharedValue(1);

  // Only play if both active (visible in list) AND screen is focused
  const shouldPlay = isActive && isScreenFocused;

  // Fix localhost URL for physical device
  const videoUrl = fixVideoUrl(item.url);

  // Video player setup
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Track previous screen focus state to detect tab changes
  const wasFocusedRef = useRef(isScreenFocused);

  // Hide buffering spinner after a short delay (simple approach)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBuffering(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Play/pause based on visibility and screen focus
  // Reset to beginning when returning to tab
  useEffect(() => {
    if (shouldPlay) {
      // If returning to this tab (was not focused, now focused), restart from beginning
      if (!wasFocusedRef.current && isScreenFocused) {
        player.currentTime = 0;
      }
      player.play();
    } else {
      player.pause();
    }
    wasFocusedRef.current = isScreenFocused;
  }, [shouldPlay, player, isScreenFocused]);

  // Animated like button
  const animatedLikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleLike = useCallback(() => {
    likeScale.value = withSpring(1.3, { damping: 2 }, () => {
      likeScale.value = withSpring(1);
    });
    setIsLiked((prev) => !prev);
    // TODO: Implement actual like API call
  }, [likeScale]);

  const handleComment = useCallback(() => {
    // TODO: Implement comment functionality
    console.log('Comment pressed for reel:', item.id);
  }, [item.id]);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share pressed for reel:', item.id);
  }, [item.id]);

  const handleSave = useCallback(() => {
    setIsSaved((prev) => !prev);
    // TODO: Implement save API call
    console.log('Save pressed for reel:', item.id);
  }, [item.id]);

  const handleMoreOptions = useCallback(() => {
    // TODO: Implement more options menu
    console.log('More options pressed for reel:', item.id);
  }, [item.id]);

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count?.toString() || '0';
  };

  return (
    <View style={styles.reelContainer}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Buffering Spinner Overlay */}
      {isBuffering && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Top Section - Creator Info */}
        <View style={styles.topSection}>
          <View style={styles.creatorInfo}>
            <Image
              source={{
                uri: item.created_by?.profile_picture || 'https://via.placeholder.com/40',
              }}
              style={styles.profilePicture}
            />
            <Text style={styles.username}>
              {item.created_by?.username || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Right Side Actions */}
        <View style={styles.actionsContainer}>
          {/* Like Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={animatedLikeStyle}>
              <FontAwesome
                name={isLiked ? 'heart' : 'heart-o'}
                size={28}
                color={isLiked ? '#ff2d55' : '#fff'}
              />
            </Animated.View>
            <Text style={styles.actionText}>
              {formatCount(item.stats?.likes || 0)}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <FontAwesome name="comment-o" size={28} color="#fff" />
            <Text style={styles.actionText}>
              {formatCount(item.stats?.comments || 0)}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <FontAwesome name="share" size={28} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <FontAwesome
              name={isSaved ? 'bookmark' : 'bookmark-o'}
              size={28}
              color={isSaved ? '#ffd700' : '#fff'}
            />
            <Text style={styles.actionText}>
              {formatCount(item.stats?.saves || 0)}
            </Text>
          </TouchableOpacity>

          {/* More Options Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleMoreOptions}>
            <FontAwesome name="ellipsis-v" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Section - Title */}
        <View style={styles.bottomSection}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.language?.name && (
            <View style={styles.languageTag}>
              <Text style={styles.languageText}>{item.language.name}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

// Main Reels Screen
export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { reels, isLoading, isFetchingMore, hasMore, error, fetchReels } = useReelsContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fetch reels on mount
  useEffect(() => {
    if (reels.length === 0) {
      fetchReels(true);
    }
  }, []);

  // Handle viewability change to track active reel
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]).current;

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      fetchReels(false);
    }
  }, [fetchReels, isFetchingMore, hasMore]);

  // Render individual reel
  const renderItem = useCallback(
    ({ item, index }) => (
      <ReelItem item={item} isActive={index === activeIndex} isScreenFocused={isFocused} />
    ),
    [activeIndex, isFocused]
  );

  // Key extractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback(
    (_, index) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  // Footer component for loading indicator
  const ListFooterComponent = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }, [isFetchingMore]);

  // Empty component
  const ListEmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="film" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No reels available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchReels(true)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, fetchReels]);

  // Loading state
  if (isLoading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading reels...</Text>
      </View>
    );
  }

  // Error state
  if (error && reels.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <FontAwesome name="exclamation-triangle" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchReels(true)}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        getItemLayout={getItemLayout}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
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
  emptyContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
    marginTop: 16,
    fontSize: 18,
  },
  footerLoader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingRight: 80,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  languageTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
