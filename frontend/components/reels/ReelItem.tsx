import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { getMediaUrl } from '@/utils/mediaUrl';
import { ReelOverlay } from './overlay/ReelOverlay';
import { CommentBottomSheetModal } from './comments/CommentBottomSheetModal';
import { DialogueBottomSheetModal } from './subtitles/SubtitleBottomSheetModal';
import { WordMeaningPopup } from './subtitles/WordMeaningPopup';
import { toggleLikeReel } from '@/api/reelCreation';
import { useAuth } from '@/context/AuthContext';
import type { Reel, Word } from '../../types/dialogue';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  isScreenFocused: boolean;
  onMoreOptions?: (item: Reel) => void;
}

export const ReelItem = React.memo(
  ({ item, isActive, isScreenFocused, onMoreOptions }: ReelItemProps) => {
    const { isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(item.user_interaction?.is_liked || false);
    const [likesCount, setLikesCount] = useState(item.stats?.likes || 0);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [popupWord, setPopupWord] = useState<Word | null>(null);
    const pauseIconOpacity = useSharedValue(0);
    const animatedPauseIconStyle = useAnimatedStyle(() => ({
      opacity: pauseIconOpacity.value,
    }));

    // Like-button bounce — shared by both the sidebar heart button and double-tap
    const likeScale = useSharedValue(1);
    const animatedLikeStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));
    const triggerLikeBounce = useCallback(() => {
      likeScale.value = withSpring(1.3, { damping: 2 }, () => {
        likeScale.value = withSpring(1);
      });
    }, [likeScale]);

    // Height of the phantom spacer at the bottom of the flex container.
    // Growing this value pushes videoContainer (flex: 1) upward naturally.
    const sheetHeight = useSharedValue(0);
    const animatedSpacerStyle = useAnimatedStyle(() => ({
      height: sheetHeight.value,
    }));

    const shouldPlay = isActive && isScreenFocused && !isPaused;
    const videoUrl = getMediaUrl(item.url) as string;

    const player = useVideoPlayer(videoUrl, (p) => {
      p.loop = true;
      p.muted = false;
    });

    const wasFocusedRef = useRef(isScreenFocused);

    useEffect(() => {
      if (shouldPlay) {
        if (!wasFocusedRef.current && isScreenFocused) {
          player.currentTime = 0;
        }
        player.play();
      } else {
        player.pause();
      }
      wasFocusedRef.current = isScreenFocused;
    }, [shouldPlay, player, isScreenFocused]);

    useEffect(() => {
      pauseIconOpacity.value = isPaused
        ? withTiming(1, { duration: 150 })
        : withTiming(0, { duration: 300 });
    }, [isPaused, pauseIconOpacity]);

    const handleTogglePause = useCallback(() => {
      setIsPaused((prev) => !prev);
    }, []);

    // Flips like state + count instantly (optimistic, Instagram/TikTok-style),
    // then persists to the backend and reconciles with its authoritative
    // response. On failure, rolls back to exactly the pre-tap state rather
    // than re-flipping (safe even if a second tap landed in between).
    // Guests get the local-only bounce with no persistence.
    const applyLikeChange = useCallback((nextLiked: boolean) => {
      const prevLiked = isLiked;
      setIsLiked(nextLiked);
      setLikesCount((prev) => prev + (nextLiked ? 1 : -1));
      triggerLikeBounce();

      if (!isAuthenticated) return;

      toggleLikeReel(item.id)
        .then(({ is_liked, likes_count }) => {
          setIsLiked(is_liked);
          setLikesCount(likes_count);
        })
        .catch(() => {
          setIsLiked(prevLiked);
          setLikesCount((prev) => prev + (nextLiked ? -1 : 1));
        });
    }, [isLiked, isAuthenticated, item.id, triggerLikeBounce]);

    const handleLike = useCallback(() => {
      applyLikeChange(!isLiked);
    }, [applyLikeChange, isLiked]);

    // Double-tap only ever likes (never unlikes) — matches Instagram/TikTok behavior
    const handleDoubleTapLike = useCallback(() => {
      if (isLiked) {
        triggerLikeBounce();
        return;
      }
      applyLikeChange(true);
    }, [applyLikeChange, isLiked, triggerLikeBounce]);

    const singleTap = Gesture.Tap()
      .maxDuration(250)
      .onEnd(() => {
        runOnJS(handleTogglePause)();
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(250)
      .onEnd(() => {
        runOnJS(handleDoubleTapLike)();
      });

    // Single tap waits for the double tap to fail before toggling pause
    const tapGesture = Gesture.Exclusive(doubleTap, singleTap);

    const handleCommentOpen = useCallback(() => setIsCommentOpen(true), []);
    const handleCommentClose = useCallback(() => setIsCommentOpen(false), []);
    const handleDialogueOpen = useCallback(() => setIsDialogueOpen(true), []);
    const handleDialogueClose = useCallback(() => setIsDialogueOpen(false), []);
    const handleWordPress = useCallback((word: Word) => {
      setPopupWord(word);
    }, []);
    const handlePopupClose = useCallback(() => setPopupWord(null), []);
    const handleAddToVocabulary = useCallback(() => {
      if (!popupWord) return;
      console.log('Adding word to vocabulary:', popupWord.written_form);
    }, [popupWord]);

    return (
      <View style={styles.reelContainer}>
        {/* flex: 1 — expands to fill all space above the spacer */}
        <View style={styles.videoContainer} pointerEvents="none">
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        </View>

        {/* Phantom spacer — grows as the comment sheet opens, pushing the video up */}
        <Animated.View style={animatedSpacerStyle} />

        {/* Tap-to-pause / double-tap-to-like layer */}
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={styles.tapOverlay}>
            <Animated.View style={[styles.pauseIconContainer, animatedPauseIconStyle]}>
              <FontAwesome name="pause" size={30} color="rgba(255,255,255,0.85)" />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <ReelOverlay
          item={item}
          isLiked={isLiked}
          likesCount={likesCount}
          hasDialogue={!!(item.dialogue?.sentences?.length)}
          animatedLikeStyle={animatedLikeStyle}
          onComment={handleCommentOpen}
          onDialogue={handleDialogueOpen}
          onLike={handleLike}
          onMoreOptions={onMoreOptions}
        />

        <CommentBottomSheetModal
          reelId={item.id}
          visible={isCommentOpen}
          onClose={handleCommentClose}
          sheetHeight={sheetHeight}
        />

        <DialogueBottomSheetModal
          reelId={item.id}
          visible={isDialogueOpen}
          onClose={handleDialogueClose}
          reel={item}
          player={player}
          onWordPress={handleWordPress}
          sheetHeight={sheetHeight}
        />

        <WordMeaningPopup
          word={popupWord}
          isVisible={!!popupWord}
          onClose={handlePopupClose}
          onAddToVocabulary={handleAddToVocabulary}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    // Default flexDirection is 'column' — videoContainer + spacer stack vertically
  },
  videoContainer: {
    flex: 1, // takes all height not claimed by the spacer
    overflow: 'hidden',
  },
  video: {
    // Fills the container; contentFit="contain" scales the video to fit
    ...StyleSheet.absoluteFillObject,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
