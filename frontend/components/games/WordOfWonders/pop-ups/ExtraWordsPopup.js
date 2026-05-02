import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView, FlatList } from 'react-native-gesture-handler';
import { GREEN } from '../gameConstants';
import { popupStyles } from './popupStyles';
import VocabularyListItem from '../../../vocabulary/VocabularyListItem';

export default function ExtraWordsPopup({ visible, onClose, extraWords = [], dictionarySet = {}, score = 0 }) {
    const extraWordItems = useMemo(() => {
        if (!extraWords.length) return [];
        return extraWords.flatMap((word) => dictionarySet[word] ?? []);
    }, [extraWords, dictionarySet]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
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
                                <Text style={popupStyles.headerText}>EXTRA WORDS</Text>
                                <TouchableOpacity
                                    style={popupStyles.closeButton}
                                    onPress={onClose}
                                >
                                    <FontAwesome5 name="times" size={popupStyles.closeButton.size} style={popupStyles.closeButton} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View style={popupStyles.content}>
                                <Text style={styles.scoreText}>
                                    You found {score} {score === 1 ? 'word' : 'words'} outside the grid!
                                </Text>
                                <FlatList
                                    style={{ flex: 1 }}
                                    data={extraWordItems}
                                    keyExtractor={(item, index) => String(item?.id ?? item?.written_form ?? index)}
                                    renderItem={({ item }) => (
                                        <VocabularyListItem item={item} />
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No extra words yet.</Text>}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: GREEN,
        padding: 5,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
});
