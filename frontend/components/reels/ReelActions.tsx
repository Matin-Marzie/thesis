import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

interface ReelActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasDialogue: boolean;
  // Animated style passed down from ReelItem so the spring animation stays outside this component
  animatedLikeStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  onLike: () => void;
  onComment: () => void;
  onDialogue: () => void;
  onShare: () => void;
  onMoreOptions: () => void;
}

// Compact number formatter: 1200 → "1.2K", 1500000 → "1.5M"
const formatCount = (count: number): string => {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
  return count?.toString() || '0';
};

// Right-side vertical action bar (like, comment, share, dialogue, more)
export const ReelActions = React.memo(
  ({
    isLiked,
    likesCount,
    commentsCount,
    sharesCount,
    hasDialogue,
    animatedLikeStyle,
    onLike,
    onComment,
    onDialogue,
    onShare,
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
      <TouchableOpacity style={[styles.actionButton, { paddingHorizontal: 7 }]} onPress={onShare}>
        <FontAwesome name="paper-plane-o" size={26} color="#fff" />
        <Text style={styles.actionText}>{formatCount(sharesCount)}</Text>
      </TouchableOpacity>

      {/* Dialogue */}
      <TouchableOpacity
        style={[styles.actionButton, !hasDialogue && styles.actionButtonDisabled]}
        onPress={hasDialogue ? onDialogue : undefined}
        disabled={!hasDialogue}
      >
        <MaterialIcons name="subtitles" size={28} color={hasDialogue ? '#fff' : 'rgba(255,255,255,0.35)'} />
      </TouchableOpacity>


      {/* More options (ellipsis) */}
      <TouchableOpacity style={[styles.actionButton, { paddingHorizontal: 9 }]} onPress={onMoreOptions}>
        <FontAwesome name="ellipsis-h" size={28} color="#fff" />
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
    padding: 6,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
