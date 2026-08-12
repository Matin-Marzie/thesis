import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useReminderSettings } from '@/context/ReminderContext';
import { requestNotificationPermission } from '@/utils/notifications';
import { PRIMARY_COLOR, DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import { useColorScheme } from '@/components/useColorScheme';

const formatTime = (hour: number, minute: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default function NotificationsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { reminderSettings, setReminderSettings } = useReminderSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const trackColorOff = isDark ? '#555' : '#ccc';
  const trackColor = { false: trackColorOff, true: PRIMARY_COLOR };

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

  const sectionStyle = [styles.section, isDark && { backgroundColor: DARK_COLORS.surface }];
  const sectionTitleStyle = [styles.sectionTitle, isDark && { color: DARK_COLORS.textSecondary }];
  const rowLabelStyle = [styles.rowLabel, isDark && { color: DARK_COLORS.text }];
  const rowLabelDisabledStyle = isDark ? { color: DARK_COLORS.textMuted } : styles.rowLabelDisabled;
  const rowDescriptionStyle = [styles.rowDescription, isDark && { color: DARK_COLORS.textSecondary }];
  const dividerStyle = [styles.divider, isDark && { backgroundColor: DARK_COLORS.border }];

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        <Text style={sectionTitleStyle}>Reminders</Text>
        <View style={sectionStyle}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={rowLabelStyle}>Daily Practice Reminder</Text>
              <Text style={rowDescriptionStyle}>Get a notification to help you keep practicing</Text>
            </View>
            <Switch
              value={reminderSettings.enabled}
              onValueChange={handleReminderToggle}
              trackColor={trackColor}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>

          <View style={dividerStyle} />

          <TouchableOpacity
            style={styles.row}
            disabled={!reminderSettings.enabled}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.rowText}>
              <Text style={[rowLabelStyle, !reminderSettings.enabled && rowLabelDisabledStyle]}>Reminder Time</Text>
            </View>
            <Text style={[styles.rowValue, !reminderSettings.enabled && rowLabelDisabledStyle]}>
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
