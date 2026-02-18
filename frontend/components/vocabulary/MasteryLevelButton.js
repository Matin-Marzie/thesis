import React, { useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MASTERY_LEVELS } from '@/constants/Vocabulary';

export default function MasteryLevelButton({ masteryLevel, onPress }) {


    // Add word to vocabulary
        // const handleChangeMasteryLevel

    
    return (
        <TouchableOpacity style={styles.masterLevelChangeButton} onPress={onPress}>
            <Text style={styles.masterLevelChangeButtonText}>
                {MASTERY_LEVELS[masteryLevel]}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    masterLevelChangeButton: {
        width: 68,
        height: 38,
        borderRadius: 16,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    masterLevelChangeButtonText: {
        color: '#fff',
        fontSize: 10,
    },
});
