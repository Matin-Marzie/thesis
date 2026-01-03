import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Vibration,
    ImageBackground,
    PanResponder,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Grid from './Grid';
import LettersCycle from './LettersCycle';
import SettingsPopup from './pop-ups/SettingsPopup';
import ExtraWordsPopup from './pop-ups/ExtraWordsPopup';
import FinishScreen from './pop-ups/FinishScreen';
import { GREEN, MAX_WIDTH, width, height, horizontalOffset, BACKGROUND_IMAGE_URI, BACKGROUND_OVERLAY_OPACITY } from './gameConstants';
import { useAppContext } from '@/context/AppContext';
import { useDictionary } from '@/hooks/useDictionary';


const HAMMER_HEIGHT = height * 0.69;

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default function WordOfWonders({ boxData: initialBoxData, gridWords: initialGridWords, letters: initialLetters }) {

    const { userVocabulary, userProgress, setUserProgress } = useAppContext();
    const { dictionary } = useDictionary();

    const [boxData, setBoxData] = useState(initialBoxData);
    const [gridWords, setGridWords] = useState(initialGridWords);
    const [letters, setLetters] = useState(initialLetters);


    const columns = boxData[0].length;
    const rows = boxData.length;

    const router = useRouter();
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [filledBoxes, setFilledBoxes] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [extraWordsScore, setExtraWordsScore] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [shuffledLetters, setShuffledLetters] = useState(() => shuffleArray(letters));
    const [animatingWord, setAnimatingWord] = useState(null);
    const [shakeWord, setShakeWord] = useState(null);
    const [coins, setCoins] = useState(userProgress.coins || 0);
    const [hammerActive, setHammerActive] = useState(false);
    const [hammerPosition, setHammerPosition] = useState(null);
    const [extraWordsVisible, setExtraWordsVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Create or update boxAnimations when grid dimensions change
    const boxAnimations = useMemo(() =>
        Array(rows * columns)
            .fill(0)
            .map(() => new Animated.Value(0)),
        [rows, columns]
    );

    const boxAnimationsRef = useRef(boxAnimations);

    // Update ref when dimensions change
    useEffect(() => {
        boxAnimationsRef.current = boxAnimations;
    }, [boxAnimations]);

    // Create or update letterAnimations when letter count changes
    const letterAnimations = useMemo(() =>
        letters.map(() => new Animated.Value(0)),
        [letters.length]
    );

    const letterAnimationsRef = useRef(letterAnimations);

    // Update ref when letters change
    useEffect(() => {
        letterAnimationsRef.current = letterAnimations;
    }, [letterAnimations]);
    const wordAnimationPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const wordAnimationOpacity = useRef(new Animated.Value(1)).current;
    const wordAnimationScale = useRef(new Animated.Value(1)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const selectedWordShakeAnimation = useRef(new Animated.Value(0)).current;
    const scoreScaleAnimation = useRef(new Animated.Value(1)).current;
    const scoreBackgroundAnimation = useRef(new Animated.Value(0)).current;
    const hammerOpacity = useRef(new Animated.Value(1)).current;
    const hammerScale = useRef(new Animated.Value(1)).current;
    const hammerRotation = useRef(new Animated.Value(0)).current;

    // Reset game state when component mounts or boxData, gridWords, letters changes
    useEffect(() => {
        setGameFinished(false);
        setFoundWords([]);
        setFilledBoxes([]);
        setSelectedLetters([]);
        setAnimatingWord(null);
        setShakeWord(null);
        setExtraWordsScore(0);
        setShuffledLetters(shuffleArray(letters));

        // Reset box animations
        boxAnimations.forEach(anim => anim?.setValue(0));
        letterAnimations.forEach(anim => anim?.setValue(0));
    }, [boxData, gridWords, letters, boxAnimations, letterAnimations]);

    // Check if game is complete
    useEffect(() => {
        const foundGridWordsCount = Object.values(gridWords).filter((w) => w.isFound).length;
        const totalGridWords = Object.keys(gridWords).length;

        if (foundGridWordsCount === totalGridWords && !gameFinished) {
            setTimeout(() => {
                setGameFinished(true);
            }, 500);
        }
    }, [foundWords, filledBoxes]); // Also check when filledBoxes changes

    // Check if any words are completed after filledBoxes updates
    useEffect(() => {
        Object.keys(gridWords).forEach((word) => {
            if (gridWords[word].isFound) return; // Skip already found words

            const wordData = gridWords[word];
            const wordLetters = word.split('');

            // Check if all boxes for this word are filled
            const allFilled = wordLetters.every((letter, index) => {
                let boxIndex;
                if (wordData.direction === 'H') {
                    boxIndex = wordData.pos[0] * columns + wordData.pos[1] + index;
                } else {
                    boxIndex = (wordData.pos[0] + index) * columns + wordData.pos[1];
                }
                return filledBoxes.includes(boxIndex);
            });

            if (allFilled) {
                // Mark word as found
                gridWords[word].isFound = true;
                setFoundWords(prev => {
                    if (!prev.includes(word)) {
                        return [...prev, word];
                    }
                    return prev;
                });
            }
        });
    }, [filledBoxes]);


    const handleLetterPress = useCallback((index) => {
        if (gameFinished) return;

        setSelectedLetters((prev) => {
            // If moving back to the second-to-last letter, remove the last one
            if (prev.length >= 2 && prev[prev.length - 2] === index) {
                // Reset the last letter back to normal
                letterAnimations[prev[prev.length - 1]].setValue(0);
                return prev.slice(0, -1);
            }

            // Return early if index already exists (prevent duplicates)
            if (prev.includes(index)) return prev;

            // Vibrate when new letter is selected
            Vibration.vibrate(10);

            // Set letter to selected state (no animation)
            letterAnimations[index].setValue(1);

            return [...prev, index];
        });
    }, [gameFinished, letterAnimations]);

    const handleShuffle = useCallback(() => {
        if (gameFinished || selectedLetters.length > 0) return;

        // Fisher-Yates shuffle algorithm
        const shuffled = [...shuffledLetters];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledLetters(shuffled);

        Vibration.vibrate(20);
    }, [gameFinished, selectedLetters, shuffledLetters]);

    const handleHint = useCallback(() => {
        if (coins < 40 || gameFinished) return;

        // Find all unfound words
        const unfoundWords = Object.keys(gridWords).filter(word => !gridWords[word].isFound);

        if (unfoundWords.length === 0) return;

        // Pick a random unfound word
        const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
        const wordData = gridWords[randomWord];
        const wordLetters = randomWord.split('');

        // Find unfilled boxes for this word
        const unfilled = [];
        wordLetters.forEach((letter, index) => {
            let boxIndex;
            if (wordData.direction === 'H') {
                boxIndex = wordData.pos[0] * columns + wordData.pos[1] + index;
            } else {
                boxIndex = (wordData.pos[0] + index) * columns + wordData.pos[1];
            }
            if (!filledBoxes.includes(boxIndex)) {
                unfilled.push(boxIndex);
            }
        });

        // If all boxes are filled, skip (shouldn't happen)
        if (unfilled.length === 0) return;

        // Pick a random unfilled box
        const randomBoxIndex = unfilled[Math.floor(Math.random() * unfilled.length)];

        // Add to filled boxes and animate
        setFilledBoxes(prev => [...prev, randomBoxIndex]);
        Animated.timing(boxAnimations[randomBoxIndex], {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Decrease coins
        const newCoins = coins - 40;
        setCoins(newCoins);
        setUserProgress((prev) => ({ ...prev, coins: newCoins }));
        Vibration.vibrate(30);
    }, [coins, gameFinished, filledBoxes, boxAnimations]);    // Helper function to get grid box dimensions and position

    const getGridBoxInfo = useCallback(() => {
        const horizontalMargin = width * 0.02;
        const availableWidth = Math.min(width - (horizontalMargin * 2), 500); // MAX_GRID_WIDTH
        let boxSize = availableWidth / columns;
        boxSize = Math.min(boxSize, 50); // Cap box size to 50 for better visibility
        const gridWidth = columns * boxSize;
        const gridLeft = (width - gridWidth) / 2;
        const gridTop = height * 0.05;

        return { boxSize, gridLeft, gridTop };
    }, []);

    // Helper function to find which grid box was hit by hammer
    const findHitGridBox = useCallback((x, y) => {
        const { boxSize, gridLeft, gridTop } = getGridBoxInfo();

        // Check if position is within grid bounds
        const gridWidth = columns * boxSize;
        const gridHeight = rows * boxSize;

        if (x < gridLeft || x > gridLeft + gridWidth || y < gridTop || y > gridTop + gridHeight) {
            return null; // Outside grid
        }

        // Calculate which box was hit
        const col = Math.floor((x - gridLeft) / boxSize);
        const row = Math.floor((y - gridTop) / boxSize);

        if (col < 0 || col >= columns || row < 0 || row >= rows) {
            return null;
        }

        // Check if this box exists (not a 0 in boxData)
        if (boxData[row][col] === 0) {
            return null;
        }

        const boxIndex = row * columns + col;
        return boxIndex;
    }, [getGridBoxInfo]);

    // Hammer PanResponder
    const hammerActiveRef = useRef(false);
    const coinsRef = useRef(coins);
    const filledBoxesRef = useRef(filledBoxes);

    // Keep refs in sync
    useEffect(() => {
        coinsRef.current = coins;
    }, [coins]);

    useEffect(() => {
        filledBoxesRef.current = filledBoxes;
    }, [filledBoxes]);

    const hammerPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt) => {
                if (coinsRef.current < 80 || gameFinished) return false;                // Check if touch is on hammer button area
                const { pageX, pageY } = evt.nativeEvent;
                const buttonLeft = width * 0.02;
                const buttonTop = HAMMER_HEIGHT;
                const buttonWidth = 70; // approximate width
                const buttonHeight = 35; // approximate height

                const isTouchOnButton =
                    pageX >= buttonLeft - 10 &&
                    pageX <= buttonLeft + buttonWidth + 10 &&
                    pageY >= buttonTop - 10 &&
                    pageY <= buttonTop + buttonHeight + 10;

                if (isTouchOnButton) {
                    return true;
                }
                return false;
            },
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => hammerActiveRef.current,
            onMoveShouldSetPanResponderCapture: () => false,
            onPanResponderGrant: (evt) => {
                if (coinsRef.current >= 80 && !gameFinished) {
                    hammerActiveRef.current = true;
                    setHammerActive(true);
                    setHammerPosition({
                        x: evt.nativeEvent.pageX,
                        y: evt.nativeEvent.pageY,
                    });
                    // Reset animations
                    hammerOpacity.setValue(1);
                    hammerScale.setValue(1);
                    Vibration.vibrate(30);
                }
            },
            onPanResponderMove: (evt) => {
                if (hammerActiveRef.current) {
                    setHammerPosition({
                        x: evt.nativeEvent.pageX,
                        y: evt.nativeEvent.pageY,
                    });
                }
            },
            onPanResponderRelease: (evt) => {
                hammerActiveRef.current = false;

                // Check if hammer hit a grid box
                const { pageX, pageY } = evt.nativeEvent;
                // Adjust Y coordinate based on screen height to match where the hammer icon visually appears
                const adjustedY = pageY - (height * 0.07);
                const hitBoxIndex = findHitGridBox(pageX, adjustedY);

                // Only process if hit a valid box and it's not already filled
                if (hitBoxIndex !== null && !filledBoxesRef.current.includes(hitBoxIndex)) {
                    // Only deduct coins if we have enough
                    if (coinsRef.current >= 80) {
                        // Hit an unfilled box - reveal it
                        setFilledBoxes(prev => [...prev, hitBoxIndex]);

                        // Ensure animation value exists for this box
                        if (boxAnimationsRef.current[hitBoxIndex]) {
                            Animated.timing(boxAnimationsRef.current[hitBoxIndex], {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: false,
                            }).start();
                        }

                        // Decrease coins
                        const newCoins = coinsRef.current - 80;
                        setCoins(newCoins);
                        setUserProgress((prev) => ({ ...prev, coins: newCoins }));
                    }
                }                // Animate hammer: rotate 90 degrees and then disappear
                Animated.sequence([
                    Animated.timing(hammerRotation, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // After rotation, fade out
                    Animated.parallel([
                        Animated.timing(hammerOpacity, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(hammerScale, {
                            toValue: 0.5,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        setHammerActive(false);
                        setHammerPosition(null);
                        hammerRotation.setValue(0);
                    });
                });

                Vibration.vibrate(20);
            },
        })
    ).current;

    const handleGridWord = useCallback((word) => {
        const wordData = gridWords[word];
        const newFilledBoxes = [...filledBoxes];
        const wordLetters = word.split('');

        wordLetters.forEach((letter, index) => {
            let boxIndex;
            if (wordData.direction === 'H') {
                boxIndex = wordData.pos[0] * columns + wordData.pos[1] + index;
            } else {
                boxIndex = (wordData.pos[0] + index) * columns + wordData.pos[1];
            }

            if (!newFilledBoxes.includes(boxIndex)) {
                newFilledBoxes.push(boxIndex);

                // Animate box fill with staggered delay (letter by letter)
                const delay = index * 150; // 150ms delay between each letter
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(boxAnimations[boxIndex], {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                ]).start();
            }
        });

        setFilledBoxes(newFilledBoxes);

        // Mark the word as found
        gridWords[word].isFound = true;
    }, [filledBoxes, boxAnimations]);

    const handleFinishHome = useCallback(() => {
        router.back();
    }, [router]);

    const handleLetterRelease = useCallback(() => {
        if (selectedLetters.length === 0) return;
        if (selectedLetters.length < 3) {
            // Invalid word - shake the selected word
            Vibration.vibrate([0, 50, 50, 50]);

            // Don't clear selected letters immediately, let the shake finish
            setTimeout(() => {
                setSelectedLetters([]);
            }, 250);

            selectedWordShakeAnimation.setValue(0);
            Animated.sequence([
                Animated.timing(selectedWordShakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }

        const word = selectedLetters.map((i) => shuffledLetters[i]).join('').toLowerCase();
        const lettersToReset = [...selectedLetters]; // Capture before clearing

        // Always reset letters immediately (no animation)
        lettersToReset.forEach((index) => {
            letterAnimations[index].setValue(0);
        });

        // Check if word is a grid word
        if (gridWords[word]) {
            if (foundWords.includes(word)) {
                // Already found - shake animation
                Vibration.vibrate([0, 50, 50, 50]); // Vibrate pattern for shake
                setShakeWord(word);
                shakeAnimation.setValue(0);
                Animated.sequence([
                    Animated.timing(shakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]).start(() => {
                    setShakeWord(null);
                });

                setSelectedLetters([]);
            } else {
                // Grid word found
                handleGridWord(word);
                setFoundWords((prev) => [...prev, word]);
                setSelectedLetters([]);
            }
        } else if (dictionary?.words?.find(w => w.written_form.toLowerCase() === word)) {
            // Check if word is in dictionary (extra word)
            if (foundWords.includes(word)) {
                // Extra word already found - animate score board
                Vibration.vibrate(50);

                // Expand and shrink animation
                scoreScaleAnimation.setValue(1);

                Animated.sequence([
                    Animated.timing(scoreScaleAnimation, {
                        toValue: 1.2,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scoreScaleAnimation, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]).start();

                setSelectedLetters([]);
            } else {
                // Extra word found - animate to score
                setAnimatingWord(word);
                setFoundWords((prev) => [...prev, word]);

                // Start position (center of screen where selectedWordContainer is)
                const startX = width * 0.5;
                const startY = height * 0.62;
                // End position (Extra Words button location)
                // Extra Words button is at left: width * 0.02, top: height * 0.95, with padding: 5
                // The icon is ~20px, gap is 5px, and the number is centered in the remaining space
                const endX = width * 0.02 + 5 + 20 + 5 + 10; // left + padding + icon + gap + half number width
                const endY = height * 0.95 + 5 + 15; // top + padding + half button height

                wordAnimationPosition.setValue({ x: 0, y: 0 });
                wordAnimationOpacity.setValue(1);
                wordAnimationScale.setValue(1);

                // Animate word moving to score with shrinking
                Animated.parallel([
                    Animated.timing(wordAnimationPosition, {
                        toValue: { x: endX - startX, y: endY - startY },
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(wordAnimationOpacity, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(wordAnimationScale, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // After animation completes, update score and clear animating word
                    setExtraWordsScore((prev) => prev + 1);
                    setAnimatingWord(null);
                });

                setSelectedLetters([]);
            }
        } else {
            // Invalid word - shake the selected word
            Vibration.vibrate([0, 50, 50, 50]);

            // Don't clear selected letters immediately, let the shake finish
            setTimeout(() => {
                setSelectedLetters([]);
            }, 250);

            selectedWordShakeAnimation.setValue(0);
            Animated.sequence([
                Animated.timing(selectedWordShakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
                Animated.timing(selectedWordShakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();

        }
    }, [selectedLetters, letterAnimations, foundWords, handleGridWord, shuffledLetters, wordAnimationPosition, wordAnimationOpacity, wordAnimationScale]);


    const renderSelectedWord = () => {
        if (selectedLetters.length === 0 && !animatingWord) return null;

        const word = animatingWord || selectedLetters.map((i) => shuffledLetters[i]).join('');
        const displayWord = word.toUpperCase();

        // If animating, use animated view
        if (animatingWord) {
            return (
                <Animated.View
                    style={[
                        styles.selectedWordContainer,
                        {
                            transform: [
                                { translateX: wordAnimationPosition.x },
                                { translateY: wordAnimationPosition.y },
                                { scale: wordAnimationScale }
                            ],
                            opacity: wordAnimationOpacity,
                        }
                    ]}
                >
                    <Text style={styles.selectedLetterText}>{displayWord}</Text>
                </Animated.View>
            );
        }

        return (
            <View style={styles.selectedWordContainer}>
                <Animated.Text
                    style={[

                        styles.selectedLetterText,
                        {
                            transform: [{ translateX: selectedWordShakeAnimation }],
                        }
                    ]}
                >
                    {displayWord}
                </Animated.Text>
            </View>
        );
    };

    return (
        <View style={styles.outerContainer} {...hammerPanResponder.panHandlers}>
            <ImageBackground
                source={{ uri: BACKGROUND_IMAGE_URI }}
                style={styles.container}
                resizeMode="cover"
            >
                {/* Semi-transparent overlay filter */}
                <View style={styles.overlay} />

                {/* HEADER */}
                <View style={styles.HeaderBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <FontAwesome5 name="arrow-left" size={20} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.coinsContainer}>
                        <FontAwesome5 name="coins" size={25} color="#FFD700" />
                        <Text style={styles.coinsText}>{coins}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => setSettingsVisible(true)}
                    >
                        <FontAwesome5 name="cog" size={22} color="#333" />
                    </TouchableOpacity>
                </View>


                {/* Game Grid - Memoized, won't re-render on letter selection */}
                <Grid
                    boxData={boxData}
                    gridWords={gridWords}
                    foundWords={foundWords}
                    filledBoxes={filledBoxes}
                    boxAnimations={boxAnimations}
                    shakeWord={shakeWord}
                    shakeAnimation={shakeAnimation}
                />


                {/* LettersCycle with HAMMER, HINT and EXTRA WORDS */}
                <View style={styles.lettersCycleContainer}>

                    {/* Hammer Button */}
                <View
                    style={styles.hammerButton}
                >
                    <View
                        style={{
                            backgroundColor: coins >= 80 ? (hammerActive ? '#FFE5B4' : '#fff') : '#ccc',
                            borderColor: hammerActive ? '#FF6347' : '#ddd',
                            padding: 5,
                            borderRadius: 10,
                            borderWidth: hammerActive ? 3 : 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                        }}
                    >
                        <FontAwesome5 name="hammer" size={20} color={coins >= 80 ? "#FF6347" : "#888"} />
                        <Text style={[styles.scoreText, { color: coins >= 80 ? '#000' : '#888' }]}>
                            80
                        </Text>
                    </View>
                </View>

                    {/* Floating Hammer Pointer */}
                    {hammerActive && hammerPosition && (
                        <Animated.View
                            style={[
                                styles.floatingHammer,
                                {
                                    left: hammerPosition.x - 20,
                                    top: hammerPosition.y - 20,
                                    opacity: hammerOpacity,
                                    transform: [
                                        { scale: hammerScale },
                                        {
                                            rotate: hammerRotation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '70deg'],
                                            })
                                        }
                                    ],
                                },
                            ]}
                        >
                            <FontAwesome5 name="hammer" size={30} color="#FF6347" />
                        </Animated.View>
                    )}

                    {/* Hint Button */}
                    <TouchableOpacity
                        style={styles.hintButton}
                        onPress={handleHint}
                        disabled={coins < 40 || gameFinished}
                        activeOpacity={0.7}
                    >
                        <View
                            style={{
                                backgroundColor: coins >= 40 ? '#fff' : '#ccc',
                                borderColor: '#ddd',
                                padding: 5,
                                borderRadius: 10,
                                borderWidth: 2,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                            }}
                        >
                            <FontAwesome5 name="lightbulb" size={18} color={coins >= 40 ? "#FFD700" : "#888"} />
                            <Text style={[styles.scoreText, { color: coins >= 40 ? '#000' : '#888' }]}>
                                40
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Extra Words Button */}
                    <TouchableOpacity
                        style={styles.ExtraWordsButton}
                        onPress={() => setExtraWordsVisible(true)}
                        activeOpacity={0.30}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Open extra words"
                    >
                        <Animated.View
                            style={[
                                {
                                    transform: [{ scale: scoreScaleAnimation }],
                                }
                            ]}
                        >
                            <View
                                style={{
                                    backgroundColor: '#fff',
                                    borderColor: '#ddd',
                                    padding: 5,
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5,
                                }}
                            >
                                <FontAwesome5 name="book-medical" size={20} color="#000" />
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                }}>
                                    {extraWordsScore < 10 ? ` ${extraWordsScore}` : extraWordsScore}
                                </Text>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Selected Word Display */}
                    {renderSelectedWord()}

                    {/* Letter Circle - Memoized, handles its own gestures */}
                    <LettersCycle
                        selectedLetters={selectedLetters}
                        onLetterPress={handleLetterPress}
                        onLetterRelease={handleLetterRelease}
                        letterAnimations={letterAnimations}
                        onShuffle={handleShuffle}
                        shuffledLetters={shuffledLetters}
                    />
                </View>


                {/* Extra Words Popup */}
                <ExtraWordsPopup
                        visible={extraWordsVisible}
                        onClose={() => setExtraWordsVisible(false)}
                        extraWords={foundWords.filter(w => dictionary?.words?.some(dw => dw.written_form.toLowerCase() === w) && !gridWords[w])}
                        score={extraWordsScore}
                />

                {/* Finish Screen (moved to component) */}
                <FinishScreen
                    visible={gameFinished}
                    onHome={handleFinishHome}
                />

                {/* Settings Popup */}
                <SettingsPopup
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                />
            </ImageBackground>
        </View>
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
        display: 'flex',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: `rgba(0, 0, 0, ${BACKGROUND_OVERLAY_OPACITY})`,
        zIndex: 0,
    },
    HeaderBar: {
        position: 'absolute',
        top: height * 0.05,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.02,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButton: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
    coinsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    lettersCycleContainer: {
    },
    settingsButton: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
    hammerButton: {
        position: 'absolute',
        top: HAMMER_HEIGHT,
        left: width * 0.02,
        zIndex: 10,
    },
    floatingHammer: {
        position: 'absolute',
        zIndex: 999,
        pointerEvents: 'none',
    },
    hintButton: {
        position: 'absolute',
        top: height * 0.69,
        right: width * 0.02,
        zIndex: 10,
    },
    ExtraWordsButton: {
        position: 'absolute',
        top: height * 0.95,
        left: width * 0.02,
        zIndex: 10,
    },
    selectedWordContainer: {
        position: 'absolute',
        top: height * 0.62,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    selectedLetterText: {
        backgroundColor: GREEN,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    finishOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    finishText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
    },
    continueButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E9FFC',
    },
});
