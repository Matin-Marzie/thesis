import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useReelsContext } from '@/context/ReelsContext';
import { useUserReels } from '@/context/UserReelsContext';
import { createReel } from '@/api/reelCreation';
import { SubtitleVideoPreview } from '@/components/create/sync-subtitles/SubtitleVideoPreview';
import { SubtitleRecordPanel } from '@/components/create/sync-subtitles/SubtitleRecordPanel';
import { SubtitleReviewPanel } from '@/components/create/sync-subtitles/SubtitleReviewPanel';
import type { DraftSubtitleLine, DraftTranslation } from '@/types/createReel';
import type { Reel } from '@/types/dialogue';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);

const makeTranslationLocalId = () => `translation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function SyncSubtitlesScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const {
    videoAsset,
    thumbnailAsset,
    lines,
    addLine,
    updateLine,
    removeLine,
    languageId,
    title,
    reset,
  } = useCreateReelWizard();
  const { userProfile } = useProfile();
  const { userProgress } = useProgress();
  const { prependReel } = useReelsContext();
  const { prependUserReel } = useUserReels();

  // The reel's own subtitle language can't also be picked as a translation
  // language for one of its lines - translating a line into the language
  // it's already written in is meaningless.
  const nativeLanguageId = useMemo(() => {
    const current = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
    const id = current?.native_language?.id;
    return id != null ? Number(id) : null;
  }, [userProgress]);

  const defaultTranslationLanguageId = useMemo(() => {
    if (nativeLanguageId !== null && nativeLanguageId !== languageId) return nativeLanguageId;
    return LANGUAGE_OPTIONS.find((l) => l.id !== languageId)?.id ?? null;
  }, [nativeLanguageId, languageId]);

  const makeDefaultTranslations = useCallback((): DraftTranslation[] => {
    if (defaultTranslationLanguageId === null) return [];
    return [{ localId: makeTranslationLocalId(), text: '', languageId: defaultTranslationLanguageId }];
  }, [defaultTranslationLanguageId]);

  const [phase, setPhase] = useState<'record' | 'review'>('record');
  const [draftText, setDraftText] = useState('');
  const [draftTranslations, setDraftTranslations] = useState<DraftTranslation[]>([]);
  const [draftStartMs, setDraftStartMs] = useState<number | null>(null);
  const [draftEndMs, setDraftEndMs] = useState<number | null>(null);
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

  // Seeds the very first draft's translation row once we know which
  // language to default it to - later drafts get reseeded straight from
  // handleAddLine, this only covers the initial mount.
  const hasSeededDraftTranslations = useRef(false);
  useEffect(() => {
    if (!hasSeededDraftTranslations.current && defaultTranslationLanguageId !== null) {
      setDraftTranslations(makeDefaultTranslations());
      hasSeededDraftTranslations.current = true;
    }
  }, [defaultTranslationLanguageId, makeDefaultTranslations]);

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

  const handleRestartRecording = useCallback(() => {
    setDraftStartMs(null);
    setDraftEndMs(null);
  }, []);

  const handleMarkStart = useCallback(() => {
    setDraftStartMs(Math.round(player.currentTime * 1000));
    player.play();
  }, [player]);

  const handleMarkEnd = useCallback(() => {
    if (isPlaying) {
      setDraftEndMs(Math.round(player.currentTime * 1000));
      player.pause();
    } else {
      player.play();
    }
  }, [player, isPlaying]);
  
  const handleAddDraftTranslation = useCallback(() => {
    setDraftTranslations((prev) => {
      const usedLanguageIds = new Set(prev.map((t) => t.languageId));
      const nextLanguageId =
        LANGUAGE_OPTIONS.find((l) => l.id !== languageId && !usedLanguageIds.has(l.id))?.id ?? null;
      if (nextLanguageId === null) return prev;
      return [...prev, { localId: makeTranslationLocalId(), text: '', languageId: nextLanguageId }];
    });
  }, [languageId]);

  const handleChangeDraftTranslationText = useCallback((translationLocalId: string, text: string) => {
    setDraftTranslations((prev) => prev.map((t) => (t.localId === translationLocalId ? { ...t, text } : t)));
  }, []);

  const handleChangeDraftTranslationLanguage = useCallback((translationLocalId: string, langId: number) => {
    setDraftTranslations((prev) => prev.map((t) => (t.localId === translationLocalId ? { ...t, languageId: langId } : t)));
  }, []);

  const handleRemoveDraftTranslation = useCallback((translationLocalId: string) => {
    setDraftTranslations((prev) => prev.filter((t) => t.localId !== translationLocalId));
  }, []);

  const handleAddLine = useCallback(() => {
    if (!draftText.trim()) {
      Alert.alert('Add text', 'Type the subtitle text for this line before marking its end.');
      return;
    }
    if (draftStartMs === null || draftEndMs === null) {
      Alert.alert('Mark start and end', 'Mark the start and end of this line before adding it.');
      return;
    }
    if (draftEndMs <= draftStartMs) {
      Alert.alert('Invalid timing', 'The end of a line must come after its start. Keep the video playing forward before marking the end.');
      return;
    }

    addLine({
      text: draftText.trim(),
      translations: draftTranslations.filter((t) => t.text.trim() && t.languageId !== null),
      start_time_ms: draftStartMs,
      end_time_ms: draftEndMs,
    });
    setDraftText('');
    setDraftTranslations(makeDefaultTranslations());
    setDraftStartMs(null);
    setDraftEndMs(null);
  }, [addLine, draftText, draftTranslations, draftStartMs, draftEndMs, makeDefaultTranslations]);


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

  const handleAddLineTranslation = useCallback(
    (localId: string) => {
      const line = lines.find((l) => l.localId === localId);
      if (!line) return;
      const usedLanguageIds = new Set(line.translations.map((t) => t.languageId));
      const nextLanguageId = LANGUAGE_OPTIONS.find((l) => l.id !== languageId && !usedLanguageIds.has(l.id))?.id ?? null;
      if (nextLanguageId === null) return;
      updateLine(localId, {
        translations: [...line.translations, { localId: makeTranslationLocalId(), text: '', languageId: nextLanguageId }],
      });
    },
    [lines, languageId, updateLine]
  );

  const handleChangeLineTranslationText = useCallback(
    (localId: string, translationLocalId: string, text: string) => {
      const line = lines.find((l) => l.localId === localId);
      if (!line) return;
      updateLine(localId, {
        translations: line.translations.map((t) => (t.localId === translationLocalId ? { ...t, text } : t)),
      });
    },
    [lines, updateLine]
  );

  const handleChangeLineTranslationLanguage = useCallback(
    (localId: string, translationLocalId: string, langId: number) => {
      const line = lines.find((l) => l.localId === localId);
      if (!line) return;
      updateLine(localId, {
        translations: line.translations.map((t) => (t.localId === translationLocalId ? { ...t, languageId: langId } : t)),
      });
    },
    [lines, updateLine]
  );

  const handleRemoveLineTranslation = useCallback(
    (localId: string, translationLocalId: string) => {
      const line = lines.find((l) => l.localId === localId);
      if (!line) return;
      updateLine(localId, {
        translations: line.translations.filter((t) => t.localId !== translationLocalId),
      });
    },
    [lines, updateLine]
  );

  const handlePublish = useCallback(async () => {
    if (!videoAsset || !languageId) return;

    setIsPublishing(true);
    setProgress(0);

    try {
      const response = await createReel(
        {
          video: videoAsset,
          thumbnail: thumbnailAsset,
          title: title.trim() || null,
          languageId,
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
            // Mirrors get_sentence_translation's per-viewer lookup: once this
            // reel is actually fetched, the server resolves the translation
            // matching the viewer's own native language - so for this
            // optimistic preview (viewed by the publisher themselves) we
            // pick the same one from what was just typed in.
            translation: line.translations.find((t) => t.languageId === nativeLanguageId)?.text || '',
            tokens: [],
          })),
        },
      };

      prependReel(optimisticReel);
      // Mirrors the shape authController.js/getLatestByUser returns at
      // login, so the profile screen's "My Reels" grid can render this
      // straight away instead of waiting for the next login's fetch.
      prependUserReel({
        id: response.reel.id,
        url: response.reel.url,
        thumbnail_url: response.reel.thumbnail_url || null,
        title: response.reel.title,
        duration: response.reel.duration,
        language_id: languageId,
        created_at: response.reel.created_at,
      });
      reset();
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      Alert.alert('Publish failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  }, [videoAsset, thumbnailAsset, languageId, nativeLanguageId, title, lines, userProfile, prependReel, prependUserReel, reset, router]);

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
          draftTranslations={draftTranslations}
          onAddTranslation={handleAddDraftTranslation}
          onChangeTranslationText={handleChangeDraftTranslationText}
          onChangeTranslationLanguage={handleChangeDraftTranslationLanguage}
          onRemoveTranslation={handleRemoveDraftTranslation}
          reelLanguageId={languageId}
          languageOptions={LANGUAGE_OPTIONS}
          draftStartMs={draftStartMs}
          draftEndMs={draftEndMs}
          onMarkStart={handleMarkStart}
          onMarkEnd={handleMarkEnd}
          onRestartRecording={handleRestartRecording}
          onAddLine={handleAddLine}
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
          onAddTranslation={handleAddLineTranslation}
          onChangeTranslationText={handleChangeLineTranslationText}
          onChangeTranslationLanguage={handleChangeLineTranslationLanguage}
          onRemoveTranslation={handleRemoveLineTranslation}
          reelLanguageId={languageId}
          languageOptions={LANGUAGE_OPTIONS}
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
