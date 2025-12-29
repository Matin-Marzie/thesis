import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';

export default function ProgressHeaderTitle() {
  const { userProgress } = useAppContext();

  // Find the current language object
  const currentLang = userProgress?.languages?.find(l => l.is_current_language);
  
  // Find the LANGUAGES_META entry by ID
  const languageMeta = Object.values(LANGUAGES_META).find(l => l.id === Number(currentLang?.learning_language.id));

  const flag = languageMeta?.flag;


  return (
    <View style={styles.container}>
      {/* Language Flag + Proficiency Level */}
      <View style={styles.item}>
        <Text style={styles.flag}>{flag || '🏳️'}</Text>
        <Text style={styles.text}>{currentLang?.proficiency_level || 'A1'}</Text>
      </View>

      {/* Experience */}
      <View style={styles.item}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.text}>{currentLang?.experience || 0}</Text>
      </View>

      {/* Coins */}
      <View style={styles.item}>
        <Text style={styles.icon}>🪙</Text>
        <Text style={styles.text}>{userProgress?.coins || 0}</Text>
      </View>

      {/* Energy */}
      <View style={styles.item}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.text}>{userProgress?.energy || 0}</Text>
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
