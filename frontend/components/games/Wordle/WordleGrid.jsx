import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent: '#787c7e',
  empty: '#d3d6da',
  border: '#999',
};

export default function WordleGrid({
  guesses,
  currentGuess,
  maxAttempts,
  wordLength,
  secretWord,
  getLetterColor,
}) {
  const renderCell = (letter, index, guess, isCurrentGuess = false) => {
    if (!letter) {
      return (
        <View key={`${guess}-${index}`} style={styles.emptyCell}>
          <Text style={styles.cellText}></Text>
        </View>
      );
    }

    // For the current guess being typed, always show absent color
    const backgroundColor = isCurrentGuess ? COLORS.absent : getLetterColor(letter, index, guess);

    return (
      <View
        key={`${guess}-${index}`}
        style={[
          styles.cell,
          {
            backgroundColor,
            borderColor: backgroundColor === COLORS.empty ? COLORS.border : backgroundColor,
          },
        ]}
      >
        <Text style={styles.cellText}>{letter}</Text>
      </View>
    );
  };

  const renderRow = (rowIndex) => {
    let rowContent = '';

    if (rowIndex < guesses.length) {
      rowContent = guesses[rowIndex];
    } else if (rowIndex === guesses.length) {
      rowContent = currentGuess;
    }

    const cells = [];
    const isCurrentGuessRow = rowIndex === guesses.length;

    for (let i = 0; i < wordLength; i++) {
      if (rowIndex < guesses.length) {
        cells.push(renderCell(guesses[rowIndex][i], i, guesses[rowIndex], false));
      } else if (rowIndex === guesses.length) {
        cells.push(renderCell(currentGuess[i], i, currentGuess, true));
      } else {
        cells.push(renderCell('', i, '', false));
      }
    }

    return (
      <View key={`row-${rowIndex}`} style={styles.row}>
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
  cell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  emptyCell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.empty,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  cellText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
