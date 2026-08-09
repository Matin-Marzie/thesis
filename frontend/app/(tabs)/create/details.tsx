import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';
import { useProgress } from '@/context/ProgressContext';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);

const formatMs = (ms: number) => {
  const totalSeconds = ms / 1000;
  return `${totalSeconds.toFixed(2)}s`;
};

export default function CreateDetailsScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const navigation = useNavigation();
  const {
    videoAsset,
    languageId,
    setLanguageId,
    translationLanguageId,
    setTranslationLanguageId,
    title,
    setTitle,
    description,
    setDescription,
  } = useCreateReelWizard();
  const { userProgress } = useProgress();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const player = useVideoPlayer(videoAsset?.uri ?? null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    player.timeUpdateEventInterval = 0.1;
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      setCurrentTimeMs((currentTime || 0) * 1000);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    setIsPlaying(player.playing);
    const sub = player.addListener('playingChange', ({ isPlaying: next }) => setIsPlaying(next));
    return () => sub.remove();
  }, [player]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  useEffect(() => {
    if (!videoAsset) {
      router.replace('/(tabs)/create');
      return;
    }
    if (languageId === null || translationLanguageId === null) {
      const current = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
      // learning_language.id / native_language.id come back from the backend
      // as strings (Postgres bigint columns), but LANGUAGES_META's ids are
      // numbers - without coercing, selectedValue would never strictly match
      // a Picker.Item's value and the picker silently falls back to its
      // first item (English) regardless of the user's actual language.
      if (languageId === null) {
        setLanguageId(Number(current?.learning_language?.id ?? LANGUAGE_OPTIONS[0].id));
      }
      if (translationLanguageId === null) {
        setTranslationLanguageId(Number(current?.native_language?.id ?? LANGUAGE_OPTIONS[0].id));
      }
    }
  }, [videoAsset, languageId, translationLanguageId, userProgress, router, setLanguageId, setTranslationLanguageId]);

  const subtitleLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((lang) => lang.id === languageId),
    [languageId]
  );
  const translationLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((lang) => lang.id === translationLanguageId),
    [translationLanguageId]
  );

  const handleContinue = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your reel a title before continuing.');
      return;
    }
    player.pause();
    router.push('/(tabs)/create/sync-subtitles');
  }, [title, router, player]);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert.alert('Discard changes?', "You'll lose what you've entered so far.", [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return sub;
  }, [navigation]);

  if (!videoAsset) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.videoWrapper}>
          <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
          <Pressable style={styles.playOverlay} onPress={handleTogglePlay}>
            <FontAwesome name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
          </Pressable>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{formatMs(currentTimeMs)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.fieldsGroup}>
            <Text style={[styles.label, isDark && { color: DARK_COLORS.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your reel a title"
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              maxLength={100}
            />

            <Text style={[styles.label, isDark && { color: DARK_COLORS.textSecondary }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline, isDark && styles.inputDark]}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this reel about?"
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              maxLength={500}
              multiline
            />

            <View style={styles.languageRow}>
              <Text style={[styles.languageRowLabel, isDark && { color: DARK_COLORS.textSecondary }]}>Subtitle language</Text>
              <Text style={[styles.languageRowValue, isDark && { color: DARK_COLORS.text }]}>
                {subtitleLanguage ? `${subtitleLanguage.flag} ${subtitleLanguage.name}` : '—'}
              </Text>
            </View>
            <View style={styles.languageRow}>
              <Text style={[styles.languageRowLabel, isDark && { color: DARK_COLORS.textSecondary }]}>Translation language</Text>
              <Text style={[styles.languageRowValue, isDark && { color: DARK_COLORS.text }]}>
                {translationLanguage ? `${translationLanguage.flag} ${translationLanguage.name}` : '—'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  videoWrapper: { height: 260, backgroundColor: '#000' },
  video: { flex: 1 },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 6, justifyContent: 'space-between' },
  fieldsGroup: {},
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputDark: {
    borderColor: DARK_COLORS.border,
    color: DARK_COLORS.text,
    backgroundColor: DARK_COLORS.surface,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageRowLabel: { fontSize: 14, color: '#666' },
  languageRowValue: { fontSize: 14, fontWeight: '600' },

  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  continueButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
