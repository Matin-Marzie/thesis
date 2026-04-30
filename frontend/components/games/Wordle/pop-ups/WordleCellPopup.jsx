import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { popupStyles } from '../../WordOfWonders/pop-ups/popupStyles';
import VocabularyListItem from '../../../vocabulary/VocabularyListItem';

export default function WordleCellPopup({ visible, onClose, word }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
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
                                <Text style={popupStyles.headerText}>MEANING</Text>
                                <TouchableOpacity
                                    style={popupStyles.closeButton}
                                    onPress={onClose}
                                >
                                    <FontAwesome5
                                        name="times"
                                        size={popupStyles.closeButton.size}
                                        style={popupStyles.closeButton}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View style={popupStyles.content}>
                                <Animated.FlatList
                                    style={{ flex: 1 }}
                                    data={word ? [word] : []}
                                    keyExtractor={(item, index) => `${item}-${index}`}
                                    renderItem={({ item }) => (
                                        <VocabularyListItem item={item} />
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No word selected.</Text>}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
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
    emptyText: {
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
});
