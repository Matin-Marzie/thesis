import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'; // useState kept for currentLineIndex
import {
    StyleSheet,
    BackHandler,
    View,
    Text,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { FontAwesome } from '@expo/vector-icons';
import type { VideoPlayer } from 'expo-video';
import type { Reel, Sentence, Token, Word } from '../../types/dialogue';
import { LANGUAGES_META } from '../../constants/SupportedLanguages';

const SNAP_POINTS = ['28%'];
const RTL_LANGUAGE_CODES = new Set(
    Object.values(LANGUAGES_META)
        .filter((language) => language.rightToLeft)
        .map((language) => language.code.toLowerCase())
);

interface DialogueBottomSheetModalProps {
    reelId: number;
    visible: boolean;
    onClose: () => void;
    reel?: Reel;
    player?: VideoPlayer;
    onWordPress: (word: Word, translation: string) => void;
}


export function DialogueBottomSheetModal({
    reelId,
    visible,
    onClose,
    reel,
    player,
    onWordPress,
}: DialogueBottomSheetModalProps) {
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
                (sentence) =>
                    currentTimeMs >= sentence.start_time_ms &&
                    currentTimeMs <= sentence.end_time_ms
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
        } else {
            sheetRef.current?.dismiss();
        }
    }, [visible]);

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
                onClose();
            }
        },
        [onClose]
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
        (token: Token, sentenceId: number) => {
            const sentence = sentences.find((s) => s.id === sentenceId);
            const tokenTranslation = sentence?.translation || '';
            onWordPress(token.word, tokenTranslation);
        },
        [sentences, onWordPress]
    );

    const renderSentence = useCallback(
        ({ item: sentence, index }: { item: Sentence; index: number }) => {
            const isCurrentLine = index === currentLineIndex;
            const hasTokens = sentence.tokens && sentence.tokens.length > 0;

            return (
                <Pressable
                    onPress={() => handleSentencePress(sentence)}
                    style={[
                        styles.sentenceContainer,
                        isCurrentLine && styles.sentenceContainerHighlighted,
                        isRightToLeft && styles.sentenceContainerRtl,
                    ]}
                >
                    <View style={[styles.sentenceRow, isRightToLeft && styles.sentenceRowRtl]}>
                        {/* Token buttons — not nested in Pressable to avoid touch conflicts */}
                        <View style={[styles.sentenceTextContainer, isRightToLeft && styles.sentenceTextContainerRtl]}>
                            <View style={[styles.tokensRow, isRightToLeft && styles.tokensRowRtl]}>
                                {hasTokens ? (
                                    sentence.tokens.map((token) => (
                                        <Pressable
                                            key={token.id}
                                            style={styles.tokenButton}
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                handleTokenPress(token, sentence.id);
                                            }}
                                        >
                                            <Text style={[styles.tokenText, isRightToLeft && styles.textRtl]}>{token.word.written_form}</Text>
                                        </Pressable>
                                    ))
                                ) : (
                                    <Text style={[styles.sentenceText, isRightToLeft && styles.textRtl]}>{sentence.text}</Text>
                                )}
                            </View>
                        </View>

                        <View style={[styles.translationWrap, isRightToLeft && styles.translationWrapRtl]}>
                            <Text style={[styles.translationText, isRightToLeft && styles.textRtl]}>{sentence.translation}</Text>
                        </View>
                    </View>

                </Pressable>
            );
        },
        [currentLineIndex, handleSentencePress, handleTokenPress, isRightToLeft]
    );

    if (!reel || !sentences.length) {
        return;
    }

    return (
        <>
            <BottomSheetModal
                ref={sheetRef}
                snapPoints={SNAP_POINTS}
                enableDynamicSizing={false}
                enablePanDownToClose={false}
                enableHandlePanningGesture={false}
                keyboardBehavior="extend"
                keyboardBlurBehavior="restore"
                backdropComponent={renderBackdrop}
                onChange={handleSheetChange}
                handleIndicatorStyle={styles.handle}
                backgroundStyle={styles.background}
            >
                <View style={styles.controlsRow}>
                    <Pressable onPress={handleTogglePlayPause} style={styles.playPauseButton}>
                        {isPlaying ?
                        <FontAwesome
                            name='pause'
                            size={16}
                            color="#1f2937"
                        />
                        :
                        <FontAwesome
                            name='play'
                            size={16}
                            color="#1f2937"
                        />
                        }
                    </Pressable>
                </View>

                <BottomSheetFlatList
                    ref={listRef}
                    data={sentences}
                    keyExtractor={(item: Sentence, index: number) => `sentence-${item.id}-${item.position}-${index}`}
                    renderItem={renderSentence}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={true}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    // ListHeaderComponent={

                    // }
                    onScrollToIndexFailed={handleScrollToIndexFailed}
                />
            </BottomSheetModal>

        </>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'transparent',
    },
    handle: {
        backgroundColor: '#d1d5db',
        width: 36,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    scrollContainer: {
        flex: 1,
    },
    controlsRow: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
        alignItems: 'flex-end',
    },
    playPauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#e5e7eb',
        alignSelf: 'flex-end',
    },
    playPauseText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1f2937',
    },
    contentContainer: {
        paddingHorizontal: 6,
        backgroundColor: 'transparent',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    languageTag: {
        backgroundColor: '#dbeafe',
        color: '#0369a1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    reelTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
        marginTop: 8,
    },
    sentencesContainer: {
    },
    sentenceContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sentenceContainerRtl: {
        alignItems: 'flex-end',
    },
    sentenceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
    },
    sentenceRowRtl: {
        flexDirection: 'row-reverse',
    },
    sentenceContainerHighlighted: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        borderWidth: 2,
    },
    sentenceTextContainer: {
        flex: 1,
        minWidth: 0,
    },
    sentenceTextContainerRtl: {
        alignItems: 'flex-end',
    },
    tokensRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tokensRowRtl: {
        justifyContent: 'flex-end',
    },
    tokenButton: {
        // backgroundColor: '#f0f4f8',
        backgroundColor: 'blue',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    tokenText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
    },
    sentenceText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
        lineHeight: 20,
    },
    translationText: {
        fontSize: 13,
        color: '#6b7280',
        fontStyle: 'italic',
        lineHeight: 18,
        marginTop: 2,
    },
    translationWrap: {
        marginLeft: 8,
        flexShrink: 1,
        maxWidth: '45%',
    },
    translationWrapRtl: {
        marginLeft: 0,
        marginRight: 8,
    },
    textRtl: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    separator: {
        height: 0,
        marginVertical: 4,
    },
    playingIndicator: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
});
