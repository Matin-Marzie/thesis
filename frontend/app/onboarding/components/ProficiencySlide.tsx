import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/App';

// Language type
interface Language {
  id: number;
  name: string;
  code: string;
}

// Props for the proficiency slide
interface ProficiencySlideProps {
  onNext: () => void; // Callback for "Continue" button
  selectedLevel: string | null; // Selected proficiency level
  setSelectedLevel: (val: string) => void; // Update proficiency level
  selectedLearningLanguage: Language | null; // Current learning language
}

export default function ProficiencySlide({
  onNext,
  selectedLevel,
  setSelectedLevel,
  selectedLearningLanguage,
}: ProficiencySlideProps) {
  // Get language name directly from the selected language object
  const languageName = selectedLearningLanguage?.name ?? '';

  // Proficiency levels with label and number of bars
  const levels = [
    { value: 'N', label: `Learning ${languageName} for the first time`, bars: 0 },
    { value: 'A1', label: 'I know the letters and basic greetings and phrases', bars: 1 },
    { value: 'A2', label: 'I can handle simple everyday tasks', bars: 2 },
    { value: 'B1', label: 'I can have everyday conversations', bars: 3 },
    { value: 'B2', label: 'I can speak confidently on most topics', bars: 4 },
    { value: 'C1', label: 'I can express complex ideas fluently', bars: 5 },
    { value: 'C2', label: 'I have mastered the language completely', bars: 6 },
  ];

  /**
   * Render the bars indicating proficiency level
   * @param filledCount - number of bars to fill
   * @param isSelected - if this level is currently selected
   */
  const renderProficiencyBars = (filledCount: number, isSelected: boolean) => {
    const barHeights = [12, 15, 18, 21, 24, 28]; // Progressive heights for bars (6 bars)

    return (
      <View style={styles.barsContainer}>
        {barHeights.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { height },
              index < filledCount && (isSelected ? styles.barFilledSelected : styles.barFilled),
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.slideContainer}>
      {/* Slide title */}
      <Text style={styles.title}>
        How much <Text style={styles.languageNameUnderline}>{languageName}</Text> do you know?
      </Text>
      <Text style={styles.subtitle}>Select your current level</Text>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Render each proficiency level */}
        {levels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.levelButton,
              selectedLevel === level.value && styles.levelButtonSelected,
            ]}
            onPress={() => setSelectedLevel(level.value)}
          >
            {/* Bars indicator */}
            {renderProficiencyBars(level.bars, selectedLevel === level.value)}

            {/* Level label */}
            <Text
              style={[
                styles.levelText,
                selectedLevel === level.value && styles.levelTextSelected,
              ]}
            >
              {level.label}
            </Text>

            {/* Level code (A1, B2, etc.) */}
            <Text
              style={[
                styles.levelSublabel,
                selectedLevel === level.value && styles.levelSublabelSelected,
              ]}
            >
              {level.value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.continueButton, !selectedLevel && styles.continueButtonDisabled]}
        onPress={onNext}
        disabled={!selectedLevel}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  scrollContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  languageNameUnderline: {
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 10,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
    marginHorizontal: 10,
  },
  levelButtonSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginRight: 4,
    width: 60,
  },
  bar: {
    width: 7,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  barFilled: {
    backgroundColor: PRIMARY_COLOR,
  },
  barFilledSelected: {
    backgroundColor: '#fff',
  },
  levelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  levelTextSelected: {
    color: '#fff',
  },
  levelSublabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  levelSublabelSelected: {
    color: '#fff',
    opacity: 0.9,
  },
});
