import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import { SUPPORTED_LANGUAGES } from '@/constants/SupportedLanguages';

interface LanguageSelectionSlideProps {
  onNext: () => void;
  selectedNative: number | null;
  selectedTarget: number | null;
  setSelectedNative: (val: number) => void;
  setSelectedTarget: (val: number) => void;
}

export default function LanguageSelectionSlide({
  onNext,
  selectedNative: selectedNativeLanguage,
  selectedTarget: selectedTargetLanguage,
  setSelectedNative: setSelectedNativeLanguage,
  setSelectedTarget: setSelectedTargetLanguage,
}: LanguageSelectionSlideProps) {
  const [expanded, setExpanded] = useState<string | null>('english');


  const handleSelect = (option: any) => {
    setSelectedNativeLanguage(option.native);
    setSelectedTargetLanguage(option.target);
  };

  return (
    <View style={styles.slideContainer}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What would you like to learn?</Text>

        {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
          <View key={key} style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExpanded(expanded === key ? null : key)}
            >
              <Text style={styles.accordionTitle}>{lang.label}</Text>
              <Ionicons
                name={expanded === key ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={PRIMARY_COLOR}
              />
            </TouchableOpacity>

            {expanded === key && (
              <View style={styles.accordionContent}>
                {lang.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedNativeLanguage === option.native &&
                        selectedTargetLanguage === option.target &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.flagEmoji}>{option.flag}</Text>
                      <Text
                        style={[
                          styles.optionText,
                          selectedNativeLanguage === option.native &&
                            selectedTargetLanguage === option.target &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, (!selectedNativeLanguage || !selectedTargetLanguage) && styles.continueButtonDisabled]}
        onPress={onNext}
        disabled={!selectedNativeLanguage || !selectedTargetLanguage}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  accordionContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accordionContent: {
    padding: 12,
  },
  optionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
