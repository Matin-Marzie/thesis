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
import { Word } from '../../types/dialogue';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WordMeaningPopupProps {
  word: Word | null;
  translation: string;
  isVisible: boolean;
  onClose: () => void;
  onAddToVocabulary: () => void;
  isPlayingAudio?: boolean;
}

export const WordMeaningPopup = ({
  word,
  translation,
  isVisible,
  onClose,
  onAddToVocabulary,
  isPlayingAudio = false,
}: WordMeaningPopupProps) => {
  if (!word || !isVisible) return null;

  return (
    <Modal
      visible={isVisible && !!word}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.popupContainer} onPress={(e) => e.stopPropagation()}>
          {/* Word header */}
          <View style={styles.header}>
            <View style={styles.wordSection}>
              <Text style={styles.wordText}>{word.written_form}</Text>
              <Text style={styles.posText}>{word.part_of_speech}</Text>
            </View>
            {word.audio_url && (
              <Pressable
                style={[styles.audioButton, isPlayingAudio && styles.audioButtonActive]}
                onPress={() => {
                  // Audio will be handled by parent component
                }}
              >
                <FontAwesome
                  name="volume-up"
                  size={20}
                  color={isPlayingAudio ? '#2563eb' : '#666'}
                />
              </Pressable>
            )}
          </View>

          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{word.level}</Text>
          </View>

          {/* Translation */}
          <View style={styles.translationSection}>
            <Text style={styles.translationLabel}>Translation</Text>
            <Text style={styles.translationText}>{translation}</Text>
          </View>

          {/* Add to vocabulary button */}
          <Pressable
            style={styles.addButton}
            onPress={() => {
              onAddToVocabulary();
              onClose();
            }}
          >
            <FontAwesome name="bookmark" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add to Vocabulary</Text>
          </Pressable>

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color="#666" />
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
  posText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  audioButton: {
    padding: 8,
    marginLeft: 12,
  },
  audioButtonActive: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
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
  translationSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 6,
    textTransform: 'uppercase',
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
