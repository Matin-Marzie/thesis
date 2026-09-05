import React, { forwardRef, useCallback, useEffect, useRef, useState, useMemo } from 'react';
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

// Present/dismiss is driven by the parent calling the forwarded ref directly
// from its onPress handler (same pattern as ReelActionsBottomSheetModal) -
// going through a `visible` prop + useEffect instead delayed the call by a
// render, which is unreliable with Reanimated v4 in this app.
export const DialogueBottomSheetModal = forwardRef<BottomSheetModal, DialogueBottomSheetModalProps>(({
    reelId,
    onClose,
    reel,
    player,
    onWordPress,
    sheetHeight,
}, ref) => {
    const isDark = useColorScheme() === 'dark';
    const { userSentences, sentenceDispatch } = useSentenceContext();
    // SentenceContext's userSentences is typed as a plain Object (JSDoc, no
    // index signature) - narrow it here rather than indexing it untyped below.
    const savedSentences = userSentences as Record<number, { text?: string; translation?: string }>;
    const listRef = useRef<BottomSheetFlatListMethods>(null);
    const sentenceStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
        if (!player || !isOpen) return;

        player.timeUpdateEventInterval = 0.1;
        syncCurrentLineByTime((player.currentTime || 0) * 1000);

        const sub = player.addListener('timeUpdate', ({ currentTime }) => {
            syncCurrentLineByTime((currentTime || 0) * 1000);
        });

        return () => sub.remove();
    }, [player, syncCurrentLineByTime, isOpen]);

    useEffect(() => {
        if (!isOpen || currentLineIndex < 0 || currentLineIndex >= sentences.length) {
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
    }, [currentLineIndex, sentences, isOpen]);

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
        if (!isOpen) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (ref && 'current' in ref) ref.current?.dismiss();
            return true;
        });
        return () => sub.remove();
    }, [isOpen, ref]);

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
            setIsOpen(index >= 0);
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
            onWordPress(token.word, token.expanded);
        },
        [onWordPress]
    );

    // Optimistic local-only save/unsave, synced later by useBackendSync -
    // same pattern as adding/removing a word from vocabulary. text/translation
    // are carried along for display only (not sent to the backend, which
    // resolves sentence text itself via a JOIN when re-fetching user_sentences).
    const handleSaveSentence = useCallback(
        (sentence: Sentence) => {
            if (savedSentences[sentence.id]) {
                sentenceDispatch({
                    type: SENTENCE_ACTIONS.REMOVE,
                    payload: { sentenceId: sentence.id },
                });
                return;
            }
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

    // BottomSheetModal is always mounted (so the portal is ready before
    // `present()` is ever called by the parent via the forwarded ref) -
    // only its content is conditional on data being available, same
    // pattern as CommentBottomSheetModal.
    const hasContent = !!reel && sentences.length > 0;

    return (
        <BottomSheetModal
            ref={ref}
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
            {hasContent && (
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
            )}
        </BottomSheetModal>
    );
});

DialogueBottomSheetModal.displayName = 'DialogueBottomSheetModal';

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
