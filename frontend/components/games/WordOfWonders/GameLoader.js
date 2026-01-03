import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useDictionary } from '@/hooks/useDictionary';
import GenerateWordOfWonderLevel from './LevelGenerator';
import WordOfWonders from './WordOfWonders';
import { BACKGROUND_IMAGE_URI, width, height, MAX_WIDTH } from './gameConstants';

export default function GameLoader() {
    const { dictionary } = useDictionary();
    const [levelData, setLevelData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);

    // Generate level when dictionary loads
    useEffect(() => {
        if (!dictionary?.words || dictionary.words.length === 0) return;

        setIsGenerating(true);

        // Generate level
        const [board, words, generatedLetters] = GenerateWordOfWonderLevel(dictionary.words);

        // Set the generated data
        setLevelData({
            boxData: board,
            gridWords: words,
            letters: generatedLetters
        });

        setIsGenerating(false);
    }, [dictionary]);

    // Show loading screen while generating
    if (isGenerating || !levelData) {
        return (
            <View style={styles.outerContainer}>
                <ImageBackground
                    source={{ uri: BACKGROUND_IMAGE_URI }}
                    style={styles.container}
                    resizeMode="cover"
                >
                    <Text style={{ color: '#fff', fontSize: 18 }}>Loading Level...</Text>
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
});
