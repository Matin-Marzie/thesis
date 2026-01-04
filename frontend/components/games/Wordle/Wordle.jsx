import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useDictionary } from '@/hooks/useDictionary';
import Keyboard from './Keyboard';
import WordleGrid from './WordleGrid';
import GameOverModal from './GameOverModal';
import { PRIMARY_COLOR } from '@/constants/App';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const COLORS = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#d3d6da',
    border: '#ccc',
};

export default function Wordle({ onClose }) {
    const { userVocabulary, userProgress } = useAppContext();
    const { dictionary } = useDictionary();

    const [secretWord, setSecretWord] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [loading, setLoading] = useState(true);
    const [keyboardLetters, setKeyboardLetters] = useState({});

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, [dictionary]);

    const initializeGame = useCallback(() => {
        if (!dictionary?.words || dictionary.words.length === 0) {
            setLoading(false);
            return;
        }

        // Filter words of length 5
        const validWords = dictionary.words
            .filter(word => word.written_form.length === WORD_LENGTH && /^[A-Za-z]+$/.test(word.written_form))
            .map(word => word.written_form.toUpperCase());

        if (validWords.length === 0) {
            setLoading(false);
            Alert.alert('Error', 'No valid words found for Wordle');
            return;
        }

        // Pick random word
        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        setSecretWord(randomWord);
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setWon(false);
        setKeyboardLetters({});
        setLoading(false);
    }, [dictionary]);

    const getLetterColor = (letter, index, guess) => {
        if (guess.toUpperCase()[index] === secretWord[index]) {
            return COLORS.correct;
        }
        if (secretWord.includes(guess.toUpperCase()[index])) {
            return COLORS.present;
        }
        return COLORS.absent;
    };

    const handleKeyPress = useCallback((letter) => {
        if (gameOver || won) return;

        if (letter === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
            return;
        }

        if (letter === 'ENTER') {
            if (currentGuess.length !== WORD_LENGTH) {
                Alert.alert('Invalid', `Word must be ${WORD_LENGTH} letters`);
                return;
            }

            // Check if word exists in dictionary
            const wordExists = dictionary.words.some(
                w => w.written_form.toUpperCase() === currentGuess.toUpperCase()
            );

            if (!wordExists) {
                Alert.alert('Invalid', 'Word not in dictionary');
                return;
            }

            const newGuesses = [...guesses, currentGuess.toUpperCase()];
            setGuesses(newGuesses);

            // Check win condition
            if (currentGuess.toUpperCase() === secretWord) {
                setWon(true);
                setGameOver(true);
                return;
            }

            // Check game over
            if (newGuesses.length >= MAX_ATTEMPTS) {
                setGameOver(true);
                return;
            }

            setCurrentGuess('');
            return;
        }

        if (currentGuess.length < WORD_LENGTH) {
            setCurrentGuess(prev => prev + letter);
        }
    }, [currentGuess, gameOver, won, guesses, secretWord, dictionary]);

    const handlePlayAgain = () => {
        initializeGame();
    };

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
                    {/* Word Grid */}
                    <WordleGrid
                        guesses={guesses}
                        currentGuess={currentGuess}
                        maxAttempts={MAX_ATTEMPTS}
                        wordLength={WORD_LENGTH}
                        secretWord={secretWord}
                        getLetterColor={getLetterColor}
                    />

                    {/* Stats */}
                    {gameOver && (
                        <View style={styles.stats}>
                            <Text style={styles.statsText}>
                                Attempts: {guesses.length}/{MAX_ATTEMPTS}
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
                />

                {/* Game Over Modal */}
                <GameOverModal
                    visible={gameOver}
                    won={won}
                    secretWord={secretWord}
                    guessCount={guesses.length}
                    maxAttempts={MAX_ATTEMPTS}
                    onPlayAgain={handlePlayAgain}
                    onClose={onClose}
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
        backgroundColor: PRIMARY_COLOR
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
