import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

interface ReelActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  // Animated style passed down from ReelItem so the spring animation stays outside this component
  animatedLikeStyle: AnimatedStyle;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onMoreOptions: () => void;
}

// Compact number formatter: 1200 → "1.2K", 1500000 → "1.5M"
const formatCount = (count: number): string => {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
  return count?.toString() || '0';
};

// Right-side vertical action bar (like, comment, share, save, more)
export const ReelActions = React.memo(
  ({
    isLiked,
    isSaved,
    likesCount,
    commentsCount,
    savesCount,
    animatedLikeStyle,
    onLike,
    onComment,
    onShare,
    onSave,
    onMoreOptions,
  }: ReelActionsProps) => (
    <View style={styles.actionsContainer}>
      {/* Like */}
      <TouchableOpacity style={styles.actionButton} onPress={onLike}>
        <Animated.View style={animatedLikeStyle}>
          <FontAwesome
            name={isLiked ? 'heart' : 'heart-o'}
            size={28}
            color={isLiked ? '#ff2d55' : '#fff'}
          />
        </Animated.View>
        <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
      </TouchableOpacity>

      {/* Comment */}
      <TouchableOpacity style={styles.actionButton} onPress={onComment}>
        <FontAwesome name="comment-o" size={28} color="#fff" />
        <Text style={styles.actionText}>{formatCount(commentsCount)}</Text>
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.actionButton} onPress={onShare}>
        <FontAwesome name="share" size={28} color="#fff" />
        <Text style={styles.actionText}>Share</Text>
      </TouchableOpacity>

      {/* Save / Bookmark */}
      <TouchableOpacity style={styles.actionButton} onPress={onSave}>
        <FontAwesome
          name={isSaved ? 'bookmark' : 'bookmark-o'}
          size={28}
          color={isSaved ? '#ffd700' : '#fff'}
        />
        <Text style={styles.actionText}>{formatCount(savesCount)}</Text>
      </TouchableOpacity>

      {/* More options (ellipsis) */}
      <TouchableOpacity style={styles.actionButton} onPress={onMoreOptions}>
        <FontAwesome name="ellipsis-v" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  )
);

const styles = StyleSheet.create({
  // Pinned to the right side of the screen, above the tab bar
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
});
