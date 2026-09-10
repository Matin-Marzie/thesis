import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, BackHandler } from 'react-native';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, REVIEW_COIN_REWARD } from '@/constants/App';
import ReviewFeedbackRow from '@/components/SR/ReviewFeedbackRow';
import { CoinRewardBadge } from './CoinRewardBadge';
import { Rating } from '@/utils/fsrs';

interface ReviewBottomSheetModalProps {
  /** The Stage 2 due word this reel doubles as review for (ReelResponse.review_word). */
  word: { id: number; written_form: string } | null;
  value: Rating | null;
  onChange: (rating: Rating) => void;
  onSheetChange?: (index: number) => void;
  /** Bumped by ReelsList each time this rating actually earns coins (once
   * per reel) - see CoinRewardBadge.triggerKey. 0/undefined shows nothing. */
  coinRewardTrigger?: number;
}

// Bottom sheet gating the reels feed's spaced-repetition review: ReelsList
// opens this (see handleScrollBeginDrag) the moment the user tries to swipe
// away from a reel carrying a due word, and locks scrolling until a rating
// is picked - "watch this reel, then rate the word before you move on".
// Dismissing without rating (pan-down/backdrop/back-button) leaves
// scrolling locked, so the next swipe attempt re-opens it.
export const ReviewBottomSheetModal = forwardRef<BottomSheetModal, ReviewBottomSheetModalProps>(
  ({ word, value, onChange, onSheetChange, coinRewardTrigger = 0 }, ref) => {
    const isDark = useColorScheme() === 'dark';
    const snapPoints = useMemo(() => ['35%'], []);
    const [isOpen, setIsOpen] = useState(false);

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

    const handleSheetChanges = useCallback((index: number) => {
      setIsOpen(index >= 0);
      onSheetChange?.(index);
    }, [onSheetChange]);

    // Close on the Android hardware/gesture back button instead of
    // navigating away while the sheet is open.
    useEffect(() => {
      if (!isOpen) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
        return true;
      });
      return () => sub.remove();
    }, [isOpen, ref]);

    return (
      <BottomSheetModal
        index={0}
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
        handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
      >
        <BottomSheetView style={styles.contentContainer}>
          <SafeAreaView edges={['bottom']}>
            <CoinRewardBadge amount={REVIEW_COIN_REWARD} triggerKey={coinRewardTrigger} />
            <ReviewFeedbackRow
              word={word?.written_form}
              question="Quick check before you move on - how well did you remember this word?"
              value={value}
              onChange={onChange}
              game="reels"
              style={styles.row}
            />
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ReviewBottomSheetModal.displayName = 'ReviewBottomSheetModal';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    borderWidth: 0,
  },
});
