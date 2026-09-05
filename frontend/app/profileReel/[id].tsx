import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Platform, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useIsFocused } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserReels } from '@/context/UserReelsContext';
import { useProgress } from '@/context/ProgressContext';
import { ReelItem } from '@/components/reels/ReelItem';
import { ReelOptionsBottomSheetModal } from '@/components/profile/ReelOptionsBottomSheetModal';
import TouchableOpacity from '@/components/TouchableOpacity';
import { deleteReel as deleteReelRequest } from '@/api/reelCreation';
import { getNativeLanguageCode, resolveReelTranslations } from '@/utils/resolveReelTranslations';
import type { Reel } from '@/types/dialogue';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Full-screen, swipeable pager over the profile owner's own reels.
// Opened by tapping a thumbnail in ProfileReels; starts at the tapped reel.
export default function ProfileReelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userReels, removeUserReel } = useUserReels();
  const { userProgress } = useProgress();

  // userReels carries the raw, all-languages `translations` array (same
  // shape reels-service returns from POST /reel and GET /reels) - resolve
  // each sentence's single `translation` string here, since (unlike the
  // main feed) nothing else in the userReels pipeline does this.
  const nativeLanguageCode = getNativeLanguageCode(userProgress);
  const resolvedUserReels = useMemo(
    () => userReels.map((reel: Reel) => resolveReelTranslations(reel, nativeLanguageCode)),
    [userReels, nativeLanguageCode]
  );

  const initialIndex = useMemo(() => {
    const index = resolvedUserReels.findIndex((r: Reel) => r.id.toString() === id);
    return index >= 0 ? index : 0;
  }, [resolvedUserReels, id]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef<any>(null);

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
  const reelOptionsSheetRef = useRef<BottomSheetModal>(null);

  const handleMoreOptions = useCallback((reel: Reel) => {
    setOptionsReel(reel);
    reelOptionsSheetRef.current?.present();
  }, []);

  const handleEditTitle = useCallback((reel: Reel) => {
    // TODO: open the edit-title flow once its design is specified.
    console.log('Edit title for reel', reel.id);
  }, []);

  const handleDeleteReel = useCallback((reel: Reel) => {
    Alert.alert(
      'Delete reel?',
      'This will permanently remove the reel from your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReelRequest(reel.id);
              removeUserReel(reel.id);
              router.back();
            } catch (error: any) {
              Alert.alert('Delete failed', error?.message || 'Could not delete the reel. Please try again.');
            }
          },
        },
      ]
    );
  }, [removeUserReel, router]);

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
      <FlatList
        ref={flatListRef}
        data={resolvedUserReels}
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

      <SafeAreaView style={styles.backButtonSafeArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      <ReelOptionsBottomSheetModal
        ref={reelOptionsSheetRef}
        reel={optionsReel}
        onEditTitle={handleEditTitle}
        onDelete={handleDeleteReel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
