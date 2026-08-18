import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ReelItem } from '@/components/reels/ReelItem';
import { ReelActionsBottomSheetModal } from '@/components/reels/ReelActionsBottomSheetModal';
import { ReportReelBottomSheetModal } from '@/components/reels/ReportReelBottomSheetModal';
import TouchableOpacity from '@/components/TouchableOpacity';
import { PRIMARY_COLOR } from '@/constants/App';
import { getUserReels } from '@/api/user';
import { reportReel as reportReelRequest, toggleSaveReel } from '@/api/reelCreation';
import type { Reel } from '@/types/dialogue';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Full-screen, swipeable pager over ANOTHER user's reels - opened by tapping
// a thumbnail in that creator's public profile grid (app/creator/[id].tsx).
// Structurally mirrors app/profileReel/[id].tsx (own reels), but:
//  - sources reels from getUserReels(id) into local state, not the
//    current-device-only useUserReels() context
//  - wires the "more options" sheet to Save/Report (ReelActionsBottomSheetModal,
//    same as the main feed's ReelsList.tsx), not the owner-only Edit/Delete
//    sheet profileReel/[id].tsx uses - the viewer doesn't own these reels
export default function CreatorReelScreen() {
  const { id, reelId, creatorUsername, creatorProfilePicture } = useLocalSearchParams<{
    id: string;
    reelId: string;
    creatorUsername?: string;
    creatorProfilePicture?: string;
  }>();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getUserReels(id);
        if (cancelled) return;
        const creator = {
          id: Number(id),
          username: creatorUsername || '',
          profile_picture: creatorProfilePicture || undefined,
        };
        const fetched = (res?.data?.reels ?? []).map((reel: any) => ({
          ...reel,
          created_by: creator,
        }));
        setReels(fetched);
      } catch {
        // Swallow - an empty list just renders nothing to swipe through,
        // and the back button remains available.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, creatorUsername, creatorProfilePicture]);

  const initialIndex = useMemo(() => {
    const index = reels.findIndex((r) => r.id.toString() === reelId);
    return index >= 0 ? index : 0;
  }, [reels, reelId]);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

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
  const [savedOverrides, setSavedOverrides] = useState<Map<string, boolean>>(new Map());
  const reelActionsSheetRef = useRef<BottomSheetModal>(null);

  const [reportReelTarget, setReportReelTarget] = useState<Reel | null>(null);
  const reportReelSheetRef = useRef<BottomSheetModal>(null);

  const handleMoreOptions = useCallback((reel: Reel) => {
    setOptionsReel(reel);
    reelActionsSheetRef.current?.present();
  }, []);

  // Same optimistic-toggle-then-reconcile pattern as ReelsList.handleToggleSave.
  const handleToggleSave = useCallback((reel: Reel) => {
    const key = reel.id.toString();
    const prevSaved = savedOverrides.has(key) ? savedOverrides.get(key)! : !!reel.user_interaction?.is_saved;
    const nextSaved = !prevSaved;

    setSavedOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, nextSaved);
      return next;
    });

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
  }, [savedOverrides]);

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

  const keyExtractor = useCallback((item: Reel) => item.id.toString(), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={reels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialScrollIndex={initialIndex}
          pagingEnabled
          horizontal={false}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          disableIntervalMomentum
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          getItemLayout={getItemLayout}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
          bounces={false}
          overScrollMode="never"
        />
      )}

      <SafeAreaView style={styles.backButtonSafeArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    marginTop: Platform.OS === 'android' ? 10 : 0,
    marginLeft: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
