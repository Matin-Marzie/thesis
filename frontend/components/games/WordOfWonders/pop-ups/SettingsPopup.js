import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
    Switch,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GREEN } from '../gameConstants';

const SCREEN_WIDTH = Dimensions.get('window').width;
export default function SettingsPopup({ visible, onClose }) {
    const [letterSoundEnabled, setLetterSoundEnabled] = React.useState(true);

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
                            <Text style={styles.headerText}>SETTINGS</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <FontAwesome5 name="times" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Letter Sound</Text>
                                <View style={styles.switchWrapper}>
                                    <View
                                        style={[
                                            styles.customTrack,
                                            { backgroundColor: letterSoundEnabled ? GREEN : '#ccc' },
                                        ]}
                                    />
                                    <Switch
                                        value={letterSoundEnabled}
                                        onValueChange={setLetterSoundEnabled}
                                        trackColor={{ false: 'transparent', true: 'transparent' }}
                                        thumbColor={'#fff'}
                                        ios_backgroundColor={'transparent'}
                                        style={styles.nativeSwitch}
                                    />
                                </View>
                            </View>
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
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    switchWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    customTrack: {
        position: 'absolute',
        width: 48,
        height: 30,
        borderRadius: 20,
    },
    nativeSwitch: {
        // keep native switch size (do not scale)
    },
});
