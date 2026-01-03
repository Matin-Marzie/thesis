import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    FlatList,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GREEN } from '../gameConstants';
import { useDictionary } from '@/hooks/useDictionary';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ExtraWordsPopup({ visible, onClose, extraWords = [], score = 0 }) {
    const { dictionary } = useDictionary();
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.popup}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.placeholder} />
                            <Text style={styles.headerText}>EXTRA WORDS</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <FontAwesome5 name="times" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={styles.scoreText}>Score: {score}</Text>

                            <FlatList
                                data={extraWords}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => {
                                    const entry = dictionary?.words?.find(w => w.written_form.toLowerCase() === item.toLowerCase()) || null;
                                    const translations = entry && entry.translations ? entry.translations.join(', ') : '';
                                    const display = entry && entry.written_form ? entry.written_form : (item || '').toUpperCase();
                                    return (
                                        <View style={styles.wordRow}>
                                            <Text style={styles.wordText}>{display}</Text>
                                            <Text style={styles.translationText}>{translations}</Text>
                                        </View>
                                    );
                                }}
                                style={styles.list}
                                ListEmptyComponent={<Text style={styles.emptyText}>No extra words yet.</Text>}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: SCREEN_WIDTH * 0.8,
        alignSelf: 'center',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    content: {
        padding: 20,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: GREEN,
        marginBottom: 12,
    },
    list: {
        maxHeight: 220,
    },
    wordRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordText: {
        fontSize: 16,
        color: '#333',
    },
    translationText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
});
