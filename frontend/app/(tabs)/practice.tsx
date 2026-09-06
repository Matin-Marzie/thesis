import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import TouchableOpacity from '@/components/TouchableOpacity';
import { useColorScheme } from '@/components/useColorScheme';
import { useProgress } from '@/context/ProgressContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { useDictionaryContext } from '@/context/DictionaryContext';
import { GAMES } from '@/constants/games';
import { DARK_COLORS } from '@/constants/App';

export default function PracticeScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { userProgress } = useProgress();
  const { userVocabulary } = useVocabularyContext();
  const { dictionary } = useDictionaryContext();

  const langCode = useMemo(() => {
    const current = userProgress?.languages?.find((l) => l.is_current_language);
    return current?.learning_language?.code ?? 'en';
  }, [userProgress?.languages]);

  // Recomputed only when the inputs each game's isPlayable() reads actually
  // change, not on every render - Wordle's check scans the full dictionary.
  const gamesWithAvailability = useMemo(() => {
    const ctx = { userVocabulary, dictionaryWords: dictionary?.words ?? [], langCode };
    return GAMES.map((game) => ({ game, availability: game.isPlayable(ctx) }));
  }, [userVocabulary, dictionary, langCode]);

  const handlePress = (game, availability) => {
    if (!availability.playable) {
      Alert.alert('Not available yet', availability.reason ?? 'This game is not available right now.');
      return;
    }
    router.push(game.route);
  };

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>games</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScroll}
        >
          {gamesWithAvailability.map(({ game, availability }) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameThumbnail, !availability.playable && styles.gameThumbnailLocked]}
              onPress={() => handlePress(game, availability)}
            >
              <Image
                source={game.thumbnail}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              <View style={styles.thumbnailOverlay}>
                <Text style={styles.gameName}>{game.name}</Text>
                {!availability.playable && (
                  <Text style={styles.lockedText}>{availability.reason}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  gamesScroll: {
    marginTop: 10,
  },
  gameThumbnail: {
    width: 180,
    height: 280,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameThumbnailLocked: {
    opacity: 0.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  wordlePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordlePlaceholderText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  devText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.9,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
  },
  gameName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lockedText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
});
