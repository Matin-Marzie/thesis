import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/App';
import type { DraftSubtitleLine } from '@/types/createReel';
import { SubtitleReviewRow } from './SubtitleReviewRow';

interface LanguageOption {
  id: number;
  name: string;
  flag: string;
}

interface SubtitleReviewPanelProps {
  isDark: boolean;
  lines: DraftSubtitleLine[];
  currentReviewIndex: number;
  isPublishing: boolean;
  progress: number;
  onSeekToLine: (line: DraftSubtitleLine) => void;
  onChangeText: (localId: string, text: string) => void;
  onAddTranslation: (localId: string) => void;
  onChangeTranslationText: (localId: string, translationLocalId: string, text: string) => void;
  onChangeTranslationLanguage: (localId: string, translationLocalId: string, languageId: number) => void;
  onRemoveTranslation: (localId: string, translationLocalId: string) => void;
  reelLanguageId: number | null;
  languageOptions: LanguageOption[];
  onNudge: (line: DraftSubtitleLine, field: 'start_time_ms' | 'end_time_ms', deltaMs: number) => void;
  onRemoveLine: (localId: string) => void;
  onAddAnotherLine: () => void;
  onPublish: () => void;
}

export function SubtitleReviewPanel({
  isDark,
  lines,
  currentReviewIndex,
  isPublishing,
  progress,
  onSeekToLine,
  onChangeText,
  onAddTranslation,
  onChangeTranslationText,
  onChangeTranslationLanguage,
  onRemoveTranslation,
  reelLanguageId,
  languageOptions,
  onNudge,
  onRemoveLine,
  onAddAnotherLine,
  onPublish,
}: SubtitleReviewPanelProps) {
  const listRef = useRef<FlatList<DraftSubtitleLine>>(null);

  // Keep the currently-playing line centered as the video advances. Rows
  // have variable height (multiline text, a variable number of
  // translations), so scrollToIndex can't rely on an exact getItemLayout -
  // onScrollToIndexFailed below handles the case where it misjudges the
  // offset for a row that hasn't rendered/measured yet.
  useEffect(() => {
    if (currentReviewIndex < 0 || currentReviewIndex >= lines.length) return;
    listRef.current?.scrollToIndex({ index: currentReviewIndex, viewPosition: 0.5, animated: true });
  }, [currentReviewIndex, lines.length]);

  const handleScrollToIndexFailed = (info: { index: number; averageItemLength: number }) => {
    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
    setTimeout(() => {
      if (info.index >= 0 && info.index < lines.length) {
        listRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.5, animated: true });
      }
    }, 100);
  };

  return (
    <View style={styles.reviewPanel}>
      <FlatList
        ref={listRef}
        data={lines}
        keyExtractor={(item) => item.localId}
        renderItem={({ item, index }) => (
          <SubtitleReviewRow
            line={item}
            isDark={isDark}
            isActive={index === currentReviewIndex}
            onPress={onSeekToLine}
            onChangeText={onChangeText}
            onAddTranslation={onAddTranslation}
            onChangeTranslationText={onChangeTranslationText}
            onChangeTranslationLanguage={onChangeTranslationLanguage}
            onRemoveTranslation={onRemoveTranslation}
            reelLanguageId={reelLanguageId}
            languageOptions={languageOptions}
            onNudge={onNudge}
            onRemove={onRemoveLine}
          />
        )}
        contentContainerStyle={styles.reviewListContent}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />

      <View style={styles.row}>
        <Pressable style={styles.secondaryButton} onPress={onAddAnotherLine} disabled={isPublishing}>
          <Text style={styles.secondaryButtonText}>Add Another Line</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onPublish} disabled={isPublishing}>
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
  );
}

const styles = StyleSheet.create({
  reviewPanel: { flex: 1, padding: 16 },
  reviewListContent: { paddingBottom: 12 },
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
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  publishingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
