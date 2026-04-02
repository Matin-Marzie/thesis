import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { API_BASE_URL } from '@/config/api.config';
import { ReelOverlay } from './ReelOverlay';
import { CommentBottomSheetModal } from './CommentBottomSheetModal';
import { DialogueBottomSheetModal } from './DialogueBottomSheetModal';
import { WordMeaningPopup } from './WordMeaningPopup';
import type { Word } from '../../types/dialogue';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const fixVideoUrl = (url: string): string => {
  if (!url) return url;
  const apiHost = API_BASE_URL.match(/https?:\/\/([^:/]+)/)?.[1];
  if (apiHost && url.includes('localhost')) {
    return url.replace('localhost', apiHost);
  }
  return url;
};

interface ReelItemProps {
  item: any;
  isActive: boolean;
  isScreenFocused: boolean;
}

export const ReelItem = React.memo(
  ({ item, isActive, isScreenFocused }: ReelItemProps) => {
    const [isLiked, setIsLiked] = useState(item.user_interaction?.is_liked || false);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [popupWord, setPopupWord] = useState<Word | null>(null);
    const [popupTranslation, setPopupTranslation] = useState('');
    const pauseIconOpacity = useSharedValue(0);
    const animatedPauseIconStyle = useAnimatedStyle(() => ({
      opacity: pauseIconOpacity.value,
    }));

    // Height of the phantom spacer at the bottom of the flex container.
    // Growing this value pushes videoContainer (flex: 1) upward naturally.
    const sheetHeight = useSharedValue(0);
    const animatedSpacerStyle = useAnimatedStyle(() => ({
      height: sheetHeight.value,
    }));

    const shouldPlay = isActive && isScreenFocused && !isPaused;
    const videoUrl = fixVideoUrl(item.url);

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

    const handleLike = useCallback(() => setIsLiked((prev: boolean) => !prev), []);
    const handleCommentOpen = useCallback(() => setIsCommentOpen(true), []);
    const handleCommentClose = useCallback(() => setIsCommentOpen(false), []);
    const handleDialogueOpen = useCallback(() => setIsDialogueOpen(true), []);
    const handleDialogueClose = useCallback(() => setIsDialogueOpen(false), []);
    const handleWordPress = useCallback((word: Word, translation: string) => {
      setPopupWord(word);
      setPopupTranslation(translation);
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

        {/* Tap-to-pause layer */}
        <Pressable style={styles.tapOverlay} onPress={handleTogglePause}>
          <Animated.View style={[styles.pauseIconContainer, animatedPauseIconStyle]}>
            <FontAwesome name="pause" size={30} color="rgba(255,255,255,0.85)" />
          </Animated.View>
        </Pressable>

        <ReelOverlay
          item={item}
          isLiked={isLiked}
          hasDialogue={!!(item.dialogue?.sentences?.length)}
          onComment={handleCommentOpen}
          onDialogue={handleDialogueOpen}
          onLike={handleLike}
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
        />

        <WordMeaningPopup
          word={popupWord}
          translation={popupTranslation}
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
