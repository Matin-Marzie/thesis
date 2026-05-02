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
import { formatCompactNumber } from '@/utils/formatCompactNumber';

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

    // Only Persian (fa) needs normalization (diacritics/variants). Other languages compare as-is.
    const normalizeKey = useCallback((word) => {
        const raw = (word ?? '').trim();
        if (!raw) return '';
        return langCode === 'fa' ? config.normalize(raw) : raw;
    }, [langCode, config]);

    // Hash: normalized written_form -> [wordItem, wordItem, ...]
    // Includes only words with length == config.wordLength (length is computed AFTER normalization).
    const wordleDictionary = useMemo(() => {
        const map = Object.create(null);
        const words = dictionary?.words;
        if (!Array.isArray(words) || words.length === 0) return map;

        for (const item of words) {
            const key = normalizeKey(item?.written_form);
            if (!key) continue;
            if (!config.letterRegex.test(key)) continue;
            if ([...key].length !== config.wordLength) continue;

            if (!map[key]) map[key] = [];
            map[key].push(item);
        }

        return map;
    }, [dictionary, normalizeKey, config]);

    const [secretWordItem, setSecretWordItem] = useState(null);
    const [wordLength, setWordLength] = useState(config.wordLength);
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cellPopupVisible, setCellPopupVisible] = useState(false);
    const [selectedWordItems, setSelectedWordItems] = useState([]);
    const [invalidTrigger, setInvalidTrigger] = useState(0);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [coins, setCoins] = useState(userProgress?.coins || 0);
    const [coinTarget, setCoinTarget] = useState(null);
    const coinsViewRef = useRef(null);

    useEffect(() => {
        initializeGame();
    }, [wordleDictionary, config.wordLength]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (confirmVisible) return false;
            setConfirmVisible(true);
            return true;
        });
        return () => subscription.remove();
    }, [confirmVisible]);

    const initializeGame = useCallback(() => {
        const keys = Object.keys(wordleDictionary);
        if (keys.length === 0) {
            setLoading(false);
            return;
        }

        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const candidates = wordleDictionary[randomKey] ?? [];
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)] ?? null;

        if (!randomItem) {
            setLoading(false);
            Alert.alert('Error', 'No valid words found for Wordle');
            return;
        }

        setSecretWordItem(randomItem);
        setWordLength(config.wordLength);
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setWon(false);
        setLoading(false);
    }, [wordleDictionary, config.wordLength]);

    // Guesses are stored as hash keys (FA-normalized; others as-is). Use spread to index Unicode chars.
    const secretWord = secretWordItem ? normalizeKey(secretWordItem.written_form) : '';

    const getLetterColor = useCallback((_letter, index, guess) => {
        const guessChars = [...guess];
        const secretChars = [...secretWord];
        if (guessChars[index] === secretChars[index]) return COLORS.correct;
        if (secretChars.includes(guessChars[index])) return COLORS.present;
        return COLORS.absent;
    }, [secretWord]);

    const handleCollect = useCallback((reward = 1) => {
        const add = Number(reward) || 0;
        if (add > 0) {
            setCoins(prev => prev + add);
            setUserProgress(prev => ({ ...prev, coins: (prev.coins || 0) + add }));
        }
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
            const normalizedGuess = normalizeKey(currentGuess);

            if ([...normalizedGuess].length !== wordLength) {
                Alert.alert('Invalid', `Word must be ${wordLength} letters`);
                return;
            }

            const matches = wordleDictionary[normalizedGuess];
            const wordExists = Array.isArray(matches) && matches.length > 0;

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
    }, [currentGuess, gameOver, won, guesses, secretWord, wordleDictionary, normalizeKey, config.maxAttempts, wordLength]);

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
                    <TouchableOpacity
                        onPress={() => setConfirmVisible(true)}
                        style={styles.backButton}
                    >
                        <FontAwesome5 name="chevron-left" size={22} color="#333" />
                    </TouchableOpacity>

                    <View pointerEvents="none" style={styles.headerTitleWrap}>
                        <Text style={styles.headerTitle}>WORDLE</Text>
                    </View>

                    <View
                        ref={coinsViewRef}
                        style={styles.coinsContainer}
                        onLayout={() => {
                            coinsViewRef.current?.measureInWindow((x, y, w, h) => {
                                setCoinTarget({ x: x + w / 2, y: y + h / 2 });
                            });
                        }}
                    >
                        <FontAwesome5 name="coins" size={18} color="#FFD700" />
                        <Text style={styles.coinsText}>{formatCompactNumber(coins)}</Text>
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
                            const normalizedGuess = guesses[rowIndex];
                            if (!normalizedGuess) return;
                            const candidates = wordleDictionary[normalizedGuess];
                            setSelectedWordItems(Array.isArray(candidates) ? candidates : []);
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
                    onClose={() => { setCellPopupVisible(false); setSelectedWordItems([]); }}
                    words={selectedWordItems}
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
                    secretWordItem={secretWordItem}
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
        paddingTop: 35,
        paddingBottom: 50,
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: PRIMARY_COLOR,
    },
    headerTitleWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 999,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
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
