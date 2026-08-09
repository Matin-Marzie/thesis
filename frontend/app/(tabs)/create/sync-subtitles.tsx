import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';
import { useProfile } from '@/context/ProfileContext';
import { useReelsContext } from '@/context/ReelsContext';
import { createReel } from '@/api/reelCreation';
import type { DraftSubtitleLine } from '@/types/createReel';
import type { Reel } from '@/types/dialogue';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);

const formatMs = (ms: number) => {
  const totalSeconds = ms / 1000;
  return `${totalSeconds.toFixed(2)}s`;
};

export default function SyncSubtitlesScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const {
    videoAsset,
    lines,
    addLine,
    updateLine,
    removeLine,
    languageId,
    translationLanguageId,
    title,
    description,
    reset,
  } = useCreateReelWizard();
  const { userProfile } = useProfile();
  const { prependReel } = useReelsContext();

  const [phase, setPhase] = useState<'record' | 'review'>('record');
  const [draftText, setDraftText] = useState('');
  const [draftTranslation, setDraftTranslation] = useState('');
  const [draftStartMs, setDraftStartMs] = useState<number | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);

  const player = useVideoPlayer(videoAsset?.uri ?? null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!videoAsset) {
      router.replace('/(tabs)/create');
    }
  }, [videoAsset, router]);

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

  const handleMarkStart = useCallback(() => {
    setDraftStartMs(Math.round(player.currentTime * 1000));
  }, [player]);

  const handleMarkEnd = useCallback(() => {
    const endMs = Math.round(player.currentTime * 1000);
    if (draftStartMs === null) return;
    if (!draftText.trim()) {
      Alert.alert('Add text', 'Type the subtitle text for this line before marking its end.');
      return;
    }
    if (endMs <= draftStartMs) {
      Alert.alert('Invalid timing', 'The end of a line must come after its start. Keep the video playing forward before marking the end.');
      return;
    }
    addLine({
      text: draftText.trim(),
      translation: draftTranslation.trim(),
      start_time_ms: draftStartMs,
      end_time_ms: endMs,
    });
    setDraftText('');
    setDraftTranslation('');
    setDraftStartMs(null);
  }, [addLine, draftStartMs, draftText, draftTranslation, player]);

  const handleUndoLast = useCallback(() => {
    const last = lines[lines.length - 1];
    if (last) removeLine(last.localId);
  }, [lines, removeLine]);

  const handleSeekToLine = useCallback(
    (line: DraftSubtitleLine) => {
      player.currentTime = line.start_time_ms / 1000;
      player.play();
    },
    [player]
  );

  const currentReviewIndex = useMemo(() => {
    return lines.findIndex((line, i) => {
      const effectiveEnd = line.end_time_ms ?? lines[i + 1]?.start_time_ms ?? Infinity;
      return currentTimeMs >= line.start_time_ms && currentTimeMs <= effectiveEnd;
    });
  }, [lines, currentTimeMs]);

  const nudge = useCallback(
    (line: DraftSubtitleLine, field: 'start_time_ms' | 'end_time_ms', deltaMs: number) => {
      const nextValue = Math.max(0, line[field] + deltaMs);
      updateLine(line.localId, { [field]: nextValue });
    },
    [updateLine]
  );

  const hasTranslations = useMemo(() => lines.some((l) => l.translation.trim().length > 0), [lines]);

  const handlePublish = useCallback(async () => {
    if (!videoAsset || !languageId) return;
    if (hasTranslations && !translationLanguageId) {
      Alert.alert('Pick a translation language', 'Some lines have a translation - go back and choose which language it is in.');
      return;
    }

    setIsPublishing(true);
    setProgress(0);

    try {
      const response = await createReel(
        {
          video: videoAsset,
          title: title.trim() || null,
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

  const handlePressPublish = useCallback(() => {
    const hasInvalid = lines.some((l) => l.end_time_ms <= l.start_time_ms || !l.text.trim());
    if (hasInvalid) {
      Alert.alert('Fix line timings', 'Every line needs text and an end time after its start time.');
      return;
    }
    handlePublish();
  }, [lines, handlePublish]);

  if (!videoAsset) return null;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.videoWrapper}>
        <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
        <Pressable style={styles.playOverlay} onPress={handleTogglePlay}>
          <FontAwesome name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
        </Pressable>
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>{formatMs(currentTimeMs)}</Text>
        </View>
      </View>

      {phase === 'record' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.recordPanel}
        >
          <Text style={[styles.sectionLabel, isDark && { color: DARK_COLORS.textSecondary }]}>
            {lines.length} line{lines.length === 1 ? '' : 's'} captured
          </Text>

          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Subtitle text"
            placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
            value={draftText}
            onChangeText={setDraftText}
            multiline
          />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Translation (optional)"
            placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
            value={draftTranslation}
            onChangeText={setDraftTranslation}
            multiline
          />

          {draftStartMs === null ? (
            <Pressable style={styles.primaryButton} onPress={handleMarkStart}>
              <Text style={styles.primaryButtonText}>Mark Start</Text>
            </Pressable>
          ) : (
            <View>
              <Text style={[styles.hint, isDark && { color: DARK_COLORS.textMuted }]}>
                Start marked at {formatMs(draftStartMs)} — keep playing, then mark the end.
              </Text>
              <Pressable style={styles.primaryButton} onPress={handleMarkEnd}>
                <Text style={styles.primaryButtonText}>Mark End &amp; Add Line</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.row}>
            <Pressable style={styles.secondaryButton} onPress={handleUndoLast} disabled={!lines.length}>
              <Text style={[styles.secondaryButtonText, !lines.length && styles.disabledText]}>Undo Last Line</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, !lines.length && styles.disabledButton]}
              onPress={() => setPhase('review')}
              disabled={!lines.length}
            >
              <Text style={[styles.secondaryButtonText, !lines.length && styles.disabledText]}>Review &amp; Finish</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.reviewPanel}>
          <FlatList
            data={lines}
            keyExtractor={(item) => item.localId}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.reviewRow,
                  index === currentReviewIndex && styles.reviewRowActive,
                  isDark && { borderColor: DARK_COLORS.border },
                ]}
                onPress={() => handleSeekToLine(item)}
              >
                <TextInput
                  style={[styles.reviewText, isDark && { color: DARK_COLORS.text }]}
                  value={item.text}
                  onChangeText={(text) => updateLine(item.localId, { text })}
                  multiline
                />
                <TextInput
                  style={[styles.reviewTranslation, isDark && { color: DARK_COLORS.textSecondary }]}
                  value={item.translation}
                  onChangeText={(translation) => updateLine(item.localId, { translation })}
                  placeholder="Translation (optional)"
                  placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
                  multiline
                />

                <View style={styles.timingRow}>
                  <View style={styles.timingControl}>
                    <Text style={styles.timingLabel}>Start {formatMs(item.start_time_ms)}</Text>
                    <View style={styles.nudgeRow}>
                      <Pressable onPress={() => nudge(item, 'start_time_ms', -100)} style={styles.nudgeButton}>
                        <Text style={styles.nudgeButtonText}>-100ms</Text>
                      </Pressable>
                      <Pressable onPress={() => nudge(item, 'start_time_ms', 100)} style={styles.nudgeButton}>
                        <Text style={styles.nudgeButtonText}>+100ms</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.timingControl}>
                    <Text style={styles.timingLabel}>End {formatMs(item.end_time_ms)}</Text>
                    <View style={styles.nudgeRow}>
                      <Pressable onPress={() => nudge(item, 'end_time_ms', -100)} style={styles.nudgeButton}>
                        <Text style={styles.nudgeButtonText}>-100ms</Text>
                      </Pressable>
                      <Pressable onPress={() => nudge(item, 'end_time_ms', 100)} style={styles.nudgeButton}>
                        <Text style={styles.nudgeButtonText}>+100ms</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {item.end_time_ms <= item.start_time_ms && (
                  <Text style={styles.errorText}>End must be after start</Text>
                )}

                <Pressable onPress={() => removeLine(item.localId)} style={styles.deleteRowButton}>
                  <FontAwesome name="trash" size={16} color="#c0392b" />
                </Pressable>
              </Pressable>
            )}
            contentContainerStyle={styles.reviewListContent}
          />

          <View style={styles.row}>
            <Pressable style={styles.secondaryButton} onPress={() => setPhase('record')} disabled={isPublishing}>
              <Text style={styles.secondaryButtonText}>Add Another Line</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handlePressPublish} disabled={isPublishing}>
              {isPublishing ? (
                <View style={styles.publishingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.primaryButtonText}>{Math.round(progress * 100)}%</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Publish</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  recordPanel: { flex: 1, padding: 16 },
  reviewPanel: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 13, color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    minHeight: 44,
  },
  inputDark: {
    borderColor: DARK_COLORS.border,
    color: DARK_COLORS.text,
    backgroundColor: DARK_COLORS.surface,
  },
  hint: { fontSize: 12, color: '#666', marginBottom: 8 },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButtonText: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  disabledButton: { opacity: 0.4 },
  disabledText: { color: '#999' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  reviewListContent: { paddingBottom: 12 },
  reviewRow: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  reviewRowActive: { borderColor: PRIMARY_COLOR, borderWidth: 2 },
  reviewText: { fontSize: 15, fontWeight: '600' },
  reviewTranslation: { fontSize: 13, color: '#666', marginTop: 4 },
  timingRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  timingControl: { flex: 1 },
  timingLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  nudgeRow: { flexDirection: 'row', gap: 6 },
  nudgeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  nudgeButtonText: { fontSize: 11 },
  errorText: { color: '#c0392b', fontSize: 12, marginTop: 6 },
  deleteRowButton: { position: 'absolute', top: 10, right: 10 },
  publishingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
