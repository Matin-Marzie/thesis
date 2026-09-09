import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Easing, BackHandler } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDictionaryContext } from '@/context/DictionaryContext';
import { useProgress } from '@/context/ProgressContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { getDueWords } from '@/utils/fsrs';
import GenerateWordOfWonderLevel from './LevelGenerator';
import WordOfWonders from './WordOfWonders';
import ConfirmationPopup from '../ConfirmationPopup';
import { BACKGROUND_IMAGE_URI, width, MAX_WIDTH, height } from './gameConstants';

export default function GameLoader() {
    const { dictionary } = useDictionaryContext();
    const { userProgress } = useProgress();
    const { userVocabulary } = useVocabularyContext();
    const router = useRouter();
    const [levelData, setLevelData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const spinValue = useRef(new Animated.Value(0)).current;

    const currentLang = userProgress?.languages?.find(l => l.is_current_language);
    const learningLangCode = currentLang?.learning_language?.code || 'en';

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (confirmVisible) return false;
            setConfirmVisible(true);
            return true;
        });
        return () => subscription.remove();
    }, [confirmVisible]);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 900,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        anim.start();
        return () => anim.stop();
    }, [spinValue]);

    // Board words are drawn from the user's own tracked vocabulary, not the
    // full dictionary, so finding a grid word doubles as a real FSRS review
    // (mirrors Wordle - see games.ts's isPlayable gate on tracked word count).
    const trackedWords = React.useMemo(
        () => (dictionary?.words ?? []).filter((w) => userVocabulary[w.id]),
        [dictionary, userVocabulary]
    );

    // Currently-due tracked words, read via ref so generateLevel can pick a
    // fresh random one on every call (including "play again") instead of a
    // single choice memoized once per userVocabulary change.
    const dueWords = React.useMemo(() => getDueWords(userVocabulary), [userVocabulary]);
    const dueWordsRef = useRef(dueWords);
    dueWordsRef.current = dueWords;

    const generateLevel = (words) => {
        setIsGenerating(true);
        setTimeout(() => {
            // If any tracked word is currently due, force the crossword's
            // practice word to be a random one of those (mirrors Wordle
            // preferring due words) - otherwise LevelGenerator falls back to
            // picking a random practice word.
            const due = dueWordsRef.current;
            const dueWordId = due.length > 0 ? due[Math.floor(Math.random() * due.length)].wordId : null;
            const [board, gridWords, generatedLetters, reviewWordId] = GenerateWordOfWonderLevel(words, learningLangCode, dueWordId);
            setLevelData({
                boxData: board,
                gridWords: gridWords,
                letters: generatedLetters,
                // Non-null only when this round was actually built on a real
                // due word (see LevelGenerator) - drives the FSRS rating
                // prompt on the finish screen.
                reviewWordId,
            });
            setIsGenerating(false);
        }, 0);
    };

    // Generate the level once tracked vocabulary words first become
    // available - NOT on every subsequent trackedWords/userVocabulary change.
    // reviewWord() (called from the finish screen's Collect handler) updates
    // userVocabulary, which would otherwise change this memo's identity and
    // re-fire this effect, silently swapping in a new level mid-animation
    // before the player ever pressed Collect (same class of bug Wordle's
    // initializeGame refs work around - see its comment). Every subsequent
    // level comes only from an explicit onPlayAgain call below.
    const hasGeneratedRef = useRef(false);
    useEffect(() => {
        if (hasGeneratedRef.current) return;
        if (trackedWords.length === 0) return;
        hasGeneratedRef.current = true;
        generateLevel(trackedWords);
    }, [trackedWords]);

    // Show loading screen while generating
    const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    if (isGenerating || !levelData) {
        return (
            <View style={styles.outerContainer}>
                <ImageBackground
                    source={{ uri: BACKGROUND_IMAGE_URI }}
                    style={styles.container}
                    resizeMode="cover"
                >

                    <View style={{ alignItems: 'center', marginBottom: height * 0.20 }}>
                        <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 16 }}>
                            <FontAwesome5 name="spinner" size={40} color="#fff" />
                        </Animated.View>
                        <Text style={{ color: '#fff', fontSize: 18 }}>Generating Level...</Text>
                    </View>
                </ImageBackground>

                <ConfirmationPopup
                    visible={confirmVisible}
                    title="Quit Game"
                    message="Are you sure you want to leave?"
                    onConfirm={() => router.back()}
                    onCancel={() => setConfirmVisible(false)}
                />
            </View>
        );
    }

    // Render WordOfWonders with generated data
    return (
        <WordOfWonders
            boxData={levelData.boxData}
            gridWords={levelData.gridWords}
            letters={levelData.letters}
            reviewWordId={levelData.reviewWordId}
            langCode={learningLangCode}
            onPlayAgain={() => generateLevel(trackedWords)}
        />
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        width: width,
        maxWidth: MAX_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    HeaderBar: {
        position: 'absolute',
        top: height * 0.05,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.02,
        zIndex: 10,
    },
    coinsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    coinsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        padding: 5,
    },
});
