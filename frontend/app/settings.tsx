import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { PRIMARY_COLOR } from '@/constants/App';

export default function SettingsScreen() {
  const { vibrationSettings, setVibrationSettings } = useAppContext();

  const toggle = (key: string) => (value: boolean) => {
    setVibrationSettings((prev: typeof vibrationSettings) => ({ ...prev, [key]: value }));
  };

  const subSwitchesDisabled = !vibrationSettings.enabled;
  const subSwitchTrackColor = { false: '#ccc', true: subSwitchesDisabled ? '#ccc' : PRIMARY_COLOR };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
});
