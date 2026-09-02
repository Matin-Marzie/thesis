import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import type { Sentence, Token } from '../../../types/dialogue';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH / 2;

interface SentenceRowProps {
    sentence: Sentence;
    isCurrentLine: boolean;
    isDark: boolean;
    isRightToLeft: boolean;
    isSaved: boolean;
    onPress: (sentence: Sentence) => void;
    onTokenPress: (token: Token) => void;
    onSavePress: (sentence: Sentence) => void;
}

export function SentenceRow({ sentence, isCurrentLine, isDark, isRightToLeft, isSaved, onPress, onTokenPress, onSavePress }: SentenceRowProps) {
    const words = sentence.text
        .trim()
        .split(/\s+/)
        .map((word, index) => ({ word, position: index + 1 }));
    const orderedWords = isRightToLeft ? [...words].reverse() : words;

    const swipeableRef = useRef<Swipeable>(null);

    // Swipe right reveals this panel; crossing SWIPE_THRESHOLD auto-triggers
    // the same save/unsave toggle as the bookmark button, then snaps closed -
    // the row stays in the list either way, unlike a swipe-to-delete.
    const renderLeftActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [0, SWIPE_THRESHOLD],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
        });

        return (
            <View style={[styles.swipeAction, isSaved ? styles.swipeActionRemove : styles.swipeActionSave]}>
                <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
                    <FontAwesome name={isSaved ? 'bookmark' : 'bookmark-o'} size={20} color="#fff" />
                    <Text style={styles.swipeActionText}>{isSaved ? 'Unsave' : 'Save'}</Text>
                </Animated.View>
            </View>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            onSwipeableWillOpen={(direction) => {
                if (direction === 'left') {
                    onSavePress(sentence);
                    swipeableRef.current?.close();
                }
            }}
            leftThreshold={SWIPE_THRESHOLD}
            overshootLeft={false}
        >
            <Pressable
                onPress={() => onPress(sentence)}
                style={[
                    styles.sentenceContainer,
                    isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border },
                    isCurrentLine && styles.sentenceContainerHighlighted,
                    isRightToLeft && styles.sentenceContainerRtl,
                ]}
            >
                <View style={[styles.sentenceRow, isRightToLeft && styles.sentenceRowRtl]}>
                    {/* Token buttons — not nested in Pressable to avoid touch conflicts */}
                    <View style={[styles.sentenceTextContainer, isRightToLeft && styles.sentenceTextContainerRtl]}>
                        <View style={[styles.tokensRow, isRightToLeft && styles.tokensRowRtl]}>
                            {orderedWords.map(({ word, position }) => {
                                const token = sentence.tokens?.find((t) => t.position === position);

                                if (!token) {
                                    return (
                                        <Text
                                            key={`${sentence.id}-${position}`}
                                            style={[styles.sentenceText, isDark && { color: DARK_COLORS.text }, isRightToLeft && styles.textRtl]}
                                        >
                                            {word}
                                        </Text>
                                    );
                                }

                                return (
                                    <Pressable
                                        key={`${sentence.id}-${position}`}
                                        style={styles.tokenButton}
                                        onPress={(event) => {
                                            event.stopPropagation();
                                            onTokenPress(token);
                                        }}
                                    >
                                        <Text style={[styles.tokenText, isDark && { color: DARK_COLORS.text }, isRightToLeft && styles.textRtl]}>{word}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={[styles.translationWrap, isRightToLeft && styles.translationWrapRtl]}>
                        <Text style={[styles.translationText, isDark && { color: DARK_COLORS.textSecondary }]}>{sentence.translation}</Text>
                    </View>
                </View>
            </Pressable>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
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
        alignItems: 'center',
        gap: 4,
    },
    tokensRowRtl: {
        justifyContent: 'flex-end',
    },
    tokenButton: {
        paddingVertical: 2,
    },
    tokenText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
    },
    sentenceText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
        lineHeight: 26,
    },
    translationText: {
        fontSize: 16,
        color: '#6b7280',
        fontStyle: 'italic',
        lineHeight: 22,
        marginTop: 2,
        textAlign: 'left',
        writingDirection: 'ltr',
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
    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH / 2,
        borderRadius: 12,
    },
    swipeActionSave: {
        backgroundColor: PRIMARY_COLOR,
    },
    swipeActionRemove: {
        backgroundColor: '#e74c3c',
    },
    swipeActionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});
