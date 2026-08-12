import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useVibrationSettings } from '@/context/VibrationContext';
import { PRIMARY_COLOR, DARK_COLORS } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';

export default function VibrationsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { vibrationSettings, setVibrationSettings } = useVibrationSettings();

  const toggle = (key: string) => (value: boolean) => {
    setVibrationSettings((prev: typeof vibrationSettings) => ({ ...prev, [key]: value }));
  };

  const subSwitchesDisabled = !vibrationSettings.enabled;
  const trackColorOff = isDark ? '#555' : '#ccc';
  const trackColor = { false: trackColorOff, true: PRIMARY_COLOR };
  const subSwitchTrackColor = { false: trackColorOff, true: subSwitchesDisabled ? trackColorOff : PRIMARY_COLOR };

  const sectionStyle = [styles.section, isDark && { backgroundColor: DARK_COLORS.surface }];
  const sectionTitleStyle = [styles.sectionTitle, isDark && { color: DARK_COLORS.textSecondary }];
  const rowLabelStyle = [styles.rowLabel, isDark && { color: DARK_COLORS.text }];
  const rowLabelDisabledStyle = isDark ? { color: DARK_COLORS.textMuted } : styles.rowLabelDisabled;
  const rowDescriptionStyle = [styles.rowDescription, isDark && { color: DARK_COLORS.textSecondary }];
  const dividerStyle = [styles.divider, isDark && { backgroundColor: DARK_COLORS.border }];

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        <Text style={sectionTitleStyle}>Vibrations</Text>
        <View style={sectionStyle}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={rowLabelStyle}>Vibrations</Text>
              <Text style={rowDescriptionStyle}>Master switch for all vibration feedback</Text>
            </View>
            <Switch
              value={vibrationSettings.enabled}
              onValueChange={toggle('enabled')}
              trackColor={trackColor}
              thumbColor={'#fff'}
              style={{ paddingVertical: 4 }}
            />
          </View>

          <View style={dividerStyle} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[rowLabelStyle, subSwitchesDisabled && rowLabelDisabledStyle]}>Button Vibrations</Text>
              <Text style={rowDescriptionStyle}>Feedback when tapping buttons and keys</Text>
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
              <Text style={[rowLabelStyle, subSwitchesDisabled && rowLabelDisabledStyle]}>Animation Vibrations</Text>
              <Text style={rowDescriptionStyle}>Feedback tied to in-app animations</Text>
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

        <Text style={sectionTitleStyle}>Game Vibrations</Text>
        <View style={sectionStyle}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[rowLabelStyle, subSwitchesDisabled && rowLabelDisabledStyle]}>Word of Wonders</Text>
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
              <Text style={[rowLabelStyle, subSwitchesDisabled && rowLabelDisabledStyle]}>Wordle</Text>
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
});
