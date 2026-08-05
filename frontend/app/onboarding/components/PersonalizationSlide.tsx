import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PRIMARY_COLOR } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import { useVibration } from '@/hooks/useVibration';
import TouchableOpacity from '@/components/TouchableOpacity';

interface PersonalizationSlideProps {
  onNext: () => void;
  selectedPreferences: string[];
  setSelectedPreferences: (val: string[]) => void;
  selectedAge: string;
  setSelectedAge: (val: string) => void;
}

export default function PersonalizationSlide({
  onNext,
  selectedPreferences,
  setSelectedPreferences,
  selectedAge,
  setSelectedAge,
}: PersonalizationSlideProps) {
  const isDark = useColorScheme() === 'dark';
  const vibrate = useVibration();

  const preferences = [
    'Movies', 'Sports', 'Anime', 'Make up', 'Cartoons', 'Video games', 'News', 'Politics'
  ];

  const ageData = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

  const handleAgeChange = (age: string) => {
    setSelectedAge(age);
    vibrate(10, { type: 'button' });
  };

  const togglePreference = (pref: string) => {
    setSelectedPreferences(
      selectedPreferences.includes(pref)
        ? selectedPreferences.filter((p) => p !== pref)
        : [...selectedPreferences, pref]
    );
  };

  const canContinue = selectedPreferences.length > 0;

  return (
    <View style={styles.slideContainer}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={[styles.title, isDark && { color: '#fff' }]}>Personalization</Text>

        {/* Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Preferences</Text>
          <Text style={[styles.sectionSubtitle, isDark && { color: '#aaa' }]}>Select topics you're interested in</Text>
          <View style={styles.preferencesGrid}>
            {preferences.map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.preferenceChip,
                  isDark && { backgroundColor: '#1c1c1c', borderColor: '#333' },
                  selectedPreferences.includes(pref) && styles.preferenceChipSelected,
                ]}
                onPress={() => togglePreference(pref)}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    isDark && { color: '#eee' },
                    selectedPreferences.includes(pref) && styles.preferenceTextSelected,
                  ]}
                >
                  {pref}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Picker */}
        <View style={styles.ageSection}>
          <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Age</Text>
          <Text style={[styles.sectionSubtitle, isDark && { color: '#aaa' }]}>Your age won't be shown publicly.</Text>
          <View style={[styles.pickerContainer, isDark && { backgroundColor: '#1c1c1c', borderColor: '#333' }]}>
            <Picker
              selectedValue={selectedAge}
              onValueChange={handleAgeChange}
              style={[styles.picker, isDark && { color: '#fff' }]}
              itemStyle={[styles.pickerItem, isDark && { color: '#fff' }]}
              dropdownIconColor={isDark ? '#fff' : '#333'}
              mode="dropdown"
            >
              {ageData.map((age) => (
                <Picker.Item
                  key={age}
                  label={age}
                  value={age}
                  color={Platform.OS === 'android' ? (isDark ? '#fff' : '#333') : undefined}
                  style={
                    Platform.OS === 'android'
                      ? { backgroundColor: isDark ? '#1c1c1c' : '#fff' }
                      : undefined
                  }
                />
              ))}
            </Picker>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !canContinue && (isDark ? { backgroundColor: '#444' } : styles.continueButtonDisabled),
        ]}
        onPress={onNext}
        disabled={!canContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: { flex: 1, paddingHorizontal: 20, paddingBottom: 10 },
  scrollContent: { flex: 1 },
  scrollContentContainer: { flexGrow: 1, justifyContent: 'space-between' },
  preferencesSection: { flex: 0 },
  ageSection: { flex: 0 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  continueButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  continueButtonDisabled: { backgroundColor: '#ccc' },
  continueButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  preferencesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preferenceChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  preferenceChipSelected: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  preferenceText: { fontSize: 14, color: '#333' },
  preferenceTextSelected: { color: '#fff', fontWeight: '600' },
  pickerContainer: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: { color: '#333' },
  pickerItem: { color: '#333' },
});
