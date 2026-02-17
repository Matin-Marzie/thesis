import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import VocabularyListItem from '@/components/vocabulary/VocabularyListItem.js';

const COLORS = {
    correct: '#6aaa64',
};

export default function GameOverModal({
    visible,
    won,
    secretWord,
    guessCount,
    maxAttempts,
    onPlayAgain,
    onClose,
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            hardwareAccelerated={false}
        >
            <View style={styles.container}>
                <View style={styles.overlay} />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        {won ? (
                            <Ionicons name="checkmark-circle" size={60} color={COLORS.correct} />
                        ) : (
                            <Ionicons name="close-circle" size={60} color="#c9b458" />
                        )}
                    </View>

                    <Text style={styles.title}>
                        {won ? '🎉 You Won!' : '😔 Game Over'}
                    </Text>

                    {won ? (
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsLabel}>Guesses used:</Text>
                            <Text style={styles.statsValue}>
                                {guessCount} / {maxAttempts}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsLabel}>The word was:</Text>
                            <Text style={styles.secretWord}>{secretWord}</Text>
                        </View>
                    )}

                    <View style={{ width: '100%', marginBottom: 20 }} >
                        <VocabularyListItem item={secretWord} />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.playAgainButton]}
                            onPress={onPlayAgain}
                        >
                            <Ionicons name="play" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Play Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.backButton]}
                            onPress={onClose}
                        >
                            <Ionicons name="arrow-back" size={20} color="#333" />
                            <Text style={[styles.buttonText, { color: '#333' }]}>Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    statsLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.correct,
    },
    secretWord: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 2,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    playAgainButton: {
        backgroundColor: PRIMARY_COLOR,
    },
    backButton: {
        backgroundColor: '#e0e0e0',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
