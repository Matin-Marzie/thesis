import React, { memo, useState, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { GREEN, MAX_GRID_WIDTH, width, height } from './gameConstants';
import SeeMeaningPopUp from './pop-ups/SeeMeaningPopUp';

const Grid = memo(({ boxData, gridWords, foundWords, filledBoxes, boxAnimations, shakeWord, shakeAnimation }) => {
  const [seeMeaningVisible, setSeeMeaningVisible] = useState(false);
  const [seeMeaningWords, setSeeMeaningWords] = useState([]);
  const [pressedBoxIndex, setPressedBoxIndex] = useState(null);
  const pressScaleAnimation = useRef(new Animated.Value(1)).current;
  
  const [wordFoundAnimations, setWordFoundAnimations] = useState({});
  const lastFoundWordsCountRef = useRef(0);

  const columns = boxData[0].length;
  const rows = boxData.length;

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

  const horizontalMargin = width * 0.02;
  const availableWidth = Math.min(width - (horizontalMargin * 2), MAX_GRID_WIDTH);
  let boxSize = availableWidth / columns;
  boxSize = Math.min(boxSize, 50); // Cap box size to 50 for better visibility
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
  

  // Detect when a new word is found and animate it
  useEffect(() => {
    if (foundWords.length > lastFoundWordsCountRef.current) {
      // A new word was found
      const newFoundWord = foundWords[foundWords.length - 1];
      
      if (gridWords[newFoundWord]) {
        const wordData = gridWords[newFoundWord];
        const wordLetters = newFoundWord.split('');
        const boxIndices = [];

        // Get all box indices for this word
        wordLetters.forEach((letter, index) => {
          let boxIndex;
          if (wordData.direction === 'H') {
            boxIndex = wordData.pos[0] * columns + wordData.pos[1] + index;
          } else {
            boxIndex = (wordData.pos[0] + index) * columns + wordData.pos[1];
          }
          boxIndices.push(boxIndex);
        });

        // Create animations for all boxes in the word
        const newAnimations = {};
        boxIndices.forEach((boxIndex) => {
          newAnimations[boxIndex] = new Animated.Value(1);
        });

        setWordFoundAnimations(prev => ({ ...prev, ...newAnimations }));

        // Trigger the celebration animation with staggered delays (letter by letter)
        const delayBetweenLetters = 150; // 150ms delay between each letter
        boxIndices.forEach((boxIndex, letterIndex) => {
          Animated.sequence([
            Animated.delay(letterIndex * delayBetweenLetters),
            Animated.timing(newAnimations[boxIndex], {
              toValue: 1.15,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(newAnimations[boxIndex], {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        });
      }
    }

    lastFoundWordsCountRef.current = foundWords.length;
  }, [foundWords, gridWords, columns]);



  const handleGridBoxPress = (boxIndex, rowIndex, colIndex) => {

    // Set the pressed box index
    setPressedBoxIndex(boxIndex);

    // Animate the box shrink
    Animated.sequence([
      Animated.timing(pressScaleAnimation, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(pressScaleAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // After animation, show the popup
      setSeeMeaningWords(foundSeeMeaningWords);
      setSeeMeaningVisible(true);
      setPressedBoxIndex(null);
    });

    
    // only proceed if the box is filled
    if (!filledBoxes.includes(boxIndex)) return;

    // find vertical or horizontal word at this position
    const SeeMeaningWords = Object.keys(gridWords).filter((word) => {
      const wordData = gridWords[word];
      const [startRow, startCol] = wordData.pos;
      const wordLength = word.length;

      if (wordData.direction === 'H') {
        // horizontal
        return rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength;
      }
      else {
        // vertical
        return colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength;
      }
    });
    
    // check if any of these words are found
    const foundSeeMeaningWords = SeeMeaningWords.filter((word) => gridWords[word].isFound);

    if (foundSeeMeaningWords.length === 0) return;
  };
      

  return (
    <View style={styles.gridContainer}>
      {boxData.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 0) return null;

          const boxIndex = rowIndex * columns + colIndex;
          const isFilled = filledBoxes.includes(boxIndex);
          const letter = letterGrid[rowIndex][colIndex];

          // Guard against undefined animations
          if (!boxAnimations[boxIndex]) {
            return null;
          }

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

          // Apply press scale animation only to the pressed box before displaying SeeMeaning popup
          const pressScale = pressedBoxIndex === boxIndex ? pressScaleAnimation : 1;
          
          // Apply word found celebration scale animation
          const wordFoundScale = wordFoundAnimations[boxIndex] ? wordFoundAnimations[boxIndex] : 1;
          
          const transform = [...shakeTransform, { scale: pressScale }, { scale: wordFoundScale }];

          return (
            <Animated.View
              key={`${rowIndex}-${colIndex}`}
              onTouchStart={()=> {handleGridBoxPress(boxIndex, rowIndex, colIndex);}}
              style={[
                styles.gridBox,
                {
                  width: boxSize,
                  height: boxSize,
                  left: gridLeft + colIndex * boxSize,
                  top: gridTop + rowIndex * boxSize,
                  backgroundColor,
                  borderColor: '#ddd',
                  transform: transform,
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
      
      {/* See Meaning Popup */}
      <SeeMeaningPopUp
        visible={seeMeaningVisible}
        onClose={() => setSeeMeaningVisible(false)}
        foundWords={seeMeaningWords}
      />
    </View>
  );
});

Grid.displayName = 'Grid';

const styles = StyleSheet.create({
  gridContainer: {
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
