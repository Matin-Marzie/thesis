import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, BackHandler, Dimensions } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { withSpring } from 'react-native-reanimated';
import { CommentRow } from './CommentRow';
import { Footer } from './Footer';
import type { Comment, CommentBottomSheetModalProps } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data — replace with real API call when ready
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

// Snap points: the sheet opens at 60 % and can be expanded to 96 %.
const snapPoints = ['60%', '96%'];
const snapPointsRatio = [0.57];

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
      sheetHeight.value = withSpring(SCREEN_HEIGHT * snapPointsRatio[0], { damping: 20 });
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
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        sheetHeight.value = withSpring(0, { damping: 20 });
        onClose();
      } else if (index >= 0 && index < snapPointsRatio.length) {
        sheetHeight.value = withSpring(SCREEN_HEIGHT * snapPointsRatio[index], { damping: 20 });
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
        <Footer onSend={handleSend} />
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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onChange={handleSheetChange}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >

      {/* Scrollable comment list */}
      <BottomSheetFlatList
        data={MOCK_COMMENTS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#1c1c1e',
  },
  handle: {
    backgroundColor: '#444',
    width: 36,
    marginVertical: 8,
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
  listContent: {
    paddingBottom: 80,
  },
});
