import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useReelsContext } from '@/context/ReelsContext';
import { PRIMARY_COLOR } from '@/constants/App';
import { ReelItem } from './ReelItem';
import { ReelActionsBottomSheetModal } from './ReelActionsBottomSheetModal';
import { ReportReelBottomSheetModal } from './ReportReelBottomSheetModal';
import TouchableOpacity from '@/components/TouchableOpacity';
import { reportReel as reportReelRequest } from '@/api/reelCreation';
import type { Reel } from '@/types/dialogue';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReelsListProps {
  // Called by the parent screen to render the loading / error states before this list mounts
  onRetry: () => void;
}

// Paged, full-screen vertical FlatList of reels.
// Handles viewability tracking, infinite scroll, and tab-focus awareness.
export function ReelsList({ onRetry }: ReelsListProps) {
  const isFocused = useIsFocused();
  const { reels, isFetchingMore, hasMore, fetchReels } = useReelsContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Only the item that covers ≥ 50 % of the viewport is considered "active"
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]).current;

  const [optionsReel, setOptionsReel] = useState<Reel | null>(null);
  // Overrides the reel's own user_interaction.is_saved once the user toggles
  // it locally, so a reel that started pre-saved can be un-saved too.
  const [savedOverrides, setSavedOverrides] = useState<Map<string, boolean>>(new Map());
  const reelActionsSheetRef = useRef<BottomSheetModal>(null);

  const [reportReelTarget, setReportReelTarget] = useState<Reel | null>(null);
  const reportReelSheetRef = useRef<BottomSheetModal>(null);

  const handleMoreOptions = useCallback((reel: Reel) => {
    setOptionsReel(reel);
    reelActionsSheetRef.current?.present();
  }, []);

  const handleToggleSave = useCallback((reel: Reel) => {
    // TODO: persist the save/unsave to the backend once the endpoint exists.
    setSavedOverrides((prev) => {
      const key = reel.id.toString();
      const current = prev.has(key) ? prev.get(key)! : !!reel.user_interaction?.is_saved;
      const next = new Map(prev);
      next.set(key, !current);
      return next;
    });
  }, []);

  // Opens the report-reasons sheet right after ReelActionsBottomSheetModal
  // dismisses itself (both are independent BottomSheetModal instances under
  // the same app-level BottomSheetModalProvider, so presenting one while the
  // other finishes its dismiss animation is safe).
  const handleReport = useCallback((reel: Reel) => {
    setReportReelTarget(reel);
    reportReelSheetRef.current?.present();
  }, []);

  const handleSelectReportReason = useCallback(async (reel: Reel, reason: string) => {
    try {
      await reportReelRequest(reel.id, reason);
      Alert.alert('Reel reported', 'Thanks for letting us know. Our team will review it.');
    } catch (error: any) {
      Alert.alert('Report failed', error?.message || 'Could not report this reel. Please try again.');
    }
  }, []);

  const isOptionsReelSaved = !!optionsReel && (
    savedOverrides.has(optionsReel.id.toString())
      ? savedOverrides.get(optionsReel.id.toString())!
      : !!optionsReel.user_interaction?.is_saved
  );

  // Fetch the next page when the user approaches the end of the list
  const handleEndReached = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      fetchReels(false);
    }
  }, [fetchReels, isFetchingMore, hasMore]);

  // Memoised render keeps ReelItem from re-rendering unless activeIndex or focus changes
  const renderItem = useCallback(
    ({ item, index }: any) => (
      <ReelItem
        item={item}
        isActive={index === activeIndex}
        isScreenFocused={isFocused}
        onMoreOptions={handleMoreOptions}
      />
    ),
    [activeIndex, isFocused, handleMoreOptions]
  );

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  // Pre-computed layout allows FlatList to skip measurement and scroll precisely
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  // Spinner shown at the bottom while the next page is loading
  const ListFooterComponent = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }, [isFetchingMore]);

  // Shown when the list is empty and not in a loading / error state
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <FontAwesome name="film" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No reels available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    ),
    [onRetry]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // Full-screen snapping
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        disableIntervalMomentum
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        getItemLayout={getItemLayout}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        // Infinite scroll
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        // Render budget — keep low to reduce memory pressure
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        bounces={false}
        overScrollMode="never"
      />

      <ReelActionsBottomSheetModal
        ref={reelActionsSheetRef}
        reel={optionsReel}
        isSaved={isOptionsReelSaved}
        onToggleSave={handleToggleSave}
        onReport={handleReport}
      />

      <ReportReelBottomSheetModal
        ref={reportReelSheetRef}
        reel={reportReelTarget}
        onSelectReason={handleSelectReportReason}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  footerLoader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Takes the full screen height so the empty state is vertically centred
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
});
