import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GREEN } from '../gameConstants';
import { useDictionary } from '@/hooks/useDictionary';
import { popupStyles } from './popupStyles';
import WordItem from '../../../vocabulary/WordItem';
import { ScrollView } from 'react-native-gesture-handler';

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
                            <Text style={styles.scoreText}>Score: {score}</Text>
                                <Animated.FlatList
                                    style={{flex: 1}}
                                    data={extraWords}
                                    keyExtractor={(item, index) => `${item}-${index}`}
                                    renderItem={({ item }) => (
                                        <WordItem
                                            item={item}
                                            dictionary={dictionary}
                                        />
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No extra words yet.</Text>}
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
    scoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: GREEN,
        marginBottom: 12,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
});
