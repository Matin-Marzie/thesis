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
import { useIsFocused } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useReelsContext } from '@/context/ReelsContext';
import { useAuth } from '@/context/AuthContext';
import { PRIMARY_COLOR } from '@/constants/App';
import { ReelItem } from './ReelItem';
import { ReelActionsBottomSheetModal } from './ReelActionsBottomSheetModal';
import { ReportReelBottomSheetModal } from './ReportReelBottomSheetModal';
import TouchableOpacity from '@/components/TouchableOpacity';
import { reportReel as reportReelRequest, toggleSaveReel } from '@/api/reelCreation';
import type { Reel } from '@/types/dialogue';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Minimum time between two onEndReached-triggered fetch attempts - long
// enough to absorb FlatList re-firing onEndReached several times in a row
// for the same swipe (layout recalculation, no new content added), short
// enough that a genuine later swipe-up-at-the-end isn't left waiting.
const END_REACHED_RETRY_COOLDOWN_MS = 3000;

interface ReelsListProps {
  // Called by the parent screen to render the loading / error states before this list mounts
  onRetry: () => void;
}

// Paged, full-screen vertical FlatList of reels.
// Handles viewability tracking, infinite scroll, and tab-focus awareness.
export function ReelsList({ onRetry }: ReelsListProps) {
  const isFocused = useIsFocused();
  const { isAuthenticated } = useAuth();
  const { reels, isLoading, isFetchingMore, fetchReels } = useReelsContext();
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

  // Optimistically flips the bookmark instantly, then persists to the
  // backend. On failure, rolls back to exactly the pre-tap state. Guests
  // get the local-only toggle with no persistence, same as the like button.
  const handleToggleSave = useCallback((reel: Reel) => {
    const key = reel.id.toString();
    const prevSaved = savedOverrides.has(key) ? savedOverrides.get(key)! : !!reel.user_interaction?.is_saved;
    const nextSaved = !prevSaved;

    setSavedOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, nextSaved);
      return next;
    });

    if (!isAuthenticated) return;

    toggleSaveReel(reel.id)
      .then(({ is_saved }) => {
        setSavedOverrides((prev) => {
          const next = new Map(prev);
          next.set(key, is_saved);
          return next;
        });
      })
      .catch(() => {
        setSavedOverrides((prev) => {
          const next = new Map(prev);
          next.set(key, prevSaved);
          return next;
        });
      });
  }, [savedOverrides, isAuthenticated]);

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

  // Fetch the next page when the user approaches the end of the list.
  // Debounced by time (not by a persistent `error` flag) so a failed
  // attempt - e.g. the recommendation engine genuinely has nothing new
  // left within the cooldown window - doesn't permanently block every
  // later swipe-up-at-the-end from trying again; it only suppresses
  // FlatList re-firing this repeatedly on its own within the same swipe
  // (layout recalculation, no new content added).
  const lastEndReachedAttemptRef = useRef(0);
  const handleEndReached = useCallback(() => {
    if (isFetchingMore) return;
    const now = Date.now();
    if (now - lastEndReachedAttemptRef.current < END_REACHED_RETRY_COOLDOWN_MS) return;
    lastEndReachedAttemptRef.current = now;
    fetchReels(false);
  }, [fetchReels, isFetchingMore]);

  // Pull-to-refresh (top of the list)
  const handleRefresh = useCallback(() => {
    fetchReels(true);
  }, [fetchReels]);

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
        ListEmptyComponent={ListEmptyComponent}
        // Pull-to-refresh (top of the list). Requires bounces/overscroll
        // enabled, so this stays even though bounces={false} would
        // otherwise be the natural fit for a paged feed.
        refreshing={isLoading}
        onRefresh={handleRefresh}
        // Render budget — keep low to reduce memory pressure
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      {/* Overlay, not a ListFooterComponent - a footer adds real height to
          the scrollable content, which breaks pagingEnabled's
          snapToInterval={SCREEN_HEIGHT} grid (the list settles into a
          partial extra "page" while this is visible, leaving a gap below
          the last reel). */}
      {isFetchingMore && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      )}

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
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
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
