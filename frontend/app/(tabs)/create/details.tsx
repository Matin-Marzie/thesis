import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
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
    thumbnailAsset,
    setThumbnailAsset,
    languageId,
    setLanguageId,
    title,
    setTitle,
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

  const handlePickThumbnail = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your photos to choose a cover.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setThumbnailAsset({
      uri: asset.uri,
      mimeType: asset.mimeType ?? null,
      fileName: asset.fileName ?? null,
    });
  }, [setThumbnailAsset]);

  const handleRemoveThumbnail = useCallback(() => {
    setThumbnailAsset(null);
  }, [setThumbnailAsset]);

  useEffect(() => {
    if (!videoAsset) {
      router.replace('/(tabs)/create');
      return;
    }
    if (languageId === null) {
      const current = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
      // learning_language.id comes back from the backend as a string
      // (Postgres bigint column), but LANGUAGES_META's ids are numbers -
      // without coercing, selectedValue would never strictly match a
      // Picker.Item's value and the picker silently falls back to its first
      // item (English) regardless of the user's actual language.
      setLanguageId(Number(current?.learning_language?.id ?? LANGUAGE_OPTIONS[0].id));
    }
  }, [videoAsset, languageId, userProgress, router, setLanguageId]);

  const handleContinue = useCallback(() => {
    player.pause();
    router.push('/(tabs)/create/sync-subtitles');
  }, [router, player]);

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
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              maxLength={100}
            />

            <View style={styles.coverRow}>
              <Pressable
                style={[styles.coverPreview, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}
                onPress={handlePickThumbnail}
              >
                {thumbnailAsset ? (
                  <Image source={{ uri: thumbnailAsset.uri }} style={styles.coverImage} />
                ) : (
                  <FontAwesome name="image" size={22} color={isDark ? DARK_COLORS.textSecondary : '#999'} />
                )}
              </Pressable>
              <View style={styles.coverInfo}>
                <Text style={[styles.coverInfoText, isDark && { color: DARK_COLORS.textSecondary }]}>
                  {thumbnailAsset
                    ? "This image will be your reel's cover."
                    : "We'll grab a frame from your video if you skip this."}
                </Text>
                <Pressable onPress={thumbnailAsset ? handleRemoveThumbnail : handlePickThumbnail}>
                  <Text style={styles.coverActionText}>{thumbnailAsset ? 'Remove' : 'Choose from library'}</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.label, isDark && { color: DARK_COLORS.textSecondary }]}>Reel / Subtitle language</Text>
            <View style={[styles.pickerContainer, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}>
              <Picker
                selectedValue={languageId}
                onValueChange={(value) => setLanguageId(Number(value))}
                style={[styles.picker, isDark && { color: DARK_COLORS.text }]}
                itemStyle={[styles.pickerItem, isDark && { color: DARK_COLORS.text }]}
                dropdownIconColor={isDark ? DARK_COLORS.text : '#333'}
                mode="dropdown"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Picker.Item
                    key={lang.id}
                    label={`${lang.flag} ${lang.name}`}
                    value={lang.id}
                    color={Platform.OS === 'android' ? (isDark ? DARK_COLORS.text : '#333') : undefined}
                    style={
                      Platform.OS === 'android'
                        ? { backgroundColor: isDark ? DARK_COLORS.surface : '#fff' }
                        : undefined
                    }
                  />
                ))}
              </Picker>
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
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'space-between' },
  fieldsGroup: { gap: 12},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  inputDark: {
    borderColor: DARK_COLORS.border,
    color: DARK_COLORS.text,
    backgroundColor: DARK_COLORS.surface,
  },
  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverPreview: {
    width: 64,
    aspectRatio: 9 / 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverInfo: {
    flex: 1,
    gap: 4,
  },
  coverInfoText: {
    fontSize: 13,
    color: '#666',
  },
  coverActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  label: { fontSize: 14, color: '#666', marginTop: 8 },
  pickerContainer: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: { color: '#333' },
  pickerItem: { color: '#333' },

  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  continueButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
