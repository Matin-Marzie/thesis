import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { formatMs } from './formatMs';
import type { DraftTranslation } from '@/types/createReel';

interface LanguageOption {
  id: number;
  name: string;
  flag: string;
}

interface SubtitleRecordPanelProps {
  isDark: boolean;
  lineCount: number;
  draftText: string;
  onChangeDraftText: (text: string) => void;
  draftTranslations: DraftTranslation[];
  onAddTranslation: () => void;
  onChangeTranslationText: (translationLocalId: string, text: string) => void;
  onChangeTranslationLanguage: (translationLocalId: string, languageId: number) => void;
  onRemoveTranslation: (translationLocalId: string) => void;
  reelLanguageId: number | null;
  languageOptions: LanguageOption[];
  draftStartMs: number | null;
  draftEndMs: number | null;
  onMarkStart: () => void;
  onMarkEnd: () => void;
  onRestartRecording: () => void;
  onAddLine: () => void;
  onUndoLast: () => void;
  onReview: () => void;
}

export function SubtitleRecordPanel({
  isDark,
  lineCount,
  draftText,
  onChangeDraftText,
  draftTranslations,
  onAddTranslation,
  onChangeTranslationText,
  onChangeTranslationLanguage,
  onRemoveTranslation,
  reelLanguageId,
  languageOptions,
  draftStartMs,
  draftEndMs,
  onMarkStart,
  onMarkEnd,
  onRestartRecording,
  onAddLine,
  onUndoLast,
  onReview,
}: SubtitleRecordPanelProps) {
  const canAddLine = draftStartMs !== null && draftEndMs !== null && draftEndMs > draftStartMs;
  const usedLanguageIds = draftTranslations.map((t) => t.languageId);
  const canAddTranslation = languageOptions.some(
    (l) => l.id !== reelLanguageId && !usedLanguageIds.includes(l.id)
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.recordPanel}>
      {/* we wrap the content in a pressable area to dismiss the keyboard when tapping outside of text inputs */}
      <Pressable style={[styles.dismissArea, styles.spaceBetween]} onPress={Keyboard.dismiss}>
        <View>
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

          {draftTranslations.map((translation) => {
            const availableLanguages = languageOptions.filter(
              (l) => l.id !== reelLanguageId && (l.id === translation.languageId || !usedLanguageIds.includes(l.id))
            );
            const selectedLanguage = languageOptions.find((l) => l.id === translation.languageId);
            return (
              <View key={translation.localId} style={styles.translationRow}>
                <TextInput
                  style={[styles.input, styles.translationInput, isDark && styles.inputDark]}
                  placeholder={selectedLanguage ? `${selectedLanguage.flag} Translation (optional)` : 'Translation (optional)'}
                  placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
                  value={translation.text}
                  onChangeText={(text) => onChangeTranslationText(translation.localId, text)}
                  multiline
                />
                <View style={[styles.miniPickerContainer, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}>
                  <Picker
                    selectedValue={translation.languageId}
                    onValueChange={(value) => onChangeTranslationLanguage(translation.localId, Number(value))}
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
                <Pressable onPress={() => onRemoveTranslation(translation.localId)} style={styles.removeTranslationButton}>
                  <FontAwesome name="close" size={14} color="#c0392b" />
                </Pressable>
              </View>
            );
          })}

          {canAddTranslation && (
            <Pressable onPress={onAddTranslation} style={styles.addTranslationRow}>
              <FontAwesome name="plus" size={12} color={PRIMARY_COLOR} />
              <Text style={styles.addTranslationText}>Add translation</Text>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row' }}>
            <TextInput
              value={draftStartMs !== null ? formatMs(draftStartMs) : ''}
              placeholder="Start time"
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              editable={false}
              style={[styles.input, isDark && styles.inputDark]}
            />
            <TextInput
              value={draftEndMs !== null ? formatMs(draftEndMs) : ''}
              placeholder="End time"
              placeholderTextColor={isDark ? DARK_COLORS.textMuted : '#999'}
              editable={false}
              style={[styles.input, isDark && styles.inputDark]}
            />
          </View>

          <View style={styles.markRow}>
            {draftStartMs === null ? (
              <Pressable style={[styles.primaryButton, styles.grow]} onPress={onMarkStart}>
                <Text style={styles.primaryButtonText}>Mark Start</Text>
              </Pressable>
            ) : (
              <View style={styles.grow}>
                <Pressable style={styles.primaryButton} onPress={onMarkEnd}>
                  <Text style={styles.primaryButtonText}>Mark End</Text>
                </Pressable>
              </View>
            )}


            <Pressable style={styles.restartButton} onPress={onRestartRecording}>
              <FontAwesome name="rotate-left" size={16} color={'#fff'} />
            </Pressable>

          </View>

          <Pressable
            style={[styles.primaryButton, { marginTop: 10 }, !canAddLine && styles.disabledButton]}
            onPress={onAddLine}
            disabled={!canAddLine}
          >
            <Text style={styles.primaryButtonText}>Add Line</Text>
          </Pressable>
        </View>

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
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  recordPanel: { flex: 1, padding: 16 },
  dismissArea: { flex: 1 },
  spaceBetween: { justifyContent: 'space-between' },
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
  translationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  translationInput: { flex: 1 },
  miniPickerContainer: {
    width: 56,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  miniPicker: { color: '#333' },
  miniPickerItem: { fontSize: 13 },
  removeTranslationButton: { padding: 6, marginTop: 10 },
  addTranslationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -2, marginBottom: 10 },
  addTranslationText: { color: PRIMARY_COLOR, fontWeight: '600', fontSize: 13 },
  markRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  restartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
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
