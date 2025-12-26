import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { LANGUAGE_META } from '@/constants/SupportedLanguages';

export default function HomeHeaderTitle() {
  const { user } = useAppContext();

    // Find the current language object
    const currentLang = user?.languages?.find(l => l.is_current_language);
    const learningLanguageId = currentLang?.learning_language_id;
    const proficiencyLevel = currentLang?.proficiency_level;
    const experience = currentLang?.experience || 0;
    const coins = user?.coins || 0;
    const energy = user?.energy || 0;
    const languageFlag = learningLanguageId && LANGUAGE_META[learningLanguageId as keyof typeof LANGUAGE_META]?.flag;

  return (
    <View style={styles.container}>
      {/* Language Flag + Proficiency Level */}
      <View style={styles.item}>
        <Text style={styles.flag}>{languageFlag || '🏳️'}</Text>
        <Text style={styles.text}>{proficiencyLevel || 'A1'}</Text>
      </View>

      {/* Experience */}
      <View style={styles.item}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.text}>{experience}</Text>
      </View>

      {/* Coins */}
      <View style={styles.item}>
        <Text style={styles.icon}>🪙</Text>
        <Text style={styles.text}>{coins}</Text>
      </View>

      {/* Energy */}
      <View style={styles.item}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.text}>{energy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flag: {
    fontSize: 20,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
