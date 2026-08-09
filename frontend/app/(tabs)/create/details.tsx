import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';
import { useProgress } from '@/context/ProgressContext';
import { useProfile } from '@/context/ProfileContext';
import { useReelsContext } from '@/context/ReelsContext';
import { createReel } from '@/api/reelCreation';
import type { Reel } from '@/types/dialogue';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);

export default function CreateDetailsScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const {
    videoAsset,
    lines,
    languageId,
    setLanguageId,
    translationLanguageId,
    setTranslationLanguageId,
    title,
    setTitle,
    description,
    setDescription,
    reset,
  } = useCreateReelWizard();
  const { userProgress } = useProgress();
  const { userProfile } = useProfile();
  const { prependReel } = useReelsContext();

  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);

  const hasTranslations = useMemo(() => lines.some((l) => l.translation.trim().length > 0), [lines]);

  useEffect(() => {
    if (!videoAsset || !lines.length) {
      router.replace('/(tabs)/create');
      return;
    }
    if (languageId === null || translationLanguageId === null) {
      const current = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
      if (languageId === null) {
        setLanguageId(current?.learning_language?.id ?? LANGUAGE_OPTIONS[0].id);
      }
      if (translationLanguageId === null) {
        setTranslationLanguageId(current?.native_language?.id ?? LANGUAGE_OPTIONS[0].id);
      }
    }
  }, [videoAsset, lines.length, languageId, translationLanguageId, userProgress, router, setLanguageId, setTranslationLanguageId]);

  const handlePublish = useCallback(async () => {
    if (!videoAsset || !languageId) return;
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your reel a title before publishing.');
      return;
    }
    if (hasTranslations && !translationLanguageId) {
      Alert.alert('Pick a translation language', 'Some lines have a translation - choose which language it is in.');
      return;
    }

    setIsPublishing(true);
    setProgress(0);

    try {
      const response = await createReel(
        {
          video: videoAsset,
          title: title.trim(),
          description: description.trim(),
          languageId,
          translationLanguageId: hasTranslations ? translationLanguageId : null,
          lines,
        },
        (event: any) => {
          if (event?.total) {
            setProgress(event.loaded / event.total);
          }
        }
      );

      const subtitleLanguage = LANGUAGE_OPTIONS.find((l) => l.id === languageId);

      const optimisticReel: Reel = {
        id: response.reel.id,
        url: response.reel.url,
        thumbnail_url: response.reel.thumbnail_url || '',
        title: response.reel.title,
        duration: response.reel.duration,
        created_at: response.reel.created_at,
        language: {
          id: languageId,
          code: subtitleLanguage?.code || '',
          name: subtitleLanguage?.name || '',
        },
        created_by: {
          id: userProfile?.id,
          username: userProfile?.username,
          profile_picture: userProfile?.profile_picture,
        },
        stats: { views: 0, likes: 0, comments: 0, saves: 0 },
        user_interaction: {
          viewed_at: new Date().toISOString(),
          is_liked: false,
          is_saved: false,
          is_shared: false,
          comment: null,
        },
        dialogue: {
          id: response.reel.dialogue_id,
          created_at: response.reel.created_at,
          sentences: lines.map((line, index) => ({
            id: -(index + 1),
            position: index + 1,
            start_time_ms: line.start_time_ms,
            end_time_ms: line.end_time_ms,
            text: line.text,
            normalized_text: line.text,
            translation: line.translation,
            tokens: [],
          })),
        },
      };

      prependReel(optimisticReel);
      reset();
      router.replace('/(tabs)/reels');
    } catch (error: any) {
      Alert.alert('Publish failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  }, [videoAsset, languageId, translationLanguageId, hasTranslations, title, description, lines, userProfile, prependReel, reset, router]);

  if (!videoAsset) return null;

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
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

        <Text style={[styles.label, isDark && { color: DARK_COLORS.textSecondary }]}>Subtitle language</Text>
        <View style={[styles.pickerWrapper, isDark && styles.inputDark]}>
          <Picker
            selectedValue={languageId ?? undefined}
            onValueChange={(value) => setLanguageId(Number(value))}
            dropdownIconColor={isDark ? DARK_COLORS.text : '#333'}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <Picker.Item key={lang.id} label={lang.name} value={lang.id} color={isDark ? DARK_COLORS.text : undefined} />
            ))}
          </Picker>
        </View>

        {hasTranslations && (
          <>
            <Text style={[styles.label, isDark && { color: DARK_COLORS.textSecondary }]}>Translation language</Text>
            <View style={[styles.pickerWrapper, isDark && styles.inputDark]}>
              <Picker
                selectedValue={translationLanguageId ?? undefined}
                onValueChange={(value) => setTranslationLanguageId(Number(value))}
                dropdownIconColor={isDark ? DARK_COLORS.text : '#333'}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Picker.Item key={lang.id} label={lang.name} value={lang.id} color={isDark ? DARK_COLORS.text : undefined} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <Pressable style={styles.publishButton} onPress={handlePublish} disabled={isPublishing}>
          {isPublishing ? (
            <View style={styles.publishingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.publishButtonText}>{Math.round(progress * 100)}%</Text>
            </View>
          ) : (
            <Text style={styles.publishButtonText}>Publish</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  publishButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 40,
  },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  publishingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
