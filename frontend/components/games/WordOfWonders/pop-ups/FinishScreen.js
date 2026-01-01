import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { GREEN } from '../gameConstants';

export default function FinishScreen({ visible = false, onHome }) {
    const router = useRouter();

    const handleHome = () => {
        if (onHome) {
            onHome();
            return;
        }
        router.push('/practice');
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={() => { }}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Well Done!</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={handleHome} accessibilityRole="button">
                        <View style={styles.actionInner}>
                            <FontAwesome5 name="home" size={18} color="#fff" />
                            <Text style={styles.actionText}>Home</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 40,
        borderRadius: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    actionButton: {
        width: '100%',
        backgroundColor: '#1E9FFC',
        borderRadius: 8,
        marginTop: 10,
    },
    actionInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 40,
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: GREEN || '#1E9FFC',
    },
    actionInnerSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    actionTextSecondary: {
        color: GREEN || '#1E9FFC',
        fontSize: 16,
        fontWeight: '600',
    },
});
