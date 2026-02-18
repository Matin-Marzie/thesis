import { useAppContext } from '@/context/AppContext';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Animated, Vibration, Dimensions } from 'react-native';
import { getWikimediaDictionary, extractDefinitions } from '@/api/dictionary';
import MasteryLevelButton from '@/components/vocabulary/MasteryLevelButton';
import { Swipeable, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useDictionary } from '@/hooks/useDictionary';
import { VOCABULARY_ACTIONS } from '@/hooks/useVocabulary';

function WordItem({ item }) {
    
    const { dictionary } = useDictionary();
    const { userVocabulary, vocabularyDispatch, isOnline, userProgress } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [meanings, setMeanings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cache for Wikimedia results
    const cache = useMemo(() => ({}), []);

    const word = dictionary?.words?.find(
        (w) => w.written_form.toLowerCase() === item.toLowerCase()
    ) || null;

    const article = word && word.article ? word.article : '';
    const written_form = word && word.written_form;
    const translations = word && word.translations ? word.translations.join(', ') : '';
    const level = word && word.level ? word.level : null;

    // Get language code from current learning language
    const current_language = userProgress?.languages?.find(lang => lang.is_current_language);
    const language_code = current_language?.learning_language?.code;

    const UserVocabularyEntry = word ? userVocabulary[word.id] : null;
    const swipeableRef = useRef(null);
    
    // Get half of screen width for swipe threshold
    const screenWidth = Dimensions.get('window').width;
    const swipeThreshold = screenWidth / 2;

    // Remove word from vocabulary (swipe to delete)
    const handleRemoveWord = useCallback(() => {
        if (!word || isDeleting) return;
        setIsDeleting(true);
        Vibration.vibrate(20); // Haptic feedback for delete action
        vocabularyDispatch({
            type: VOCABULARY_ACTIONS.REMOVE,
            payload: { wordId: word.id },
        });
    }, [word, vocabularyDispatch, isDeleting]);

    const renderLeftActions = useCallback((progress, dragX) => {
        if (!UserVocabularyEntry) return null;

        const scale = dragX.interpolate({
            inputRange: [0, swipeThreshold],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                    handleRemoveWord();
                    swipeableRef.current?.close();
                }}
            >
                <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                    <Text style={styles.deleteActionText}>Delete</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    }, [UserVocabularyEntry, handleRemoveWord, swipeThreshold]);

    // Add word to vocabulary
    const handleAddWord = useCallback(() => {
        if (!word) return;
        vocabularyDispatch({
            type: VOCABULARY_ACTIONS.ADD,
            payload: {
                wordId: word.id,
                language_id: current_language?.learning_language?.id,
            },
        });
    }, [word, vocabularyDispatch, current_language]);

    const handleDictionaryLookup = useCallback(async () => {
        if (language_code !== 'en') return; // SUPPORT ONLY ENGLISH FOR NOW, TO DO: ADD OTHER LANGUAGES
        if (!isExpanded) {
            // Opening - fetch if not cached
            setIsExpanded(true);

            if (meanings) {
                return; // Already loaded
            }

            const cacheKey = `${language_code}-${written_form}`;
            if (cache[cacheKey]) {
                setMeanings(cache[cacheKey]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await getWikimediaDictionary(language_code, written_form);
                const extractedMeanings = extractDefinitions(response, language_code);

                if (extractedMeanings.length === 0) {
                    setError('No definitions found');
                } else {
                    setMeanings(extractedMeanings);
                    cache[cacheKey] = extractedMeanings;
                }
            } catch (err) {
                console.error('Dictionary error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            // Closing
            setIsExpanded(false);
        }
    }, [isExpanded, meanings, language_code, written_form, cache]);

    // Don't render if item is being deleted
    if (isDeleting) {
        return null;
    }

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            onSwipeableWillOpen={(direction) => {
                if (direction === 'left') {
                    handleRemoveWord();
                }
            }}
            leftThreshold={swipeThreshold}
            overshootLeft={false}
            enabled={!!UserVocabularyEntry && !isDeleting}
        >
        <View style={styles.row}>
            <View style={[styles.wordRow]}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginTop: 2, marginRight: 12 }}>{article || ''}</Text>
                    <View style={styles.written_formTranslationRow}>
                        <Text style={[styles.written_form]}>{written_form}</Text>
                        <Text style={[styles.translationText]}>{translations}</Text>
                    </View>
                </View>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginHorizontal: 10 }}>
                        <Text>{level}</Text>

                        {UserVocabularyEntry ? (
                            <MasteryLevelButton masteryLevel={UserVocabularyEntry?.mastery_level} />
                        ) : (
                            // Add new Vocabulary word
                            <TouchableOpacity style={styles.addButton} onPress={handleAddWord}>
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        )}
                        {/* wiktionary icon */}
                        {isOnline && (
                            <TouchableOpacity
                                style={styles.dictionaryButton}
                                onPress={handleDictionaryLookup}
                            >
                                {isExpanded ? (
                                    <FontAwesome5
                                        name="chevron-up"
                                        size={24}
                                        color="#EBD0A3"
                                    />
                                ) : (
                                    <Image
                                        source={require("@/assets/images/Wiktionary-logo.svg.png")}
                                        style={{
                                            width: 35,
                                            height: 35,
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            {/* Wikimedia dictionary section */}
            {isExpanded && isOnline && (
                <ScrollView style={styles.wikimediaDictionarySection}>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007bff" />
                            <Text style={styles.loadingText}>Loading definitions...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>❌ {error}</Text>
                        </View>
                    )}

                    {meanings && meanings.length > 0 && (
                        <View>
                            {meanings.map((item, index) => (
                                <View key={index} style={styles.meaningItem}>
                                    {item.partOfSpeech && (
                                        <Text style={styles.partOfSpeechText}>
                                            {item.partOfSpeech}
                                        </Text>
                                    )}
                                    {item.definitions && item.definitions.map((definition, defIndex) => (
                                        <Text key={defIndex} style={styles.definitionText}>
                                            {defIndex + 1}. {definition}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    row: {
        zIndex: 1,
        borderBottomWidth: 2,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    deleteAction: {
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width / 2,
    },
    deleteActionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    wordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingVertical: 10
    },
    written_formTranslationRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    written_form: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    translationText: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        width: 38,
        height: 38,
        borderRadius: 16,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 20,
        lineHeight: 20,
    },

    dictionaryButton: {
        width: 38,
        height: 38,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dictionaryButtonText: {
        color: '#fff',
        fontSize: 20,
        lineHeight: 20,
        color: '#007bff',
    },
    wikimediaDictionarySection: {
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        marginBottom: 10,
        maxHeight: 250,
        borderTopWidth: 2,
        borderLeftWidth: 5,
        borderRightWidth: 0,
        borderBottomWidth: 2,
        borderLeftColor: "#EBD0A3",
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    errorContainer: {
        paddingVertical: 10,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
    },
    meaningItem: {
        marginBottom: 12,
    },
    partOfSpeechText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#555',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    definitionText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 4,
        lineHeight: 18,
    },
    meaningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        lineHeight: 20,
    },
    examplesContainer: {
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#e0e0e0',
    },
    exampleText: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
        marginVertical: 4,
        lineHeight: 18,
    },
});
export default memo(WordItem, (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render), false if they differ (re-render)
    return prevProps.item === nextProps.item;
});