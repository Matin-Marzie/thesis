import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    Switch,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GREEN } from '../gameConstants';
import { popupStyles } from './popupStyles';
import { useAppContext } from '@/context/AppContext';
import TouchableOpacity from '@/components/TouchableOpacity';

const SCREEN_WIDTH = Dimensions.get('window').width;
export default function SettingsPopup({ visible, onClose }) {
    const [letterSoundEnabled, setLetterSoundEnabled] = React.useState(true);
    const { vibrationSettings, setVibrationSettings } = useAppContext();

    const setWordOfWondersVibration = (value) => {
        setVibrationSettings((prev) => ({ ...prev, wordOfWonders: value }));
    };

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
                game="wordOfWonders"
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
                                game="wordOfWonders"
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
                                    <Switch
                                        value={letterSoundEnabled}
                                        onValueChange={setLetterSoundEnabled}
                                        trackColor={{ false: '#ccc', true: GREEN }}
                                        thumbColor={'#fff'}
                                    />
                                </View>
                                <View style={styles.sectionRow}>
                                    <Text style={styles.settingLabel}>Words</Text>
                                    <Switch
                                        value={letterSoundEnabled}
                                        onValueChange={setLetterSoundEnabled}
                                        trackColor={{ false: '#ccc', true: GREEN }}
                                        thumbColor={'#fff'}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Vibration</Text>
                            <View style={styles.section}>
                                <View style={styles.sectionRow}>
                                    <Text style={[styles.settingLabel, !vibrationSettings.enabled && styles.settingLabelDisabled]}>Vibration</Text>
                                    <Switch
                                        value={vibrationSettings.wordOfWonders}
                                        onValueChange={setWordOfWondersVibration}
                                        disabled={!vibrationSettings.enabled}
                                        trackColor={{ false: '#ccc', true: vibrationSettings.enabled ? GREEN : '#ccc' }}
                                        thumbColor={'#fff'}
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
    sectionTitleSpaced: {
        marginTop: 15,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    settingLabel: {
    },
    settingLabelDisabled: {
        color: '#aaa',
    },
});
