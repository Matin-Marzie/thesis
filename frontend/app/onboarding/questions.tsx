import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WelcomeSlide from './components/WelcomeSlide';
import LanguageSelectionSlide from './components/LanguageSelectionSlide';
import ProficiencySlide from './components/ProficiencySlide';
import NotificationsSlide from './components/NotificationsSlide';
import PersonalizationSlide from './components/PersonalizationSlide';
import { PRIMARY_COLOR } from '@/constants/App';
import { useAppContext } from '@/context/AppContext';

export default function OnboardingQuestions() {
  const router = useRouter();
  const { setHasCompletedOnboarding, updateUserProfile, setUserProgress } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // User selections
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
  const [selectedLearningLanguage, setSelectedLearningLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>('A1');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedAge, setSelectedAge] = useState<string>('25');

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior (go back to landing)
    });

    return () => backHandler.remove();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 4) {
      setCurrentSlide(currentSlide + 1);
    } else if (currentSlide === 4) {
      // Last slide - complete onboarding
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      router.back();
    }
  };

  const completeOnboarding = async () => {
    // Save onboarding data

    // Store user profile
    await updateUserProfile({
      joined_date: new Date().toISOString(),
      age: parseInt(selectedAge),
      preferences: selectedPreferences.join(','),
      notifications: true
    });

    // Store user progress
    await setUserProgress((prev) => ({
      ...prev,
      languages: [
        {
          id: null,
          is_current_language: true,
          created_at: new Date().toISOString(),
          proficiency_level: selectedLevel,
          experience: 0,
          native_language: {
            id: selectedNativeLanguage?.id,
            name: selectedNativeLanguage?.name,
            code: selectedNativeLanguage?.code,
          },
          learning_language: {
            id: selectedLearningLanguage?.id,
            name: selectedLearningLanguage?.name,
            code: selectedLearningLanguage?.code,
          }
        }
      ]
    }));

    // TODO: Fetch Reels sending native_language_id and learning_language_id and proficiency_level and preferences and age
    // TODO: Fetch dictionary sending native_language_id and learning_language_id

    // Mark onboarding as complete (persisted via usePersistedState in AppContext)
    setHasCompletedOnboarding(true);

    // Navigate to home
    router.replace('/(tabs)');
  };

  const slides = [
    <WelcomeSlide key="welcome" onNext={handleNext} />,
    <LanguageSelectionSlide
      key="language"
      onNext={handleNext}
      selectedNative={selectedNativeLanguage}
      selectedTarget={selectedLearningLanguage}
      setSelectedNative={setSelectedNativeLanguage}
      setSelectedTarget={setSelectedLearningLanguage}
    />,
    <ProficiencySlide
      key="proficiency"
      onNext={handleNext}
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      selectedLearningLanguage={selectedLearningLanguage}
    />,
    <NotificationsSlide key="notifications" onNext={handleNext} />,
    <PersonalizationSlide
      key="personalization"
      onNext={handleNext}
      selectedPreferences={selectedPreferences}
      setSelectedPreferences={setSelectedPreferences}
      selectedAge={selectedAge}
      setSelectedAge={setSelectedAge}
    />,
  ];

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Progress Indicator */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={32} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentSlide && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.backButton} />
      </View>

      {/* Current Slide */}
      {slides[currentSlide]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: PRIMARY_COLOR,
    width: 24,
  },
});
