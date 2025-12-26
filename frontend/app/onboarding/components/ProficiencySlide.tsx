import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGE_META } from '@/constants/SupportedLanguages';

interface ProficiencySlideProps {
  onNext: () => void;
  selectedLevel: string | null;
  setSelectedLevel: (val: string) => void;
  selectedLearningLanguage: number | null;
}

export default function ProficiencySlide({ onNext, selectedLevel, setSelectedLevel, selectedLearningLanguage }: ProficiencySlideProps) {
  const levels = [
    { value: 'A1', label: 'First time learning', bars: 0 },
    { value: 'A2', label: 'I know some common words', bars: 1 },
    { value: 'B1', label: 'I can have basic conversations', bars: 2 },
    { value: 'B2', label: 'I can discuss various topics', bars: 3 },
    { value: 'C1', label: 'I am fluent', bars: 4 },
    { value: 'C2', label: 'I am native', bars: 5 },
  ];

  const renderProficiencyBars = (filledCount: number, isSelected: boolean) => {
    const barHeights = [12, 16, 20, 24, 28]; // Progressive heights
    
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
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          How much {selectedLearningLanguage && LANGUAGE_META[selectedLearningLanguage as keyof typeof LANGUAGE_META]?.name} do you know?
        </Text>
        <Text style={styles.subtitle}>Select your current level</Text>

        {levels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.levelButton,
              selectedLevel === level.value && styles.levelButtonSelected,
            ]}
            onPress={() => setSelectedLevel(level.value)}
          >
            {renderProficiencyBars(level.bars, selectedLevel === level.value)}
            <Text
              style={[
                styles.levelText,
                selectedLevel === level.value && styles.levelTextSelected,
              ]}
            >
              {level.label}
            </Text>
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
    paddingHorizontal: 10,
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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
    width: 8,
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
