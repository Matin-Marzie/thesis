import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import type { DraftSubtitleLine } from '@/types/createReel';
import { formatMs } from './formatMs';

interface SubtitleReviewRowProps {
  line: DraftSubtitleLine;
  isDark: boolean;
  isActive: boolean;
  onPress: (line: DraftSubtitleLine) => void;
  onChangeText: (localId: string, text: string) => void;
  onChangeTranslation: (localId: string, translation: string) => void;
  onNudge: (line: DraftSubtitleLine, field: 'start_time_ms' | 'end_time_ms', deltaMs: number) => void;
  onRemove: (localId: string) => void;
}

export function SubtitleReviewRow({
  line,
  isDark,
  isActive,
  onPress,
  onChangeText,
  onChangeTranslation,
  onNudge,
  onRemove,
}: SubtitleReviewRowProps) {
  return (
    <Pressable
      style={[styles.reviewRow, isActive && styles.reviewRowActive, isDark && { borderColor: DARK_COLORS.border }]}
      onPress={() => onPress(line)}
    >
      <TextInput
        style={[styles.reviewText, isDark && { color: DARK_COLORS.text }]}
        value={line.text}
        onChangeText={(text) => onChangeText(line.localId, text)}
        multiline
      />
      <TextInput
        style={[styles.reviewTranslation, isDark && { color: DARK_COLORS.textSecondary }]}
        value={line.translation}
        onChangeText={(translation) => onChangeTranslation(line.localId, translation)}
        placeholder="Translation (optional)"
        placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
        multiline
      />

      <View style={styles.timingRow}>
        <View style={styles.timingControl}>
          <Text style={styles.timingLabel}>Start {formatMs(line.start_time_ms)}</Text>
          <View style={styles.nudgeRow}>
            <Pressable onPress={() => onNudge(line, 'start_time_ms', -100)} style={styles.nudgeButton}>
              <Text style={styles.nudgeButtonText}>-100ms</Text>
            </Pressable>
            <Pressable onPress={() => onNudge(line, 'start_time_ms', 100)} style={styles.nudgeButton}>
              <Text style={styles.nudgeButtonText}>+100ms</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.timingControl}>
          <Text style={styles.timingLabel}>End {formatMs(line.end_time_ms)}</Text>
          <View style={styles.nudgeRow}>
            <Pressable onPress={() => onNudge(line, 'end_time_ms', -100)} style={styles.nudgeButton}>
              <Text style={styles.nudgeButtonText}>-100ms</Text>
            </Pressable>
            <Pressable onPress={() => onNudge(line, 'end_time_ms', 100)} style={styles.nudgeButton}>
              <Text style={styles.nudgeButtonText}>+100ms</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {line.end_time_ms <= line.start_time_ms && <Text style={styles.errorText}>End must be after start</Text>}

      <Pressable onPress={() => onRemove(line.localId)} style={styles.deleteRowButton}>
        <FontAwesome name="trash" size={16} color="#c0392b" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
