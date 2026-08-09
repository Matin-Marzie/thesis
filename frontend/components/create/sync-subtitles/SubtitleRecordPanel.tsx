import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { formatMs } from './formatMs';

interface SubtitleRecordPanelProps {
  isDark: boolean;
  lineCount: number;
  draftText: string;
  onChangeDraftText: (text: string) => void;
  draftTranslation: string;
  onChangeDraftTranslation: (text: string) => void;
  draftStartMs: number | null;
  onMarkStart: () => void;
  onMarkEnd: () => void;
  onUndoLast: () => void;
  onReview: () => void;
}

export function SubtitleRecordPanel({
  isDark,
  lineCount,
  draftText,
  onChangeDraftText,
  draftTranslation,
  onChangeDraftTranslation,
  draftStartMs,
  onMarkStart,
  onMarkEnd,
  onUndoLast,
  onReview,
}: SubtitleRecordPanelProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.recordPanel}>
      <Text style={[styles.sectionLabel, isDark && { color: DARK_COLORS.textSecondary }]}>
        {lineCount} line{lineCount === 1 ? '' : 's'} captured
      </Text>

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Subtitle text"
        placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
        value={draftText}
        onChangeText={onChangeDraftText}
        multiline
      />
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Translation (optional)"
        placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
        value={draftTranslation}
        onChangeText={onChangeDraftTranslation}
        multiline
      />

      {draftStartMs === null ? (
        <Pressable style={styles.primaryButton} onPress={onMarkStart}>
          <Text style={styles.primaryButtonText}>Mark Start</Text>
        </Pressable>
      ) : (
        <View>
          <Text style={[styles.hint, isDark && { color: DARK_COLORS.textMuted }]}>
            Start marked at {formatMs(draftStartMs)} — keep playing, then mark the end.
          </Text>
          <Pressable style={styles.primaryButton} onPress={onMarkEnd}>
            <Text style={styles.primaryButtonText}>Mark End &amp; Add Line</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.row}>
        <Pressable style={styles.secondaryButton} onPress={onUndoLast} disabled={!lineCount}>
          <Text style={[styles.secondaryButtonText, !lineCount && styles.disabledText]}>Undo Last Line</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, !lineCount && styles.disabledButton]}
          onPress={onReview}
          disabled={!lineCount}
        >
          <Text style={[styles.secondaryButtonText, !lineCount && styles.disabledText]}>Review &amp; Finish</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  recordPanel: { flex: 1, padding: 16 },
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
});
