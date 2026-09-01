import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, BackHandler, View } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SharedValue } from 'react-native-reanimated';
import { withSpring } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import type { Sentence, Token } from '../../../types/dialogue';
import { LANGUAGES_META } from '../../../constants/SupportedLanguages';
import { useColorScheme } from '@/components/useColorScheme';
import { useSentenceContext } from '@/context/SentenceContext';
import { SENTENCE_ACTIONS } from '@/hooks/useSentences';
import { PlaybackControls } from './PlaybackControls';
import { SentenceRow } from './SentenceRow';
import type { DialogueBottomSheetModalProps } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const snapPoints = ['28%', '60%', '96%'];
const snapPointsRatio = [0.1, 0.57];
const RTL_LANGUAGE_CODES = new Set(
    Object.values(LANGUAGES_META)
        .filter((language) => language.rightToLeft)
        .map((language) => language.code.toLowerCase())
);

export function DialogueBottomSheetModal({
    reelId,
    visible,
    onClose,
    reel,
    player,
    onWordPress,
    sheetHeight,
}: DialogueBottomSheetModalProps) {
    const isDark = useColorScheme() === 'dark';
    const { userSentences, sentenceDispatch } = useSentenceContext();
    // SentenceContext's userSentences is typed as a plain Object (JSDoc, no
    // index signature) - narrow it here rather than indexing it untyped below.
    const savedSentences = userSentences as Record<number, { text?: string; translation?: string }>;
    const sheetRef = useRef<BottomSheetModal>(null);
    const listRef = useRef<BottomSheetFlatListMethods>(null);
    const sentenceStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const sentences = useMemo(() => reel?.dialogue?.sentences || [], [reel]);
    const isRightToLeft = useMemo(
        () => RTL_LANGUAGE_CODES.has((reel?.language?.code || '').toLowerCase()),
        [reel?.language?.code]
    );

    const syncCurrentLineByTime = useCallback(
        (currentTimeMs: number) => {
            const index = sentences.findIndex(
                (sentence, i) => {
                    const effectiveEnd = sentence.end_time_ms ?? sentences[i + 1]?.start_time_ms ?? Infinity;
                    return currentTimeMs >= sentence.start_time_ms && currentTimeMs <= effectiveEnd;
                }
            );

            if (index !== -1) {
                setCurrentLineIndex((prev) => (prev === index ? prev : index));
            }
        },
        [sentences]
    );

    // Keep highlight in sync with player progress.
    useEffect(() => {
        if (!player || !visible) return;

        player.timeUpdateEventInterval = 0.1;
        syncCurrentLineByTime((player.currentTime || 0) * 1000);

        const sub = player.addListener('timeUpdate', ({ currentTime }) => {
            syncCurrentLineByTime((currentTime || 0) * 1000);
        });

        return () => sub.remove();
    }, [player, syncCurrentLineByTime, visible]);

    useEffect(() => {
        if (!visible || currentLineIndex < 0 || currentLineIndex >= sentences.length) {
            return;
        }

        const timer = setTimeout(() => {
            listRef.current?.scrollToIndex({
                index: currentLineIndex,
                animated: true,
                viewPosition: 0.3,
                viewOffset: 24,
            });
        }, 80);

        return () => clearTimeout(timer);
    }, [currentLineIndex, sentences, visible]);

    const handleScrollToIndexFailed = useCallback(
        (info: { index: number }) => {
            setTimeout(() => {
                listRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0.3,
                    viewOffset: 24,
                });
            }, 120);
        },
        []
    );

    useEffect(() => {
        if (visible) {
            sheetRef.current?.present();
            sheetHeight.value = withSpring(SCREEN_HEIGHT * snapPointsRatio[0], { damping: 20 });
        } else {
            sheetRef.current?.dismiss();
            sheetHeight.value = withSpring(0, { damping: 20 });
        }
    }, [visible, sheetHeight]);

    useEffect(() => {
        if (!player) {
            setIsPlaying(false);
            return;
        }

        setIsPlaying(player.playing);
        const sub = player.addListener('playingChange', ({ isPlaying: nextIsPlaying }) => {
            setIsPlaying(nextIsPlaying);
        });

        return () => sub.remove();
    }, [player]);

    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => sub.remove();
    }, [visible, onClose]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={0.5}
            />
        ),
        []
    );

    const handleSheetChange = useCallback(
        (index: number) => {
            if (index === -1) {
                sheetHeight.value = withSpring(0, { damping: 20 });
                onClose();
            } else if (index >= 0 && index < snapPointsRatio.length) {
                sheetHeight.value = withSpring(SCREEN_HEIGHT * snapPointsRatio[index], { damping: 20 });
            }
        },
        [onClose, sheetHeight]
    );

    const handleSentencePress = useCallback(
        (sentence: Sentence) => {
            if (!player) return;

            if (sentenceStopTimeoutRef.current) {
                clearTimeout(sentenceStopTimeoutRef.current);
                sentenceStopTimeoutRef.current = null;
            }

            const tappedIndex = sentences.findIndex((item) => item.id === sentence.id);
            if (tappedIndex !== -1) {
                setCurrentLineIndex(tappedIndex);
            }

            player.currentTime = sentence.start_time_ms / 1000;
            player.play();
            setIsPlaying(true);
        },
        [player, sentences]
    );

    const handleTogglePlayPause = useCallback(() => {
        if (!player) return;

        if (isPlaying) {
            player.pause();
            setIsPlaying(false);
        } else {
            player.play();
            setIsPlaying(true);
        }
    }, [isPlaying, player]);

    useEffect(() => {
        return () => {
            if (sentenceStopTimeoutRef.current) {
                clearTimeout(sentenceStopTimeoutRef.current);
                sentenceStopTimeoutRef.current = null;
            }
        };
    }, []);

    const handleTokenPress = useCallback(
        (token: Token) => {
            onWordPress(token.word);
        },
        [onWordPress]
    );

    // Optimistic local-only save, synced later by useBackendSync - same
    // pattern as adding a word to vocabulary. text/translation are carried
    // along for display only (not sent to the backend, which resolves
    // sentence text itself via a JOIN when re-fetching user_sentences).
    const handleSaveSentence = useCallback(
        (sentence: Sentence) => {
            if (savedSentences[sentence.id]) return;
            sentenceDispatch({
                type: SENTENCE_ACTIONS.ADD,
                payload: { sentenceId: sentence.id, text: sentence.text, translation: sentence.translation },
            });
        },
        [savedSentences, sentenceDispatch]
    );

    const renderSentence = useCallback(
        ({ item: sentence, index }: { item: Sentence; index: number }) => (
            <SentenceRow
                sentence={sentence}
                isCurrentLine={index === currentLineIndex}
                isDark={isDark}
                isRightToLeft={isRightToLeft}
                isSaved={!!savedSentences[sentence.id]}
                onPress={handleSentencePress}
                onTokenPress={handleTokenPress}
                onSavePress={handleSaveSentence}
            />
        ),
        [currentLineIndex, handleSentencePress, handleTokenPress, handleSaveSentence, savedSentences, isRightToLeft, isDark]
    );

    if (!reel || !sentences.length) {
        return;
    }

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            backdropComponent={renderBackdrop}
            onChange={handleSheetChange}
            handleIndicatorStyle={styles.handle}
            backgroundStyle={styles.background}
        >
            <SafeAreaView edges={['bottom']} style={styles.sheetContent}>
                <PlaybackControls isPlaying={isPlaying} isDark={isDark} onTogglePlayPause={handleTogglePlayPause} />

                <BottomSheetFlatList
                    ref={listRef}
                    data={sentences}
                    keyExtractor={(item: Sentence, index: number) => `sentence-${item.id}-${item.position}-${index}`}
                    renderItem={renderSentence}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={true}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    onScrollToIndexFailed={handleScrollToIndexFailed}
                />
            </SafeAreaView>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#333',
    },
    handle: {
        backgroundColor: '#d1d5db',
        width: 36,
    },
    sheetContent: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 6,
        backgroundColor: 'transparent',
    },
    separator: {
        height: 0,
        marginVertical: 4,
    },
});
