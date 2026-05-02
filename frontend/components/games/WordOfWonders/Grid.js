import React, { memo, useState, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { GREEN, MAX_GRID_WIDTH, width, height } from './gameConstants';
import { isRTL } from './languageUtils';
import SeeMeaningPopUp from './pop-ups/SeeMeaningPopUp';

const Grid = memo(({ boxData, gridWords, foundWords, filledBoxes, boxAnimations, shakeWord, shakeAnimation, langCode = 'en', dictionarySet = {} }) => {
  const rtl = isRTL(langCode);
  const [seeMeaningVisible, setSeeMeaningVisible] = useState(false);
  const [seeMeaningWords, setSeeMeaningWords] = useState([]);
  const [pressedBoxIndex, setPressedBoxIndex] = useState(null);
  const pressScaleAnimation = useRef(new Animated.Value(1)).current;
  
  const [wordFoundAnimations, setWordFoundAnimations] = useState({});
  const lastFoundWordsCountRef = useRef(0);

  const columns = boxData[0].length;
  const rows = boxData.length;

  const SHORT_VOWELS = /[\u064B-\u0652\u0670]/;
  const SHORT_VOWELS_GLOBAL = /[\u064B-\u0652\u0670]/g;

  // Split a word into display letters where short vowels are attached to the
  // previous base letter. Example: بَرادَر -> ["بَ", "ر", "ا", "دَ", "ر"]
  const splitWithShortVowels = (text) => {
    const letters = [];
    if (!text) return letters;

    for (const ch of text) {
      if (SHORT_VOWELS.test(ch) && letters.length > 0) {
        letters[letters.length - 1] += ch;
      } else {
        letters.push(ch);
      }
    }

    return letters;
  };

  // Remove short vowels, used at intersections to avoid clashes.
  // Example: "شَ" -> "ش".
  const stripShortVowels = (text) => {
    if (!text) return text;
    return text.replace(SHORT_VOWELS_GLOBAL, '');
  };

  // Resolve the original dictionary written_form so we can show diacritics(shor vowels).
  // Falls back to the normalized grid word when no dictionary match exists.
  const getDisplayLetters = (word) => {
    const items = dictionarySet[word] ?? [];
    let writtenForm = items[0]?.written_form ?? word;

    // Each word of gridWords has dictionaryId which is the id of corresponding word in the dictionary.
    const dictionaryId = gridWords[word]?.DictionaryId;
    if (dictionaryId != null) {
      const match = items.find((item) => item?.id === dictionaryId);
      if (match?.written_form) writtenForm = match.written_form;
    }

    const letters = splitWithShortVowels(String(writtenForm).trim());

    // If the dictionary string does not align with the normalized length,
    // fall back to the normalized grid word to keep layout consistent.
    if (letters.length !== word.length) return word.split('');
    return letters;
  };

  // Build two grids:
  // - directionGrid marks if a cell is part of a horizontal word (1), vertical word (2), or both (3).
  // - letterGrid stores the actual display letters with short vowels applied where allowed.
  const createLetterGrid = () => {
    const letterGrid = Array(rows).fill(null).map(() => Array(columns).fill(''));
    const directionGrid = Array(rows).fill(null).map(() => Array(columns).fill(0));

    // First pass: mark directions for each occupied cell.
    Object.keys(gridWords).forEach((word) => {
      const wordData = gridWords[word];
      const [startRow, startCol] = wordData.pos;
      const wordLength = word.length;
      const directionFlag = wordData.direction === 'H' ? 1 : 2;

      for (let index = 0; index < wordLength; index += 1) {
        if (wordData.direction === 'H') {
          directionGrid[startRow][startCol + index] |= directionFlag;
        } else {
          directionGrid[startRow + index][startCol] |= directionFlag;
        }
      }
    });

    // Second pass: place display letters, stripping vowels only at intersections(if they are different)
    // where the two crossing letters are different.
    Object.keys(gridWords).forEach((word) => {
      const wordData = gridWords[word];
      const [startRow, startCol] = wordData.pos;
      const wordLength = word.length;
      const wordLetters = getDisplayLetters(word);

      for (let index = 0; index < wordLength; index += 1) {
        const row = wordData.direction === 'H' ? startRow : startRow + index;
        const col = wordData.direction === 'H' ? startCol + index : startCol;
        const isIntersection = directionGrid[row][col] === 3;

        let letter = wordLetters[index] ?? word[index] ?? '';
        if (isIntersection) {
          const existing = letterGrid[row][col];
          // Keep the short vowel only if both crossing letters are identical.
          // Example: horizontal "شَ" crossing vertical "شَ" keeps the vowel, شَخص and شَخصی
          // but "شَ" crossing "شِ" strips to avoid conflicting marks. شَهر and شِعر
          if (existing && existing !== letter) {
            letter = stripShortVowels(letter);
          }
        }

        letterGrid[row][col] = letter.toUpperCase();
      }
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

    const foundSeeMeaningWords = (() => {
      if (!filledBoxes.includes(boxIndex)) return [];

      // Find vertical or horizontal word at this position
      // O(n), n: grid words count, very small number (<=20)
      const seeMeaningWords = Object.keys(gridWords).filter((word) => {
        const wordData = gridWords[word];
        const [startRow, startCol] = wordData.pos;
        const wordLength = word.length;

        if (wordData.direction === 'H') {
          return rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength;
        }

        return colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength;
      });

      return seeMeaningWords.filter((word) => gridWords[word].isFound);
    })();

    const foundSeeMeaningItems = foundSeeMeaningWords.flatMap((word) => {
      const items = dictionarySet[word] ?? [];
      if (!items.length) return [];
      return items;
    });

    // When user presses a grid cell(box), the box shrinks and the pop-ups/SeeMeaningPopup.js Modal appears with the words that include this box. The user can then see the meaning of these words in their native language.
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
      // After animation, show the popup only when there are found words
      if (foundSeeMeaningItems.length > 0) {
        setSeeMeaningWords(foundSeeMeaningItems);
        setSeeMeaningVisible(true);
      }
      setPressedBoxIndex(null);
    });
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
                  left: gridLeft + (rtl ? (columns - 1 - colIndex) : colIndex) * boxSize,
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
