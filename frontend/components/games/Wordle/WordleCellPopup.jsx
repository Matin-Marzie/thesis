import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { popupStyles } from '../WordOfWonders/pop-ups/popupStyles';

export default function WordleCellPopup({ visible, onClose }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
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
                            <Text style={popupStyles.headerText}>CELL</Text>
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

                        {/* Empty content — to be filled later */}
                        <View style={popupStyles.content} />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
