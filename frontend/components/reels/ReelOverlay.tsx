import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Platform, Share } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { ReelActions } from './ReelActions';

interface ReelOverlayProps {
  item: any;
  isLiked: boolean;
  hasDialogue: boolean;
  onLike: () => void;
  onComment: () => void;
  onDialogue: () => void;
}

// Translucent overlay rendered on top of the video.
// Splits into three zones: creator info (top), action bar (right), title + tag (bottom).
export const ReelOverlay = React.memo(
  ({ item, isLiked, hasDialogue, onLike, onComment, onDialogue }: ReelOverlayProps) => {
    // Spring animation for the like button
    const likeScale = useSharedValue(1);
    const animatedLikeStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const handleLike = useCallback(() => {
      likeScale.value = withSpring(1.3, { damping: 2 }, () => {
        likeScale.value = withSpring(1);
      });
      onLike();
    }, [likeScale, onLike]);

    const handleShare = useCallback(async () => {
      try {
        const username = item.created_by?.username || 'Unknown';
        await Share.share({
          message: `${username}:\n${item.url}`,
        });
      } catch (e) {
        // user cancelled or share not supported
      }
    }, [item]);

    const handleMoreOptions = useCallback(() => {
      console.log('More options pressed for reel:', item.id);
    }, [item.id]);

    return (
      <Animated.View style={styles.overlay} pointerEvents="box-none">
        {/* Top: creator avatar + username */}
        <View style={styles.topSection}>
          <View style={styles.creatorInfo}>
            <Image
              source={{
                uri:
                  item.created_by?.profile_picture ||
                  'https://via.placeholder.com/40',
              }}
              style={styles.profilePicture}
            />
            <Text style={styles.username}>
              {item.created_by?.username || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Right: vertical action bar */}
        <ReelActions
          isLiked={isLiked}
          likesCount={item.stats?.likes || 0}
          commentsCount={item.stats?.comments || 0}
          sharesCount={item.stats?.shares || 0}
          animatedLikeStyle={animatedLikeStyle}
          onLike={handleLike}
          onComment={onComment}
          hasDialogue={hasDialogue}
          onDialogue={onDialogue}
          onShare={handleShare}
          onMoreOptions={handleMoreOptions}
        />
        
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
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
