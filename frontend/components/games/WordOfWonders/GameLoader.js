import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Easing, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDictionaryContext } from '@/context/DictionaryContext';
import { useAppContext } from '@/context/AppContext';
import GenerateWordOfWonderLevel from './LevelGenerator';
import WordOfWonders from './WordOfWonders';
import { BACKGROUND_IMAGE_URI, width, MAX_WIDTH, height } from './gameConstants';

export default function GameLoader() {
    const { dictionary } = useDictionaryContext();
    const { userProgress } = useAppContext();
    const router = useRouter();
    const [levelData, setLevelData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const spinValue = useRef(new Animated.Value(0)).current;

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

    const generateLevel = (words) => {
        setIsGenerating(true);
        setTimeout(() => {
            const [board, gridWords, generatedLetters] = GenerateWordOfWonderLevel(words);
            setLevelData({
                boxData: board,
                gridWords: gridWords,
                letters: generatedLetters
            });
            setIsGenerating(false);
        }, 0);
    };

    // Generate level when dictionary loads
    useEffect(() => {
        if (!dictionary?.words || dictionary.words.length === 0) return;
        generateLevel(dictionary.words);
    }, [dictionary]);

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
                    <View style={styles.HeaderBar}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <FontAwesome5 name="arrow-left" size={20} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.coinsContainer}>
                            <FontAwesome5 name="coins" size={25} color="#FFD700" />
                            <Text style={styles.coinsText}>{userProgress.coins ?? 0}</Text>
                        </View>
                        <View style={styles.settingsButton}>
                            <FontAwesome5 name="cog" size={22} color="#333" />
                        </View>
                    </View>

                    <View style={{ alignItems: 'center', marginBottom: height * 0.20 }}>
                        <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 16 }}>
                            <FontAwesome5 name="spinner" size={40} color="#fff" />
                        </Animated.View>
                        <Text style={{ color: '#fff', fontSize: 18 }}>Generating Level...</Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    // Render WordOfWonders with generated data
    return (
        <WordOfWonders
            boxData={levelData.boxData}
            gridWords={levelData.gridWords}
            letters={levelData.letters}
            onPlayAgain={() => generateLevel(dictionary.words)}
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
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.02,
        zIndex: 10,
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
    settingsButton: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
});
