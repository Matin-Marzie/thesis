import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Vibration,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useDictionaryContext } from '@/context/DictionaryContext';
import Keyboard from './Keyboard';
import WordleGrid from './WordleGrid';
import GameOverModal from './GameOverModal';
import { PRIMARY_COLOR } from '@/constants/App';
import { getWordleConfig } from '@/constants/wordleConfig';
import WordleCellPopup from './WordleCellPopup';

const COLORS = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#d3d6da',
    border: '#ccc',
};

export default function Wordle({ onClose }) {
    const { userProgress } = useAppContext();
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
    const [invalidTrigger, setInvalidTrigger] = useState(0);

    useEffect(() => {
        initializeGame();
    }, [dictionary, config]);

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
                    <TouchableOpacity onPress={onClose}>
                        <FontAwesome5 name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>WORDLE</Text>
                    <View style={{ width: 24 }} />
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
                        onCellPress={() => setCellPopupVisible(true)}
                        invalidTrigger={invalidTrigger}
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
                    onClose={() => setCellPopupVisible(false)}
                />

                {/* Game Over Modal */}
                <GameOverModal
                    visible={gameOver}
                    won={won}
                    secretWord={secretWord}
                    guessCount={guesses.length}
                    maxAttempts={config.maxAttempts}
                    onPlayAgain={initializeGame}
                    onClose={onClose}
                    isRTL={config.isRTL}
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
