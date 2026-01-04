import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent: '#787c7e',
  empty: '#d3d6da',
  border: '#999',
};

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function Keyboard({
  onKeyPress,
  guesses,
  secretWord,
  getLetterColor,
  disabled,
}) {
  const getKeyColor = useMemo(() => {
    return (letter) => {
      let bestState = COLORS.empty;

      for (let guess of guesses) {
        for (let i = 0; i < guess.length; i++) {
          if (guess[i] === letter) {
            const color = getLetterColor(letter, i, guess);
            
            // Update to best state: correct > present > absent
            if (color === COLORS.correct) {
              return COLORS.correct;
            }
            if (color === COLORS.present && bestState !== COLORS.correct) {
              bestState = COLORS.present;
            }
            if (color === COLORS.absent && bestState === COLORS.empty) {
              bestState = COLORS.absent;
            }
          }
        }
      }
      
      return bestState;
    };
  }, [guesses, getLetterColor]);

  const renderKey = (letter) => {
    const backgroundColor = getKeyColor(letter);
    const isDisabled = disabled || (getKeyColor(letter) === COLORS.empty && !letter);

    return (
      <TouchableOpacity
        key={letter}
        onPress={() => onKeyPress(letter)}
        disabled={isDisabled}
        style={[
          styles.key,
          {
            backgroundColor,
            opacity: isDisabled && !letter ? 0.5 : 1,
          },
        ]}
      >
        <Text style={styles.keyText}>{letter}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.keyboard}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {rowIndex === 2 && <View style={styles.spacer} />}
          {row.map((letter) => renderKey(letter))}
          {rowIndex === 2 && <View style={styles.spacer} />}
        </View>
      ))}
      <View style={[styles.row, styles.specialKeysRow]}>
        <TouchableOpacity
          onPress={() => onKeyPress('BACKSPACE')}
          disabled={disabled}
          style={[styles.specialKey, { backgroundColor: COLORS.empty }]}
        >
          <Ionicons name="backspace-outline" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onKeyPress('ENTER')}
          disabled={disabled}
          style={[styles.specialKey, { backgroundColor: COLORS.correct }]}
        >
          <Text style={[styles.keyText, { color: '#fff' }]}>ENTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  specialKeysRow: {
    marginBottom: 0,
  },
  key: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 4,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialKey: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  spacer: {
    width: 32,
  },
});
