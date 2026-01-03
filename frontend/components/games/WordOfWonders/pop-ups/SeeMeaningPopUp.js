import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { popupStyles } from './popupStyles';
import { useDictionary } from '@/hooks/useDictionary';

export default function SeeMeaningPopUp({ visible, onClose, foundWords = [] }) {
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
                style={popupStyles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={popupStyles.popup}>
                        {/* Header */}
                        <View style={popupStyles.popupHeader}>
                            <View style={popupStyles.placeholder} />
                            <Text style={popupStyles.headerText}>MEANINGS</Text>
                            <TouchableOpacity
                                style={popupStyles.closeButton}
                                onPress={onClose}
                            >
                                <FontAwesome5 name="times" size={popupStyles.closeButton.size} style={popupStyles.closeButton} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={popupStyles.content}>
                            <FlatList
                                data={foundWords}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => {
                                    const entry = dictionary?.words?.find(
                                        (w) => w.written_form.toLowerCase() === item.toLowerCase()
                                    ) || null;
                                    const translations =
                                        entry && entry.translations ? entry.translations.join(', ') : '';
                                    const display =
                                        entry && entry.written_form ? entry.written_form : (item || '').toUpperCase();
                                    return (
                                        <View style={styles.wordRow}>
                                            <Text style={styles.wordText}>{display}</Text>
                                            <Text style={styles.translationText}>{translations}</Text>
                                        </View>
                                    );
                                }}
                                style={styles.list}
                                ListEmptyComponent={<Text style={styles.emptyText}>No words found.</Text>}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    list: {
        maxHeight: 300,
    },
    wordRow: {
        marginVertical: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    wordText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    translationText: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginVertical: 20,
    },
});
