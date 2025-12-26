import React, { memo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { boxData, columns, rows, GREEN, MAX_GRID_WIDTH, width, height, gridWords } from './gameConstants';

// Create a map of grid positions to letters
const createLetterGrid = () => {
  const letterGrid = Array(rows).fill(null).map(() => Array(columns).fill(''));
  
  Object.keys(gridWords).forEach((word) => {
    const wordData = gridWords[word];
    const [startRow, startCol] = wordData.pos;
    const wordLetters = word.split('');
    
    wordLetters.forEach((letter, index) => {
      if (wordData.direction === 'H') {
        letterGrid[startRow][startCol + index] = letter.toUpperCase();
      } else {
        letterGrid[startRow + index][startCol] = letter.toUpperCase();
      }
    });
  });
  
  return letterGrid;
};

const letterGrid = createLetterGrid();

const Grid = memo(({ filledBoxes, boxAnimations, shakeWord, shakeAnimation }) => {
  const horizontalMargin = width * 0.02;
  const availableWidth = Math.min(width - (horizontalMargin * 2), MAX_GRID_WIDTH);
  const boxSize = availableWidth / columns;
  const gridWidth = columns * boxSize;
  const gridHeight = rows * boxSize;
  const gridLeft = (width - gridWidth) / 2; // Center the grid horizontally
  const gridTop = height * 0.12;

  // Get box indices for the shake word
  const getShakeBoxIndices = () => {
    if (!shakeWord || !gridWords[shakeWord]) return [];
    const wordData = gridWords[shakeWord];
    const wordLetters = shakeWord.split('');
    const indices = [];
    
    wordLetters.forEach((letter, index) => {
      let boxIndex;
      if (wordData.direction === 'H') {
        boxIndex = wordData.pos[0] * columns + wordData.pos[1] + index;
      } else {
        boxIndex = (wordData.pos[0] + index) * columns + wordData.pos[1];
      }
      indices.push(boxIndex);
    });
    
    return indices;
  };

  const shakeBoxIndices = getShakeBoxIndices();

  return (
    <View style={styles.gridContainer}>
      {boxData.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 0) return null;

          const boxIndex = rowIndex * columns + colIndex;
          const isFilled = filledBoxes.includes(boxIndex);
          const letter = letterGrid[rowIndex][colIndex];

          const backgroundColor = boxAnimations[boxIndex].interpolate({
            inputRange: [0, 1],
            outputRange: ['#ffffff', GREEN],
          });

          const letterOpacity = boxAnimations[boxIndex].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const letterScale = boxAnimations[boxIndex].interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          });

          // Check if this box should shake
          const shouldShake = shakeBoxIndices.includes(boxIndex);
          const shakeTransform = shouldShake && shakeAnimation ? [{ translateX: shakeAnimation }] : [];

          return (
            <Animated.View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.gridBox,
                {
                  width: boxSize,
                  height: boxSize,
                  left: gridLeft + colIndex * boxSize,
                  top: gridTop + rowIndex * boxSize,
                  backgroundColor,
                  borderColor: '#ddd',
                  transform: shakeTransform,
                },
              ]}
            >
              {isFilled && (
                <Animated.Text 
                  style={[
                    styles.letterText, 
                    { 
                      fontSize: boxSize * 0.5,
                      opacity: letterOpacity,
                      transform: [{ scale: letterScale }],
                    }
                  ]}
                >
                  {letter}
                </Animated.Text>
              )}
            </Animated.View>
          );
        })
      )}
    </View>
  );
});

Grid.displayName = 'Grid';

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
  },
  gridBox: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  letterText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Grid;
