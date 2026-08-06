import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TouchableOpacity from '@/components/TouchableOpacity';
import WelcomeSlide from './components/WelcomeSlide';
import LanguageSelectionSlide from './components/LanguageSelectionSlide';
import ProficiencySlide from './components/ProficiencySlide';
import NotificationsSlide from './components/NotificationsSlide';
import PersonalizationSlide from './components/PersonalizationSlide';
import { PRIMARY_COLOR, DARK_COLORS } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import { registerWithGoogle } from '../../api/auth';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { useAuth } from '@/context/AuthContext';
import { useDictionaryContext } from '@/context/DictionaryContext';
import { getLevelsBelowProficiency, getMasteryLevelForWordLevel } from '@/constants/Vocabulary';
import { VOCABULARY_ACTIONS, DEFAULT_VOCABULARY_CHANGES } from '@/hooks/useVocabulary';

export default function OnboardingQuestions() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { updateUserProfile } = useProfile();
  const { userProgress, setUserProgress } = useProgress();
  const { bulkAddVocabulary, vocabularyChanges, vocabularyDispatch, setVocabularyChanges } = useVocabularyContext();
  const { setIsAuthenticated, setHasCompletedOnboarding, pendingGoogleAuth, setPendingGoogleAuth } = useAuth();
  const { fetchDictionary } = useDictionaryContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // User selections
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
  const [selectedLearningLanguage, setSelectedLearningLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>('N');
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

    const newUserProfile = {
      joined_date: new Date().toISOString(),
      age: parseInt(selectedAge),
      preferences: selectedPreferences.join(','),
      notifications: true,
    };

    const newLanguages = [
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
    ];

    // Store user profile
    await updateUserProfile(newUserProfile);

    // Store user progress
    await setUserProgress((prev) => ({
      ...prev,
      languages: newLanguages,
    }));

    // TODO: Fetch Reels sending native_language_id and learning_language_id and proficiency_level and preferences and age

    // Fetch dictionary and add words below user's proficiency level to vocabulary
    if (selectedLearningLanguage?.code && selectedNativeLanguage?.code) {
      const dictionaryData = await fetchDictionary(selectedLearningLanguage.code, selectedNativeLanguage.code) as { words?: Array<{ id: number; level: string }> } | null;

      // Add words below proficiency level to user's vocabulary, with a
      // mastery_level based on how far below the target level each word's
      // own level is - mirrors the backend's auto-seed exactly (see
      // getMasteryLevelForWordLevel / userVocabularyModel.addByProficiencyLevel)
      if (dictionaryData?.words && selectedLevel) {
        const levelsBelowProficiency = getLevelsBelowProficiency(selectedLevel);
        const wordIdsByMastery = new Map<number, number[]>();

        for (const word of dictionaryData.words) {
          if (!levelsBelowProficiency.includes(word.level)) continue;
          const mastery = getMasteryLevelForWordLevel(selectedLevel, word.level);
          const bucket = wordIdsByMastery.get(mastery) ?? [];
          bucket.push(word.id);
          wordIdsByMastery.set(mastery, bucket);
        }

        for (const [mastery, wordIds] of wordIdsByMastery) {
          bulkAddVocabulary(wordIds, mastery);
        }
      }
    }

    // If the user started signing up with Google, we now have real profile
    // data to send - finish creating the account with the idToken stashed
    // by login.tsx/register.tsx before routing here.
    if (pendingGoogleAuth) {
      try {
        const apiResponse = await registerWithGoogle({
          idToken: pendingGoogleAuth.idToken,
          platform: pendingGoogleAuth.platform,
          user_profile: newUserProfile,
          user_progress: {
            energy: userProgress.energy,
            coins: userProgress.coins,
            languages: newLanguages,
          },
          vocabulary_changes: vocabularyChanges,
        });

        if (apiResponse.status === 201 && apiResponse.data) {
          setIsAuthenticated(true);
          await updateUserProfile(apiResponse.data.user_profile);
          await setUserProgress(apiResponse.data.user_progress);
          vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: apiResponse.data.user_vocabulary });
          // The manually-tracked changes just sent were already applied
          // server-side - clear them so a later background sync doesn't
          // try to re-insert them and hit a duplicate-key error.
          setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
        }
      } catch (error: any) {
        console.error('Failed to finish Google sign-up after onboarding:', error);
        Alert.alert(
          'Account creation failed',
          error.message || 'Could not finish creating your account. You can try Google sign-in again from Login.'
        );
      } finally {
        setPendingGoogleAuth(null);
      }
    }

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
    <View style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
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
                isDark && { backgroundColor: DARK_COLORS.border },
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
