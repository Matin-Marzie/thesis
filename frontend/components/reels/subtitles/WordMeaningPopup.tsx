import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Word } from '../../../types/dialogue';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import { useDictionaryContext } from '@/context/DictionaryContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { VOCABULARY_ACTIONS } from '@/hooks/useVocabulary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WordMeaningPopupProps {
  word: Word | null;
  isVisible: boolean;
  onClose: () => void;
}

export const WordMeaningPopup = ({
  word,
  isVisible,
  onClose,
}: WordMeaningPopupProps) => {
  const isDark = useColorScheme() === 'dark';
  const { getWordsByWrittenForm } = useDictionaryContext();
  const { userVocabulary, vocabularyDispatch } = useVocabularyContext();
  if (!word || !isVisible) return null;

  // O(1) bucket lookup by written_form instead of scanning the whole
  // dictionary (the lookup normalizes written_form the same way the bucket
  // keys were built, so case/diacritic differences don't cause a miss).
  // Most buckets hold a single entry; when a written_form has homographs
  // (same spelling, different word id - e.g. different meaning or part of
  // speech), disambiguate by id - same pattern as Wordle/WordOfWonders.
  // dictionary.words comes from the Node API, where node-postgres returns
  // bigint columns as strings; word.id comes from reels-service (Python),
  // which serializes it as a JSON number - coerce both sides to compare.
  const candidates = getWordsByWrittenForm(word.written_form);
  const dictionaryEntry = candidates.length > 1
    ? candidates.find((entry: { id: unknown }) => String(entry.id) === String(word.id)) ?? candidates[0]
    : candidates[0];
  const translation = dictionaryEntry?.translations?.join(', ') || '';

  // userVocabulary is keyed by the dictionary word's own id, not the reels
  // token's id (same id-source distinction as the translation lookup above)
  // - use the resolved dictionaryEntry, not word.id.
  const isInVocabulary = dictionaryEntry ? !!userVocabulary[dictionaryEntry.id] : false;
  const handleToggleVocabulary = () => {
    if (!dictionaryEntry) return;
    vocabularyDispatch({
      type: isInVocabulary ? VOCABULARY_ACTIONS.REMOVE : VOCABULARY_ACTIONS.ADD,
      payload: { wordId: dictionaryEntry.id },
    });
  };

  return (
    <Modal
      visible={isVisible && !!word}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.popupContainer, isDark && { backgroundColor: DARK_COLORS.surface }]} onPress={(e) => e.stopPropagation()}>
          {/* Word header */}
          <View style={styles.header}>
            <View style={styles.wordSection}>
              <Text style={[styles.wordText, isDark && { color: DARK_COLORS.text }]}>{word.written_form}</Text>
              <Text style={[styles.translationText, isDark && { color: DARK_COLORS.text }]}>{translation}</Text>
            </View>
          </View>

          {/* Level badge */}
          <View style={[styles.levelBadge, isDark && { backgroundColor: '#312e81' }]}>
            <Text style={[styles.levelText, isDark && { color: '#c7d2fe' }]}>{dictionaryEntry?.level}</Text>
          </View>

          {/* Add/remove vocabulary button */}
          <Pressable
            style={[styles.addButton, isInVocabulary && styles.addButtonActive]}
            onPress={handleToggleVocabulary}
          >
            <FontAwesome name={isInVocabulary ? 'bookmark' : 'bookmark-o'} size={18} color="#fff" />
            <Text style={styles.addButtonText}>
              {isInVocabulary ? 'Remove from Vocabulary' : 'Add to Vocabulary'}
            </Text>
          </Pressable>

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color={isDark ? DARK_COLORS.textSecondary : '#666'} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wordSection: {
    flex: 1,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  translationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addButtonActive: {
    backgroundColor: '#e74c3c',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});
