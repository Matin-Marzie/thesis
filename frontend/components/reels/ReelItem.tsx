import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
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
import { CommentBottomSheetModal, snapPointsRatio as commentSnapPointsRatio } from './comments/CommentBottomSheetModal';
import { DialogueBottomSheetModal, snapPointsRatio as dialogueSnapPointsRatio } from './subtitles/SubtitleBottomSheetModal';
import { WordMeaningPopup } from './subtitles/WordMeaningPopup';
import { toggleLikeReel, recordReelView } from '@/api/reelCreation';
import { fetchReelDialogue } from '@/api/reels';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { getNativeLanguageCode, resolveSentenceTranslation } from '@/utils/resolveReelTranslations';
import type { Reel, Word, Dialogue } from '../../types/dialogue';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// A reel only counts as "viewed" once it's actually played continuously
// for this long - distinguishes a real watch from a quick scroll-past.
const MIN_WATCH_MS = 2000;

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  isScreenFocused: boolean;
  onMoreOptions?: (item: Reel) => void;
  onReview?: (item: Reel) => void;
}

export const ReelItem = React.memo(
  ({ item, isActive, isScreenFocused, onMoreOptions, onReview }: ReelItemProps) => {
    const { isAuthenticated } = useAuth();
    const { userProgress } = useProgress();
    const [isLiked, setIsLiked] = useState(item.user_interaction?.is_liked || false);
    const [likesCount, setLikesCount] = useState(item.stats?.likes || 0);
    const [isPaused, setIsPaused] = useState(false);
    const commentSheetRef = useRef<BottomSheetModal>(null);
    const dialogueSheetRef = useRef<BottomSheetModal>(null);

    // Some reel lists (e.g. the Node-backed creator profile) arrive without
    // dialogue at all. Fetched lazily below, the first time the subtitle
    // button is pressed, rather than upfront for every reel in the list.
    const [dialogue, setDialogue] = useState<Dialogue | null>(item.dialogue ?? null);
    const [isDialogueLoading, setIsDialogueLoading] = useState(false);
    const dialogueRequestedRef = useRef(false);
    const [popupWord, setPopupWord] = useState<Word | null>(null);
    const [popupExpanded, setPopupExpanded] = useState<string | null>(null);
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

    // Records a view once this reel has actually played continuously for
    // MIN_WATCH_MS - not on every render/fetch, and not on a quick
    // scroll-past that clears the timer before it fires. Guarded by
    // item.id (not a plain boolean) so it still fires again if this
    // component instance ever gets reused for a different reel; guests
    // get no persistence, same as likes/saves.
    const recordedViewIdRef = useRef<number | null>(null);
    useEffect(() => {
      if (!shouldPlay || !isAuthenticated) return;
      if (recordedViewIdRef.current === item.id) return;

      const timer = setTimeout(() => {
        recordedViewIdRef.current = item.id;
        recordReelView(item.id).catch(() => {
          // Best-effort - a missed view isn't worth retrying.
        });
      }, MIN_WATCH_MS);

      return () => clearTimeout(timer);
    }, [shouldPlay, isAuthenticated, item.id]);

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
      // Must stay comfortably above doubleTap's maxDelay: Exclusive() makes
      // singleTap wait for doubleTap to resolve (up to maxDelay after
      // release) before activating, so its own window has to cover that
      // wait on top of the physical tap duration, or it times out first.
      .maxDuration(400)
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

    // Starts the video's push-up animation in the same tap that opens the
    // sheet, rather than waiting for the sheet's own onChange to fire (which
    // only happens once its opening animation is already under way) - that
    // gap was visible as the sheet appearing before the video moved.
    const handleCommentOpen = useCallback(() => {
      sheetHeight.value = withTiming(SCREEN_HEIGHT * commentSnapPointsRatio[0], { duration: 250 });
      commentSheetRef.current?.present();
    }, [sheetHeight]);
    const handleCommentClose = useCallback(() => commentSheetRef.current?.dismiss(), []);

    // Opens immediately (so the sheet's spinner is visible right away), and
    // kicks off the dialogue fetch the first time this reel turns out to
    // have none - dialogueRequestedRef makes that a one-shot per reel
    // instance, so a failed fetch doesn't retry on every subsequent press.
    const handleDialogueOpen = useCallback(() => {
      sheetHeight.value = withTiming(SCREEN_HEIGHT * dialogueSnapPointsRatio[0], { duration: 250 });
      dialogueSheetRef.current?.present();

      if (dialogue?.sentences?.length || dialogueRequestedRef.current) return;
      dialogueRequestedRef.current = true;

      const nativeLanguageCode = getNativeLanguageCode(userProgress);
      setIsDialogueLoading(true);
      fetchReelDialogue(item.id)
        .then((data: Dialogue) => {
          setDialogue({
            ...data,
            sentences: data.sentences.map((sentence) => ({
              ...sentence,
              translation: resolveSentenceTranslation(sentence, nativeLanguageCode),
            })),
          });
        })
        .catch(() => {
          // Swallow - the sheet just falls back to its empty state.
        })
        .finally(() => setIsDialogueLoading(false));
    }, [dialogue, item.id, userProgress, sheetHeight]);

    const handleDialogueClose = useCallback(() => dialogueSheetRef.current?.dismiss(), []);
    const handleWordPress = useCallback((word: Word, expanded: string | null) => {
      setPopupWord(word);
      setPopupExpanded(expanded);
    }, []);
    const handlePopupClose = useCallback(() => setPopupWord(null), []);

    // item.dialogue may be null/absent for reels fetched without dialogue
    // (see the lazy fetch above) - merge in whatever's been loaded since.
    const reelForDialogueSheet = useMemo(() => ({ ...item, dialogue }), [item, dialogue]);

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
          animatedLikeStyle={animatedLikeStyle}
          onComment={handleCommentOpen}
          onDialogue={handleDialogueOpen}
          onLike={handleLike}
          onMoreOptions={onMoreOptions}
          onReview={onReview}
        />

        <CommentBottomSheetModal
          ref={commentSheetRef}
          reelId={item.id}
          onClose={handleCommentClose}
          sheetHeight={sheetHeight}
        />

        <DialogueBottomSheetModal
          ref={dialogueSheetRef}
          reelId={item.id}
          onClose={handleDialogueClose}
          reel={reelForDialogueSheet}
          isLoading={isDialogueLoading}
          player={player}
          onWordPress={handleWordPress}
          sheetHeight={sheetHeight}
        />

        <WordMeaningPopup
          word={popupWord}
          expanded={popupExpanded}
          isVisible={!!popupWord}
          onClose={handlePopupClose}
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
    ...StyleSheet.absoluteFill,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFill,
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
