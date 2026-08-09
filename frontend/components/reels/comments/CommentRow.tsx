import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TouchableOpacity from '@/components/TouchableOpacity';
import type { Comment } from './types';

export function CommentRow({ item }: { item: Comment }) {
  const [liked, setLiked] = useState(item.isLiked);
  const [likes, setLikes] = useState(item.likes);

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    setLikes((prev) => prev + (liked ? -1 : 1));
  }, [liked]);

  return (
    <View style={styles.commentRow}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />

      <View style={styles.commentBody}>
        {/* Username + text */}
        <View style={styles.commentTextWrap}>
          <Text style={styles.commentUsername}>{item.username} </Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>

        {/* Time + reply */}
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{item.timeAgo}</Text>
          <TouchableOpacity>
            <Text style={styles.commentReply}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Like button on the right */}
      <TouchableOpacity style={styles.commentLikeBtn} onPress={handleLike}>
        <FontAwesome
          name={liked ? 'heart' : 'heart-o'}
          size={14}
          color={liked ? '#ff2d55' : '#888'}
        />
        <Text style={[styles.commentLikeCount, liked && styles.commentLikeCountActive]}>
          {likes > 0 ? likes : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentTextWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUsername: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  commentText: {
    color: '#ddd',
    fontSize: 13,
    lineHeight: 18,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
  },
  commentReply: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  commentLikeBtn: {
    alignItems: 'center',
    paddingLeft: 12,
    gap: 2,
  },
  commentLikeCount: {
    color: '#888',
    fontSize: 11,
  },
  commentLikeCountActive: {
    color: '#ff2d55',
  },
});
