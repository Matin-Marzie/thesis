import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import type { DraftSubtitleLine } from '@/types/createReel';
import { formatMs } from './formatMs';

interface LanguageOption {
  id: number;
  name: string;
  flag: string;
}

interface SubtitleReviewRowProps {
  line: DraftSubtitleLine;
  isDark: boolean;
  isActive: boolean;
  onPress: (line: DraftSubtitleLine) => void;
  onChangeText: (localId: string, text: string) => void;
  onAddTranslation: (localId: string) => void;
  onChangeTranslationText: (localId: string, translationLocalId: string, text: string) => void;
  onChangeTranslationLanguage: (localId: string, translationLocalId: string, languageId: number) => void;
  onRemoveTranslation: (localId: string, translationLocalId: string) => void;
  reelLanguageId: number | null;
  languageOptions: LanguageOption[];
  onNudge: (line: DraftSubtitleLine, field: 'start_time_ms' | 'end_time_ms', deltaMs: number) => void;
  onRemove: (localId: string) => void;
}

export function SubtitleReviewRow({
  line,
  isDark,
  isActive,
  onPress,
  onChangeText,
  onAddTranslation,
  onChangeTranslationText,
  onChangeTranslationLanguage,
  onRemoveTranslation,
  reelLanguageId,
  languageOptions,
  onNudge,
  onRemove,
}: SubtitleReviewRowProps) {
  const usedLanguageIds = line.translations.map((t) => t.languageId);
  const canAddTranslation = languageOptions.some(
    (l) => l.id !== reelLanguageId && !usedLanguageIds.includes(l.id)
  );

  return (
    <Pressable
      style={[styles.reviewRow, !isActive && isDark && { borderColor: DARK_COLORS.border }, isActive && styles.reviewRowActive]}
      onPress={() => onPress(line)}
    >
      <TextInput
        style={[styles.reviewText, isDark && { color: DARK_COLORS.text, borderColor: DARK_COLORS.border }]}
        value={line.text}
        onChangeText={(text) => onChangeText(line.localId, text)}
        multiline
      />

      {line.translations.map((translation) => {
        const availableLanguages = languageOptions.filter(
          (l) => l.id !== reelLanguageId && (l.id === translation.languageId || !usedLanguageIds.includes(l.id))
        );
        const selectedLanguage = languageOptions.find((l) => l.id === translation.languageId);
        return (
          <View key={translation.localId} style={styles.translationRow}>
            <TextInput
              style={[styles.reviewTranslation, styles.translationInput, isDark && { color: DARK_COLORS.textSecondary, borderColor: DARK_COLORS.border }]}
              value={translation.text}
              onChangeText={(text) => onChangeTranslationText(line.localId, translation.localId, text)}
              placeholder={selectedLanguage ? `${selectedLanguage.flag} Translation (optional)` : 'Translation (optional)'}
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              multiline
            />
            <View style={[styles.miniPickerContainer, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}>
              <Picker
                selectedValue={translation.languageId}
                onValueChange={(value) => onChangeTranslationLanguage(line.localId, translation.localId, Number(value))}
                style={[styles.miniPicker, isDark && { color: DARK_COLORS.text }]}
                itemStyle={styles.miniPickerItem}
                dropdownIconColor={isDark ? DARK_COLORS.text : '#333'}
                mode="dropdown"
              >
                {availableLanguages.map((lang) => (
                  <Picker.Item
                    key={lang.id}
                    label={lang.flag}
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
            <Pressable onPress={() => onRemoveTranslation(line.localId, translation.localId)} style={styles.removeTranslationButton}>
              <FontAwesome name="close" size={14} color="#c0392b" />
            </Pressable>
          </View>
        );
      })}

      {canAddTranslation && (
        <Pressable onPress={() => onAddTranslation(line.localId)} style={styles.addTranslationRow}>
          <FontAwesome name="plus" size={12} color={PRIMARY_COLOR} />
          <Text style={styles.addTranslationText}>Add translation</Text>
        </Pressable>
      )}

      <View style={styles.timingRow}>
        <View style={styles.timingControl}>
          <Text style={styles.timingLabel}>Start {formatMs(line.start_time_ms)}</Text>
          <View style={styles.nudgeRow}>
            <Pressable onPress={() => onNudge(line, 'start_time_ms', -100)} style={[styles.nudgeButton, isDark && styles.nudgeButtonDark]}>
              <Text style={[styles.nudgeButtonText, isDark && { color: DARK_COLORS.text }]}>-100ms</Text>
            </Pressable>
            <Pressable onPress={() => onNudge(line, 'start_time_ms', 100)} style={[styles.nudgeButton, isDark && styles.nudgeButtonDark]}>
              <Text style={[styles.nudgeButtonText, isDark && { color: DARK_COLORS.text }]}>+100ms</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.timingControl}>
          <Text style={styles.timingLabel}>End {formatMs(line.end_time_ms)}</Text>
          <View style={styles.nudgeRow}>
            <Pressable onPress={() => onNudge(line, 'end_time_ms', -100)} style={[styles.nudgeButton, isDark && styles.nudgeButtonDark]}>
              <Text style={[styles.nudgeButtonText, isDark && { color: DARK_COLORS.text }]}>-100ms</Text>
            </Pressable>
            <Pressable onPress={() => onNudge(line, 'end_time_ms', 100)} style={[styles.nudgeButton, isDark && styles.nudgeButtonDark]}>
              <Text style={[styles.nudgeButtonText, isDark && { color: DARK_COLORS.text }]}>+100ms</Text>
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
  reviewText: {
    fontSize: 15,
    fontWeight: '600',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
  },
  reviewTranslation: {
    fontSize: 13,
    color: '#666',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
  },
  translationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 },
  translationInput: { flex: 1 },
  miniPickerContainer: {
    width: 48,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  miniPicker: { color: '#333' },
  miniPickerItem: { fontSize: 12 },
  removeTranslationButton: { padding: 4 },
  addTranslationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  addTranslationText: { color: PRIMARY_COLOR, fontWeight: '600', fontSize: 12 },
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
  nudgeButtonDark: {
    borderColor: DARK_COLORS.border,
    backgroundColor: DARK_COLORS.surface,
  },
  nudgeButtonText: { fontSize: 11 },
  errorText: { color: '#c0392b', fontSize: 12, marginTop: 6 },
  deleteRowButton: { position: 'absolute', top: 10, right: 10 },
});
