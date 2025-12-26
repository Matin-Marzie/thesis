import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_COLOR } from '@/constants/App';

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
  
  const preferences = [
    'Movies', 'Sports', 'Anime', 'Make up', 'Cartoons', 'Video games', 'News', 'Politics'
  ];

  const ageData = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  const scrollViewRef = useRef<ScrollView>(null);
  const ITEM_HEIGHT = 40;
  const [currentAge, setCurrentAge] = useState(selectedAge);

  useEffect(() => {
    if (selectedAge && scrollViewRef.current) {
      const index = parseInt(selectedAge) - 1;
      scrollViewRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const age = (index + 1).toString();
    if (age !== currentAge && index >= 0 && index < 100) {
      setCurrentAge(age);
      setSelectedAge(age);
    }
    Vibration.vibrate(10);
  };

  const togglePreference = (pref: string) => {
    Vibration.vibrate(10);
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
        <Text style={styles.title}>Personalization</Text>

        {/* Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionSubtitle}>Select topics you're interested in</Text>
          <View style={styles.preferencesGrid}>
            {preferences.map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.preferenceChip,
                  selectedPreferences.includes(pref) && styles.preferenceChipSelected,
                ]}
                onPress={() => togglePreference(pref)}
              >
                <Text
                  style={[
                    styles.preferenceText,
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
          <Text style={styles.sectionTitle}>Age</Text>
          <Text style={styles.sectionSubtitle}>Your age won't be shown publicly.</Text>
          <View style={styles.pickerContainer}>
            {/* Inner shadows */}
            <LinearGradient
              colors={['#FFF', 'transparent']}
              style={styles.innerShadowTop}
            />
            <LinearGradient
              colors={['transparent', '#FFF']}
              style={styles.innerShadowBottom}
            />

            <View style={styles.pickerOverlay}>
              <View style={styles.pickerHighlight} />
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScroll}
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            >
              {ageData.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCurrentAge(age);
                    setSelectedAge(age);
                    Vibration.vibrate(10);
                    scrollViewRef.current?.scrollTo({ y: (parseInt(age) - 1) * ITEM_HEIGHT, animated: true });
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      currentAge === age && styles.pickerItemTextSelected,
                    ]}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
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
    height: 200,
    position: 'relative',
  },
  innerShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 2,
    pointerEvents: 'none',
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 2,
    pointerEvents: 'none',
  },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', zIndex: 1, pointerEvents: 'none' },
  pickerHighlight: { height: 40, backgroundColor: 'rgba(101, 137, 255, 0.1)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: PRIMARY_COLOR },
  pickerScroll: { flex: 1 },
  pickerItem: { height: 40, justifyContent: 'center', alignItems: 'center' },
  pickerItemText: { fontSize: 18, color: '#999' },
  pickerItemTextSelected: { fontSize: 22, fontWeight: 'bold', color: PRIMARY_COLOR },
});
