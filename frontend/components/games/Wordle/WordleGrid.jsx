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

  const renderCell = (
    displayText,
    rowIndex,
    colIndex,
    guessKey,
    isCurrentGuess = false,
    colorLetter = displayText
  ) => {
    const isEmpty = !displayText;
    const backgroundColor = isEmpty || isCurrentGuess
      ? (isCurrentGuess && displayText ? COLORS.absent : '#fff')
      : getLetterColor(colorLetter, colIndex, guessKey);
    const borderColor = isEmpty ? COLORS.border : backgroundColor;

    return (
      <TouchableOpacity
        key={`${rowIndex}-${colIndex}`}
        activeOpacity={0.75}
        onPress={() => onCellPress?.(rowIndex, colIndex, displayText)}
        style={[styles.cell, { backgroundColor, borderColor }]}
      >
        {/* Red flash overlay — only on the active row */}
        {isCurrentGuess && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.flashOverlay, { opacity: flashOpacity }]}
          />
        )}
        {!!displayText && <Text style={styles.cellText}>{displayText}</Text>}
      </TouchableOpacity>
    );
  };

  const renderRow = (rowIndex) => {
    const cells = [];

    const isPastGuess = rowIndex < guesses.length;
    const isActiveRow = rowIndex === guesses.length;

    const rowKey = isPastGuess ? (guesses[rowIndex] ?? '') : (isActiveRow ? currentGuess : '');
    const rowChars = [...rowKey];

    for (let i = 0; i < wordLength; i++) {
      if (isPastGuess) {
        cells.push(renderCell(rowChars[i] ?? '', rowIndex, i, rowKey, false));
      } else if (isActiveRow) {
        cells.push(renderCell(rowChars[i] ?? '', rowIndex, i, rowKey, true));
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
