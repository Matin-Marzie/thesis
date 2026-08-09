import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';
import { useProfile } from '@/context/ProfileContext';
import { useReelsContext } from '@/context/ReelsContext';
import { createReel } from '@/api/reelCreation';
import { SubtitleVideoPreview } from '@/components/create/sync-subtitles/SubtitleVideoPreview';
import { SubtitleRecordPanel } from '@/components/create/sync-subtitles/SubtitleRecordPanel';
import { SubtitleReviewPanel } from '@/components/create/sync-subtitles/SubtitleReviewPanel';
import type { DraftSubtitleLine } from '@/types/createReel';
import type { Reel } from '@/types/dialogue';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);

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

  const handleChangeLineText = useCallback(
    (localId: string, text: string) => updateLine(localId, { text }),
    [updateLine]
  );

  const handleChangeLineTranslation = useCallback(
    (localId: string, translation: string) => updateLine(localId, { translation }),
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
      <SubtitleVideoPreview
        player={player}
        isPlaying={isPlaying}
        currentTimeMs={currentTimeMs}
        onTogglePlay={handleTogglePlay}
      />

      {phase === 'record' ? (
        <SubtitleRecordPanel
          isDark={isDark}
          lineCount={lines.length}
          draftText={draftText}
          onChangeDraftText={setDraftText}
          draftTranslation={draftTranslation}
          onChangeDraftTranslation={setDraftTranslation}
          draftStartMs={draftStartMs}
          onMarkStart={handleMarkStart}
          onMarkEnd={handleMarkEnd}
          onUndoLast={handleUndoLast}
          onReview={() => setPhase('review')}
        />
      ) : (
        <SubtitleReviewPanel
          isDark={isDark}
          lines={lines}
          currentReviewIndex={currentReviewIndex}
          isPublishing={isPublishing}
          progress={progress}
          onSeekToLine={handleSeekToLine}
          onChangeText={handleChangeLineText}
          onChangeTranslation={handleChangeLineTranslation}
          onNudge={nudge}
          onRemoveLine={removeLine}
          onAddAnotherLine={() => setPhase('record')}
          onPublish={handlePressPublish}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
