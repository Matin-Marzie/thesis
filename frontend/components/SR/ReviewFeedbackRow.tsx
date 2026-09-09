import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TouchableOpacity from '@/components/TouchableOpacity';
import { Rating } from '@/utils/fsrs';

export const REVIEW_RATING_OPTIONS: Array<{ label: string; rating: Rating; color: string }> = [
  { label: 'Forgot', rating: Rating.Again, color: '#E05555' },
  { label: 'Hard', rating: Rating.Hard, color: '#E0A020' },
  { label: 'Good', rating: Rating.Good, color: '#4CAF50' },
  { label: 'Easy', rating: Rating.Easy, color: '#1E9FFC' },
];

const DEFAULT_QUESTION = 'How well did you remember this word?';

export interface ReviewFeedbackRowProps {
  /** The word being reviewed. Renders nothing when null/undefined - lets
   * callers always mount this unconditionally and only supply a word once
   * there's a real FSRS review to grade (e.g. a due word this round). */
  word?: string | null;
  /** Prompt shown above the word. Defaults to a generic recall question;
   * override per screen if the context calls for different phrasing. Pass
   * null/'' to hide it entirely. */
  question?: string | null;
  /** Currently selected rating - controlled, like a native radio group. */
  value?: Rating | null;
  /** Called immediately when the user taps a rating - just updates the
   * selection, doesn't grade anything. Callers decide when to actually call
   * reviewWord() with the latest value (e.g. on their own "Collect"/submit
   * action), so switching your mind before then is free. */
  onChange: (rating: Rating) => void;
  /** Forwarded to TouchableOpacity for per-feature vibration tuning. */
  game?: string;
  style?: object;
}

/**
 * Word + Forgot/Hard/Good/Easy radio-style rating picker for grading an FSRS
 * spaced-repetition review. Shared across any game/exercise screen that
 * wants to let the player self-grade a review word - see WordOfWonders'
 * FinishScreen for the reference integration (word shown only when the
 * round was actually built on a real due word, graded once on Collect).
 */
export default function ReviewFeedbackRow({ word, question = DEFAULT_QUESTION, value = null, onChange, game, style }: ReviewFeedbackRowProps) {
  if (!word) return null;

  return (
    <View style={[styles.container, style]}>
      {question ? <Text style={styles.question}>{question}</Text> : null}
      <Text style={styles.word}>{word.toUpperCase()}</Text>
      <View style={styles.ratingRow}>
        {REVIEW_RATING_OPTIONS.map(({ label, rating, color }) => {
          const selected = value === rating;
          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.ratingButton,
                { borderColor: color },
                selected && { backgroundColor: color },
                value != null && !selected && styles.ratingButtonDimmed,
              ]}
              onPress={() => onChange(rating)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              game={game}
            >
              <Text style={[styles.ratingButtonText, { color: selected ? '#fff' : color }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f7f9fc',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
    marginBottom: 6,
  },
  word: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  ratingButtonDimmed: {
    opacity: 0.4,
  },
  ratingButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
