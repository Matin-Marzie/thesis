import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { useUserReels } from '@/context/UserReelsContext';
import { updateReelDialogue } from '@/api/reelCreation';
import { SubtitleVideoPreview } from '@/components/create/sync-subtitles/SubtitleVideoPreview';
import { SubtitleReviewPanel } from '@/components/create/sync-subtitles/SubtitleReviewPanel';
import type { DraftSubtitleLine, DraftTranslation } from '@/types/createReel';
import type { Reel } from '@/types/dialogue';

const LANGUAGE_OPTIONS = Object.values(LANGUAGES_META);
const LANGUAGE_ID_BY_CODE: Record<string, number> = Object.fromEntries(
  LANGUAGE_OPTIONS.map((l) => [l.code, l.id])
);

const makeLineLocalId = () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const makeTranslationLocalId = () => `translation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Converts an already-published reel's dialogue sentences (server shape -
// one `translations` entry per language, keyed by language_code) into the
// flat DraftSubtitleLine/DraftTranslation shape SubtitleReviewPanel edits.
// The inverse of the `lines.map` reelCreation.js's updateReelDialogue sends.
const linesFromReel = (reel: Reel): DraftSubtitleLine[] => {
  if (!reel.dialogue) return [];
  return reel.dialogue.sentences
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((sentence) => ({
      localId: makeLineLocalId(),
      text: sentence.text,
      start_time_ms: sentence.start_time_ms,
      end_time_ms: sentence.end_time_ms,
      translations: (sentence.translations || [])
        .map((t): DraftTranslation | null => {
          const languageId = LANGUAGE_ID_BY_CODE[t.language_code];
          return languageId ? { localId: makeTranslationLocalId(), text: t.text, languageId } : null;
        })
        .filter((t): t is DraftTranslation => t !== null),
    }));
};

// Edit-existing-reel counterpart to (tabs)/create/sync-subtitles.tsx - reuses
// SubtitleReviewPanel/SubtitleVideoPreview directly instead of the record
// phase, since there's no new footage to mark start/end on: lines start
// seeded from the reel's current dialogue and are edited/nudged in place.
export default function EditSubtitlesScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userReels, updateUserReel } = useUserReels();

  const reel = useMemo(
    () => userReels.find((r: Reel) => r.id.toString() === id) || null,
    [userReels, id]
  );

  const [lines, setLines] = useState<DraftSubtitleLine[]>(() => (reel ? linesFromReel(reel) : []));
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const player = useVideoPlayer(reel?.url ?? null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    player.timeUpdateEventInterval = 0.1;
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      setCurrentTimeMs((currentTime || 0) * 1000);
    });
    return () => sub.remove();
  }, [player]);

  const updateLine = useCallback((localId: string, updates: Partial<Omit<DraftSubtitleLine, 'localId'>>) => {
    setLines((prev) => prev.map((line) => (line.localId === localId ? { ...line, ...updates } : line)));
  }, []);

  const removeLine = useCallback((localId: string) => {
    setLines((prev) => prev.filter((line) => line.localId !== localId));
  }, []);

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

  const reelLanguageId = reel?.language?.id ?? reel?.language_id ?? null;

  const handleAddLineTranslation = useCallback(
    (localId: string) => {
      const line = lines.find((l) => l.localId === localId);
      if (!line) return;
      const usedLanguageIds = new Set(line.translations.map((t) => t.languageId));
      const nextLanguageId =
        LANGUAGE_OPTIONS.find((l) => l.id !== reelLanguageId && !usedLanguageIds.has(l.id))?.id ?? null;
      if (nextLanguageId === null) return;
      updateLine(localId, {
        translations: [...line.translations, { localId: makeTranslationLocalId(), text: '', languageId: nextLanguageId }],
      });
    },
    [lines, reelLanguageId, updateLine]
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

  // No record panel here - a new line starts blank at the video's current
  // position and gets shaped with the text box + nudge buttons below.
  const handleAddAnotherLine = useCallback(() => {
    const startMs = Math.round(currentTimeMs);
    setLines((prev) => [
      ...prev,
      { localId: makeLineLocalId(), text: '', translations: [], start_time_ms: startMs, end_time_ms: startMs + 2000 },
    ]);
  }, [currentTimeMs]);

  const handleSave = useCallback(async () => {
    if (!reel) return;
    setIsSaving(true);
    try {
      const response = await updateReelDialogue(reel.id, lines);
      updateUserReel(response.reel);
      router.back();
    } catch (error: any) {
      Alert.alert('Save failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [reel, lines, updateUserReel, router]);

  const handlePressSave = useCallback(() => {
    if (lines.length === 0) {
      Alert.alert('Add a line', 'A reel needs at least one subtitle line.');
      return;
    }
    const hasInvalid = lines.some((l) => l.end_time_ms <= l.start_time_ms || !l.text.trim());
    if (hasInvalid) {
      Alert.alert('Fix line timings', 'Every line needs text and an end time after its start time.');
      return;
    }
    // Mirrors reels-service's SubtitleLineIn.check_line - catches this
    // before the request round-trip, including duplicates already baked
    // into a line's translations from how it loaded (e.g. legacy data).
    const duplicateIndex = lines.findIndex((l) => {
      const languageIds = l.translations.filter((t) => t.text.trim()).map((t) => t.languageId);
      return new Set(languageIds).size !== languageIds.length;
    });
    if (duplicateIndex !== -1) {
      Alert.alert(
        'Fix a translation',
        `Line ${duplicateIndex + 1} has two translations in the same language. Remove or change one of them.`
      );
      return;
    }
    handleSave();
  }, [lines, handleSave]);

  if (!reel) {
    return (
      <View style={[styles.loading, isDark && { backgroundColor: DARK_COLORS.background }]}>
        <ActivityIndicator color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <SubtitleVideoPreview player={player} />
      <SubtitleReviewPanel
        isDark={isDark}
        lines={lines}
        currentReviewIndex={currentReviewIndex}
        isPublishing={isSaving}
        progress={0}
        showProgressPercent={false}
        publishLabel="Save"
        onSeekToLine={handleSeekToLine}
        onChangeText={handleChangeLineText}
        onAddTranslation={handleAddLineTranslation}
        onChangeTranslationText={handleChangeLineTranslationText}
        onChangeTranslationLanguage={handleChangeLineTranslationLanguage}
        onRemoveTranslation={handleRemoveLineTranslation}
        reelLanguageId={reelLanguageId}
        languageOptions={LANGUAGE_OPTIONS}
        onNudge={nudge}
        onRemoveLine={removeLine}
        onAddAnotherLine={handleAddAnotherLine}
        onPublish={handlePressSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
});
