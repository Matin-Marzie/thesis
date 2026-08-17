import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import type { Sentence, Token } from '../../../types/dialogue';

interface SentenceRowProps {
    sentence: Sentence;
    isCurrentLine: boolean;
    isDark: boolean;
    isRightToLeft: boolean;
    isSaved: boolean;
    onPress: (sentence: Sentence) => void;
    onTokenPress: (token: Token, sentenceId: number) => void;
    onSavePress: (sentence: Sentence) => void;
}

export function SentenceRow({ sentence, isCurrentLine, isDark, isRightToLeft, isSaved, onPress, onTokenPress, onSavePress }: SentenceRowProps) {
    const hasTokens = sentence.tokens && sentence.tokens.length > 0;

    return (
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
                        {hasTokens ? (
                            sentence.tokens.map((token) => (
                                <Pressable
                                    key={token.id}
                                    style={[styles.tokenButton, isDark && { borderColor: DARK_COLORS.border }]}
                                    onPress={(event) => {
                                        event.stopPropagation();
                                        onTokenPress(token, sentence.id);
                                    }}
                                >
                                    <Text style={[styles.tokenText, isDark && { color: DARK_COLORS.text }, isRightToLeft && styles.textRtl]}>{token.word.written_form}</Text>
                                </Pressable>
                            ))
                        ) : (
                            <Text style={[styles.sentenceText, isDark && { color: DARK_COLORS.text }, isRightToLeft && styles.textRtl]}>{sentence.text}</Text>
                        )}
                    </View>
                </View>

                <View style={[styles.translationWrap, isRightToLeft && styles.translationWrapRtl]}>
                    <Text style={[styles.translationText, isDark && { color: DARK_COLORS.textSecondary }, isRightToLeft && styles.textRtl]}>{sentence.translation}</Text>
                </View>

                {/* Save button — not nested with the token buttons, single per-row action */}
                <Pressable
                    hitSlop={8}
                    style={styles.saveButton}
                    onPress={(event) => {
                        event.stopPropagation();
                        onSavePress(sentence);
                    }}
                >
                    <FontAwesome
                        name={isSaved ? 'bookmark' : 'bookmark-o'}
                        size={18}
                        color={isSaved ? PRIMARY_COLOR : (isDark ? DARK_COLORS.textSecondary : '#9ca3af')}
                    />
                </Pressable>
            </View>
        </Pressable>
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
    },
    tokensRowRtl: {
        justifyContent: 'flex-end',
    },
    tokenButton: {
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
    saveButton: {
        marginLeft: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    textRtl: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
