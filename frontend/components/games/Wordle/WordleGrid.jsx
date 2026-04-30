import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';

const COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent: '#787c7e',
  empty: '#d3d6da',
  border: '#ddd',
};

export default function WordleGrid({
  guesses,
  currentGuess,
  maxAttempts,
  wordLength,
  secretWord: _secretWord,
  getLetterColor,
  isRTL = false,
  onCellPress,
  invalidTrigger = 0,
  onInvalidAnimationEnd,
}) {
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!invalidTrigger) return;

    flashOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,   duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,   duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0,   duration: 150, useNativeDriver: true }),
    ]).start(() => onInvalidAnimationEnd?.());
  }, [invalidTrigger]);

  const renderCell = (letter, rowIndex, colIndex, guess, isCurrentGuess = false) => {
    const isEmpty = !letter;
    const backgroundColor = isEmpty || isCurrentGuess
      ? (isCurrentGuess && letter ? COLORS.absent : '#fff')
      : getLetterColor(letter, colIndex, guess);
    const borderColor = isEmpty ? COLORS.border : backgroundColor;

    return (
      <TouchableOpacity
        key={`${rowIndex}-${colIndex}`}
        activeOpacity={0.75}
        onPress={() => onCellPress?.(rowIndex, colIndex, letter)}
        style={[styles.cell, { backgroundColor, borderColor }]}
      >
        {/* Red flash overlay — only on the active row */}
        {isCurrentGuess && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.flashOverlay, { opacity: flashOpacity }]}
          />
        )}
        {!!letter && <Text style={styles.cellText}>{letter}</Text>}
      </TouchableOpacity>
    );
  };

  const renderRow = (rowIndex) => {
    const cells = [];

    for (let i = 0; i < wordLength; i++) {
      if (rowIndex < guesses.length) {
        const chars = [...guesses[rowIndex]];
        cells.push(renderCell(chars[i] ?? '', rowIndex, i, guesses[rowIndex], false));
      } else if (rowIndex === guesses.length) {
        const chars = [...currentGuess];
        cells.push(renderCell(chars[i] ?? '', rowIndex, i, currentGuess, true));
      } else {
        cells.push(renderCell('', rowIndex, i, '', false));
      }
    }

    return (
      <View
        key={`row-${rowIndex}`}
        style={[styles.row, isRTL && styles.rowRTL]}
      >
        {cells}
      </View>
    );
  };

  return (
    <View style={styles.grid}>
      {Array.from({ length: maxAttempts }).map((_, index) => renderRow(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 6,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  cell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  flashOverlay: {
    backgroundColor: '#e53935',
    borderRadius: 5,
  },
  cellText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
