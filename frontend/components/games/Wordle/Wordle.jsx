import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Vibration,
    BackHandler,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useDictionaryContext } from '@/context/DictionaryContext';
import Keyboard from './Keyboard';
import WordleGrid from './WordleGrid';
import GameOverModal from './pop-ups/GameOverModal';
import ConfirmationPopup from '../ConfirmationPopup';
import { PRIMARY_COLOR } from '@/constants/App';
import { getWordleConfig } from '@/constants/wordleConfig';
import WordleCellPopup from './pop-ups/WordleCellPopup';

const COLORS = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#d3d6da',
    border: '#ccc',
};

export default function Wordle({ onClose }) {
    const { userProgress, setUserProgress } = useAppContext();
    const { dictionary } = useDictionaryContext();

    // Derive language code from the user's current learning language
    const langCode = useMemo(() => {
        const current = userProgress?.languages?.find(l => l.is_current_language);
        return current?.learning_language?.code ?? 'en';
    }, [userProgress?.languages]);

    const config = useMemo(() => getWordleConfig(langCode), [langCode]);

    const [secretWord, setSecretWord] = useState('');
    const [wordLength, setWordLength] = useState(config.wordLength);
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cellPopupVisible, setCellPopupVisible] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [invalidTrigger, setInvalidTrigger] = useState(0);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [coins, setCoins] = useState(userProgress?.coins || 0);
    const [coinTarget, setCoinTarget] = useState(null);
    const coinsViewRef = useRef(null);

    useEffect(() => {
        initializeGame();
    }, [dictionary, config]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (confirmVisible) return false;
            setConfirmVisible(true);
            return true;
        });
        return () => subscription.remove();
    }, [confirmVisible]);

    const initializeGame = useCallback(() => {
        if (!dictionary?.words || dictionary.words.length === 0) {
            setLoading(false);
            return;
        }

        // Normalize all words and keep only those matching this language's script
        const normalized = dictionary.words
            .map(w => config.normalize(w.written_form))
            .filter(w => config.letterRegex.test(w));

        // Try the preferred word length; fall back to the most common length if too few words
        let targetLength = config.wordLength;
        let validWords = normalized.filter(w => [...w].length === targetLength);

        if (validWords.length < 3) {
            const counts = {};
            for (const w of normalized) {
                const len = [...w].length;
                if (len >= 3) counts[len] = (counts[len] || 0) + 1;
            }
            const best = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
            if (best) {
                targetLength = parseInt(best[0]);
                validWords = normalized.filter(w => [...w].length === targetLength);
            }
        }

        if (validWords.length === 0) {
            setLoading(false);
            Alert.alert('Error', 'No valid words found for Wordle');
            return;
        }

        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        setSecretWord(randomWord);
        setWordLength(targetLength);
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setWon(false);
        setLoading(false);
    }, [dictionary, config]);

    // Guesses are stored already-normalized; use spread to correctly index Unicode chars
    const getLetterColor = useCallback((_letter, index, guess) => {
        const guessChars = [...guess];
        const secretChars = [...secretWord];
        if (guessChars[index] === secretChars[index]) return COLORS.correct;
        if (secretChars.includes(guessChars[index])) return COLORS.present;
        return COLORS.absent;
    }, [secretWord]);

    const handleCollect = useCallback(() => {
        setCoins(prev => prev + 5);
        setUserProgress(prev => ({ ...prev, coins: (prev.coins || 0) + 5 }));
        initializeGame();
    }, [setUserProgress, initializeGame]);

    const handleKeyPress = useCallback((letter) => {
        if (gameOver || won) return;

        if (letter === 'BACKSPACE') {
            setCurrentGuess(prev => [...prev].slice(0, -1).join(''));
            return;
        }

        if (letter === 'CLEAR') {
            setCurrentGuess('');
            return;
        }

        if (letter === 'ENTER') {
            if ([...currentGuess].length !== wordLength) {
                Alert.alert('Invalid', `Word must be ${wordLength} letters`);
                return;
            }

            const normalizedGuess = config.normalize(currentGuess);

            const wordExists = dictionary.words.some(
                w => config.normalize(w.written_form) === normalizedGuess
            );

            if (!wordExists) {
                Vibration.vibrate([0, 80, 60, 80, 60, 80]);
                setInvalidTrigger(prev => prev + 1);
                return;
            }

            const newGuesses = [...guesses, normalizedGuess];
            setGuesses(newGuesses);

            if (normalizedGuess === secretWord) {
                setWon(true);
                setGameOver(true);
                return;
            }

            if (newGuesses.length >= config.maxAttempts) {
                setGameOver(true);
                return;
            }

            setCurrentGuess('');
            return;
        }

        if ([...currentGuess].length < wordLength) {
            setCurrentGuess(prev => prev + letter);
        }
    }, [currentGuess, gameOver, won, guesses, secretWord, dictionary, config, wordLength]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6aaa64" />
            </View>
        );
    }

    return (
        <View style={styles.layout}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setConfirmVisible(true)}>
                        <FontAwesome5 name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>WORDLE</Text>
                    <View
                        ref={coinsViewRef}
                        style={styles.coinsContainer}
                        onLayout={() => {
                            coinsViewRef.current?.measureInWindow((x, y, w, h) => {
                                setCoinTarget({ x: x + w / 2, y: y + h / 2 });
                            });
                        }}
                    >
                        <Text style={styles.coinsText}>{coins}</Text>
                        <FontAwesome5 name="coins" size={18} color="#FFD700" />
                    </View>
                </View>

                {/* Game Content */}
                <ScrollView contentContainerStyle={styles.content}>
                    <WordleGrid
                        guesses={guesses}
                        currentGuess={currentGuess}
                        maxAttempts={config.maxAttempts}
                        wordLength={wordLength}
                        secretWord={secretWord}
                        getLetterColor={getLetterColor}
                        isRTL={config.isRTL}
                        onCellPress={(rowIndex) => {
                            const word = guesses[rowIndex];
                            if (!word) return;
                            setSelectedWord(word);
                            setCellPopupVisible(true);
                        }}
                        invalidTrigger={invalidTrigger}
                        onInvalidAnimationEnd={() => setCurrentGuess('')}
                    />

                    {gameOver && (
                        <View style={styles.stats}>
                            <Text style={styles.statsText}>
                                Attempts: {guesses.length}/{config.maxAttempts}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Keyboard */}
                <Keyboard
                    onKeyPress={handleKeyPress}
                    secretWord={secretWord}
                    guesses={guesses}
                    getLetterColor={getLetterColor}
                    disabled={gameOver}
                    langCode={langCode}
                />

                {/* Cell Popup */}
                <WordleCellPopup
                    visible={cellPopupVisible}
                    onClose={() => { setCellPopupVisible(false); setSelectedWord(null); }}
                    word={selectedWord}
                />

                {/* Exit Confirmation Popup */}
                <ConfirmationPopup
                    visible={confirmVisible}
                    title="Quit Game"
                    message="Are you sure you want to leave? Your progress will be lost."
                    onConfirm={onClose}
                    onCancel={() => setConfirmVisible(false)}
                />

                {/* Game Over Modal */}
                <GameOverModal
                    visible={gameOver}
                    won={won}
                    secretWord={secretWord}
                    guessCount={guesses.length}
                    maxAttempts={config.maxAttempts}
                    onPlayAgain={handleCollect}
                    onClose={onClose}
                    isRTL={config.isRTL}
                    coinTarget={coinTarget}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    layout: {
        backgroundColor: PRIMARY_COLOR,
        paddingTop: 20,
        paddingBottom: 50,
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: PRIMARY_COLOR,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    coinsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ffffff21',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    coinsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },
    stats: {
        marginTop: 20,
        alignItems: 'center',
    },
    statsText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});
