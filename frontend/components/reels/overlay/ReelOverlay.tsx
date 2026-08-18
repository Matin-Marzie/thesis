import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Share, StyleProp, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { fixMediaUrl } from '@/utils/fixMediaUrl';
import { ReelActions } from './RightSideActionBar';

interface ReelOverlayProps {
  item: any;
  isLiked: boolean;
  likesCount: number;
  hasDialogue: boolean;
  animatedLikeStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  onLike: () => void;
  onComment: () => void;
  onDialogue: () => void;
  onMoreOptions?: (item: any) => void;
}

// Translucent overlay rendered on top of the video.
// Splits into three zones: creator info (top), action bar (right), title + tag (bottom).
export const ReelOverlay = React.memo(
  ({ item, isLiked, likesCount, hasDialogue, animatedLikeStyle, onLike, onComment, onDialogue, onMoreOptions }: ReelOverlayProps) => {
    const router = useRouter();

    const handleAvatarPress = useCallback(() => {
      if (!item.created_by?.id) return;
      router.push(`/creator/${item.created_by.id}`);
    }, [item, router]);

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
      if (onMoreOptions) {
        onMoreOptions(item);
        return;
      }
      console.log('More options pressed for reel:', item.id);
    }, [item, onMoreOptions]);

    return (
      <Animated.View style={styles.overlay} pointerEvents="box-none">
        {/* Right: vertical action bar */}
        <ReelActions
          isLiked={isLiked}
          likesCount={likesCount}
          commentsCount={item.stats?.comments || 0}
          sharesCount={item.stats?.shares || 0}
          creatorProfilePicture={fixMediaUrl(item.created_by?.profile_picture)}
          onAvatarPress={handleAvatarPress}
          animatedLikeStyle={animatedLikeStyle}
          onLike={onLike}
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
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
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
