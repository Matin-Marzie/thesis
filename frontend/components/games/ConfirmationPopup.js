import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { PRIMARY_COLOR } from '@/constants/App';
import { popupStyles } from './WordOfWonders/pop-ups/popupStyles';
import { height } from './WordOfWonders/gameConstants';

export default function ConfirmationPopup({ visible, onConfirm, onCancel, title = 'Confirm', message = 'Are you sure?' }) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <TouchableOpacity
                style={popupStyles.overlay}
                activeOpacity={1}
                onPress={onCancel}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[popupStyles.popup, styles.popup]}>
                        {/* Header */}
                        <View style={popupStyles.popupHeader}>
                            <View style={popupStyles.placeholder} />
                            <Text style={popupStyles.headerText}>{title}</Text>
                            <View style={popupStyles.placeholder} />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={styles.message}>{message}</Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={[styles.buttonText, styles.cancelText]}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={onConfirm}
                            >
                                <Text style={[styles.buttonText, styles.confirmText]}>YES</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    popup: {
        height: height * 0.3
    },
    content: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: PRIMARY_COLOR,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cancelText: {
        color: '#333',
    },
    confirmText: {
        color: '#fff',
    },
});
