import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import type { SharedValue } from 'react-native-reanimated';
import { withSpring } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface CommentBottomSheetModalProps {
  reelId: number;
  visible: boolean;
  onClose: () => void;
  // Drives the phantom spacer in ReelItem that pushes the video upward via flex
  sheetHeight: SharedValue<number>;
}

// ---------------------------------------------------------------------------
// Mock data — replace with real API call when ready
// ---------------------------------------------------------------------------

const MOCK_COMMENTS: Comment[] = [
  { id: '1', username: 'alex.codes', avatar: 'https://i.pravatar.cc/150?img=1', text: 'This is so clean 🔥🔥', timeAgo: '2m', likes: 48, isLiked: false },
  { id: '2', username: 'sara_dev', avatar: 'https://i.pravatar.cc/150?img=5', text: 'I learned so much from this, thanks!', timeAgo: '5m', likes: 102, isLiked: true },
  { id: '3', username: 'mike.builds', avatar: 'https://i.pravatar.cc/150?img=3', text: 'What language is this in?', timeAgo: '8m', likes: 7, isLiked: false },
  { id: '4', username: 'codewithjane', avatar: 'https://i.pravatar.cc/150?img=9', text: 'Saving this for later 📌', timeAgo: '12m', likes: 34, isLiked: false },
  { id: '5', username: 'turbo_dev', avatar: 'https://i.pravatar.cc/150?img=12', text: 'The animation at 0:08 is wild', timeAgo: '15m', likes: 19, isLiked: true },
  { id: '6', username: 'dev.bro99', avatar: 'https://i.pravatar.cc/150?img=15', text: 'Finally someone explains this properly', timeAgo: '22m', likes: 61, isLiked: false },
  { id: '7', username: 'reactnative.fan', avatar: 'https://i.pravatar.cc/150?img=20', text: 'Which library is used here?', timeAgo: '30m', likes: 3, isLiked: false },
  { id: '8', username: 'maria_ux', avatar: 'https://i.pravatar.cc/150?img=25', text: 'Smooth like butter 🧈', timeAgo: '45m', likes: 88, isLiked: false },
  { id: '9', username: 'leet_hacker', avatar: 'https://i.pravatar.cc/150?img=30', text: 'Could you do a longer version of this?', timeAgo: '1h', likes: 14, isLiked: false },
  { id: '10', username: 'just.a.dev', avatar: 'https://i.pravatar.cc/150?img=33', text: '❤️❤️❤️', timeAgo: '2h', likes: 256, isLiked: true },
  { id: '11', username: 'code_master', avatar: 'https://i.pravatar.cc/150?img=40', text: 'The best reel I have seen today!', timeAgo: '3h', likes: 120, isLiked: false },
  { id: '12', username: 'frontend_guru', avatar: 'https://i.pravatar.cc/150?img=45', text: 'Can you share the source code?', timeAgo: '5h', likes: 9, isLiked: false },
  { id: '13', username: 'dev_dude', avatar: 'https://i.pravatar.cc/150?img=50', text: 'This deserves more views!', timeAgo: '8h', likes: 77, isLiked: false },
  { id: '14', username: 'sophia.codes', avatar: 'https://i.pravatar.cc/150?img=55', text: 'I can watch this on loop all day', timeAgo: '12h', likes: 150, isLiked: true },
  { id: '15', username: 'the_coder', avatar: 'https://i.pravatar.cc/150?img=60', text: 'Incredible work, keep it up!', timeAgo: '1d', likes: 200, isLiked: false },
  { id: '16', username: 'dev_gal', avatar: 'https://i.pravatar.cc/150?img=65', text: 'This is next-level stuff 😍', timeAgo: '2d', likes: 180, isLiked: false },

];
// ---------------------------------------------------------------------------
// CommentRow
// ---------------------------------------------------------------------------

function CommentRow({ item }: { item: Comment }) {
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

// ---------------------------------------------------------------------------
// CommentInputBar — owns its own text state so renderFooter stays stable
// ---------------------------------------------------------------------------

interface CommentInputBarProps {
  onSend: (text: string) => void;
}

const CommentInputBar = React.memo(function CommentInputBar({ onSend }: CommentInputBarProps) {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }, [text, onSend]);

  return (
    <View style={[styles.inputBar, Platform.OS === 'ios' && styles.inputBarIos]}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/150?img=50' }}
        style={styles.inputAvatar}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a comment…"
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={300}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim()}
        style={styles.sendButton}
      >
        <Text style={[styles.sendText, text.trim() ? styles.sendTextActive : null]}>
          Post
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// ---------------------------------------------------------------------------
// CommentBottomSheetModal
// ---------------------------------------------------------------------------

// Snap points: the sheet opens at 50 % and can be expanded to full screen.
const SNAP_POINTS = ['60%', '96%'];

export function CommentBottomSheetModal({
  reelId,
  visible,
  onClose,
  sheetHeight,
}: CommentBottomSheetModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  // BottomSheetModal is always mounted but shown/hidden imperatively via present/dismiss.
  // This lets it render through the BottomSheetModalProvider portal (above the FlatList).
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      sheetHeight.value = withSpring(SCREEN_HEIGHT * 0.5, { damping: 20 });
    } else {
      sheetRef.current?.dismiss();
      sheetHeight.value = withSpring(0, { damping: 20 });
    }
  }, [visible, sheetHeight]);

  // Close sheet on Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  // Dim backdrop — tapping it closes the sheet
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  // Animate the spacer height in ReelItem so the video is pushed upward via flex.
  // index 0 = 50% snap, index 1 = 100% snap, index -1 = dismissed
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === 0) {
        sheetHeight.value = withSpring(SCREEN_HEIGHT * 0.5, { damping: 20 });
      } else if (index === 1) {
        sheetHeight.value = withSpring(SCREEN_HEIGHT, { damping: 20 });
      } else if (index === -1) {
        sheetHeight.value = withSpring(0, { damping: 20 });
        onClose();
      }
    },
    [onClose, sheetHeight],
  );

  const handleSend = useCallback((text: string) => {
    // TODO: POST comment to backend
    console.log('Send comment for reel', reelId, ':', text);
  }, [reelId]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <CommentInputBar onSend={handleSend} />
      </BottomSheetFooter>
    ),
    [handleSend],
  );

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => <CommentRow item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  // Header rendered above the comment list
  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>
          {MOCK_COMMENTS.length} comments
        </Text>
      </View>
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      enableContentPanningGesture={true}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onChange={handleSheetChange}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >

      {/* Scrollable comment list */}
      <BottomSheetView style={styles.commentList}>
        <BottomSheetFlatList
          data={MOCK_COMMENTS}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheetView>

    </BottomSheetModal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#1c1c1e',
  },
  handle: {
    backgroundColor: '#444',
    width: 36,
  },
  // List sub-header ("N comments")
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listHeaderTitle: {
    color: '#888',
    fontSize: 13,
  },
  commentList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },

  // Comment row
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

  // Input bar pinned at the bottom of the sheet
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    backgroundColor: '#1c1c1e',
  },
  // Extra bottom padding on iOS so the bar clears the home indicator
  inputBarIos: {
    paddingBottom: 24,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 14,
  },
  sendTextActive: {
    color: '#3b82f6',
  },
});
