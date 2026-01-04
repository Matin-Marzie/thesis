import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { popupStyles } from './popupStyles';
import { useDictionary } from '@/hooks/useDictionary';
import WordItem from '../../../vocabulary/WordItem';

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
                            <Animated.FlatList
                                style={{flex: 1}}
                                data={foundWords}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => (
                                    <WordItem
                                        item={item}
                                    />
                                )}
                                ListEmptyComponent={<Text style={styles.emptyText}>No words found.</Text>}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
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
