import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useVibrationSettings } from '@/context/VibrationContext';
import { useReminderSettings } from '@/context/ReminderContext';
import { requestNotificationPermission } from '@/utils/notifications';
import { PRIMARY_COLOR } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';

const formatTime = (hour: number, minute: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default function SettingsScreen() {
  const { vibrationSettings, setVibrationSettings } = useVibrationSettings();
  const { reminderSettings, setReminderSettings } = useReminderSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggle = (key: string) => (value: boolean) => {
    setVibrationSettings((prev: typeof vibrationSettings) => ({ ...prev, [key]: value }));
  };

  const subSwitchesDisabled = !vibrationSettings.enabled;
  const subSwitchTrackColor = { false: '#ccc', true: subSwitchesDisabled ? '#ccc' : PRIMARY_COLOR };

  const handleReminderToggle = async (value: boolean) => {
    if (!value) {
      setReminderSettings((prev: typeof reminderSettings) => ({ ...prev, enabled: false }));
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Notifications disabled',
        'Enable notifications for this app in your device settings to receive practice reminders.'
      );
      return;
    }
    setReminderSettings((prev: typeof reminderSettings) => ({ ...prev, enabled: true }));
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;

    setReminderSettings((prev: typeof reminderSettings) => ({
      ...prev,
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
    }));
  };

  const timePickerValue = new Date();
  timePickerValue.setHours(reminderSettings.hour, reminderSettings.minute, 0, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Daily Practice Reminder</Text>
              <Text style={styles.rowDescription}>Get a notification to help you keep practicing</Text>
            </View>
            <Switch
              value={reminderSettings.enabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: '#ccc', true: PRIMARY_COLOR }}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            disabled={!reminderSettings.enabled}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, !reminderSettings.enabled && styles.rowLabelDisabled]}>Reminder Time</Text>
            </View>
            <Text style={[styles.rowValue, !reminderSettings.enabled && styles.rowLabelDisabled]}>
              {formatTime(reminderSettings.hour, reminderSettings.minute)}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timePickerValue}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {showTimePicker && Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowTimePicker(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Vibrations</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Vibrations</Text>
              <Text style={styles.rowDescription}>Master switch for all vibration feedback</Text>
            </View>
            <Switch
              value={vibrationSettings.enabled}
              onValueChange={toggle('enabled')}
              trackColor={{ false: '#ccc', true: PRIMARY_COLOR }}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, subSwitchesDisabled && styles.rowLabelDisabled]}>Button Vibrations</Text>
              <Text style={styles.rowDescription}>Feedback when tapping buttons and keys</Text>
            </View>
            <Switch
              value={vibrationSettings.buttons}
              onValueChange={toggle('buttons')}
              disabled={subSwitchesDisabled}
              trackColor={subSwitchTrackColor}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, subSwitchesDisabled && styles.rowLabelDisabled]}>Animation Vibrations</Text>
              <Text style={styles.rowDescription}>Feedback tied to in-app animations</Text>
            </View>
            <Switch
              value={vibrationSettings.animations}
              onValueChange={toggle('animations')}
              disabled={subSwitchesDisabled}
              trackColor={subSwitchTrackColor}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Game Vibrations</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, subSwitchesDisabled && styles.rowLabelDisabled]}>Word of Wonders</Text>
            </View>
            <Switch
              value={vibrationSettings.wordOfWonders}
              onValueChange={toggle('wordOfWonders')}
              disabled={subSwitchesDisabled}
              trackColor={subSwitchTrackColor}
              thumbColor={'#fff'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, subSwitchesDisabled && styles.rowLabelDisabled]}>Wordle</Text>
            </View>
            <Switch
              value={vibrationSettings.wordle}
              onValueChange={toggle('wordle')}
              disabled={subSwitchesDisabled}
              trackColor={subSwitchTrackColor}
              thumbColor={'#fff'}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
  },
  rowLabelDisabled: {
    color: '#aaa',
  },
  rowDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  rowValue: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  doneButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});
