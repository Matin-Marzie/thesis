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
import { popupStyles } from './popupStyles';

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
                            <Text style={popupStyles.headerText}>SETTINGS</Text>
                            <TouchableOpacity
                                style={popupStyles.closeButton}
                                onPress={onClose}
                            >
                                <FontAwesome5 name="times" size={popupStyles.closeButton.size} style={popupStyles.closeButton} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={styles.sectionTitle}>Sounds</Text>
                            <View style={styles.section}>
                                <View style={styles.sectionRow}>
                                    <Text style={styles.settingLabel}>Letters</Text>
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

                                        />
                                    </View>
                                </View>
                                <View style={styles.sectionRow}>
                                    <Text style={styles.settingLabel}>Words</Text>
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

                                        />
                                    </View>
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
    content: {
        padding: 15,
    },
    section: {
        gap: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    settingLabel: {
    },
    switchWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 30,
    },
    customTrack: {
        position: 'absolute',
        width: 48,
        height: 30,
        borderRadius: 20,
    },
});
