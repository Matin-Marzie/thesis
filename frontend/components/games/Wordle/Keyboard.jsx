import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Vibration, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWordleConfig } from '@/constants/wordleConfig';

const COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent: '#787c7e',
  empty: '#d3d6da',
  border: '#999',
};

export default function Keyboard({
  onKeyPress,
  guesses,
  secretWord,
  getLetterColor,
  disabled,
  langCode = 'en',
}) {
  const { keyboardRows, isRTL } = useMemo(() => getWordleConfig(langCode), [langCode]);

  // Use compact sizing when any row has more than 10 keys
  const isCompact = keyboardRows.some(row => row.length > 10);

  // Fixed key width based on the longest row so all keys are the same size
  const keyWidth = useMemo(() => {
    const maxKeys = Math.max(...keyboardRows.map(r => r.length));
    const KEYBOARD_PADDING = 8; // paddingHorizontal: 4 on each side
    const GAP = 3;
    const screenWidth = Dimensions.get('window').width;
    return (screenWidth - KEYBOARD_PADDING - GAP * (maxKeys - 1)) / maxKeys;
  }, [keyboardRows]);

  const getKeyColor = useMemo(() => {
    return (letter) => {
      let bestState = COLORS.empty;

      for (const guess of guesses) {
        const chars = [...guess];
        for (let i = 0; i < chars.length; i++) {
          if (chars[i] === letter) {
            const color = getLetterColor(letter, i, guess);
            if (color === COLORS.correct) return COLORS.correct;
            if (color === COLORS.present && bestState !== COLORS.correct) bestState = COLORS.present;
            if (color === COLORS.absent && bestState === COLORS.empty) bestState = COLORS.absent;
          }
        }
      }

      return bestState;
    };
  }, [guesses, getLetterColor]);

  const pressKey = (letter) => {
    Vibration.vibrate(10);
    onKeyPress(letter);
  };

  const renderKey = (letter) => {
    const backgroundColor = getKeyColor(letter);
    return (
      <TouchableOpacity
        key={letter}
        onPress={() => pressKey(letter)}
        disabled={disabled}
        style={[
          styles.key,
          isCompact && styles.keyCompact,
          { backgroundColor, width: keyWidth },
        ]}
      >
        <Text style={[styles.keyText, isCompact && styles.keyTextCompact]}>{letter}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.keyboard}>
      {keyboardRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((letter) =>
            renderKey(letter)
          )}
        </View>
      ))}
      <View style={[styles.row, styles.specialKeysRow]}>
        <TouchableOpacity
          onPress={() => pressKey('BACKSPACE')}
          onLongPress={() => pressKey('CLEAR')}
          disabled={disabled}
          style={[styles.specialKey, { backgroundColor: COLORS.empty }]}
        >
          <Ionicons
            name="backspace-outline"
            size={32}
            color="#333"
            style={isRTL && { transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => pressKey('ENTER')}
          disabled={disabled}
          style={[styles.specialKey, { backgroundColor: COLORS.correct }]}
        >
          <Text style={styles.enterText}>ENTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 3,
  },
  specialKeysRow: {
    marginBottom: 0,
  },
  key: {
    paddingVertical: 10, // works for en, doesn't work for fa
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyCompact: {
    paddingVertical: 8,
    paddingHorizontal: 1,
  },
  specialKey: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  enterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  keyTextCompact: {
    fontSize: 28, 
  },
});
