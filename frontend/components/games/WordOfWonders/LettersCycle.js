import React, { memo, useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { GREEN, width, height, MAX_CIRCLE_RADIUS } from './gameConstants';

// Only import SVG on native platforms
let Svg, Line;
if (Platform.OS !== 'web') {
  const SvgModule = require('react-native-svg');
  Svg = SvgModule.default || SvgModule.Svg;
  Line = SvgModule.Line;
}

const LettersCycle = memo(({ 
  selectedLetters, 
  onLetterPress, 
  onLetterRelease,
  letterAnimations,
  onShuffle,
  shuffledLetters
}) => {
  const [currentPointer, setCurrentPointer] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const letterCenters = useRef([]);
  const selectedLettersRef = useRef(selectedLetters);
  const onLetterPressRef = useRef(onLetterPress);
  const onLetterReleaseRef = useRef(onLetterRelease);

  // Keep refs in sync with props
  useEffect(() => {
    selectedLettersRef.current = selectedLetters;
  }, [selectedLetters]);

  useEffect(() => {
    onLetterPressRef.current = onLetterPress;
  }, [onLetterPress]);

  useEffect(() => {
    onLetterReleaseRef.current = onLetterRelease;
  }, [onLetterRelease]);

  // Calculate letter positions in a circle
  const circleRadius = Math.min(width * 0.31, MAX_CIRCLE_RADIUS);
  const LETTERS_RADIUS = 0.71;
  const circleCenter = {
    x: width * 0.5,
    y: height * 0.84,
  };

  const getLetterPosition = useCallback((index) => {
    const angle = (index / (shuffledLetters.length / 2)) * Math.PI;
    const x = circleCenter.x + circleRadius * LETTERS_RADIUS * Math.sin(angle);
    const y = circleCenter.y - circleRadius * LETTERS_RADIUS * Math.cos(angle);
    return { x, y };
  }, [circleRadius, circleCenter.x, circleCenter.y, shuffledLetters.length]);

  const findLetterAtPosition = useCallback((touchX, touchY) => {
    for (let i = 0; i < shuffledLetters.length; i++) {
      const center = letterCenters.current[i];
      if (!center) continue;

      const distance = Math.sqrt(
        Math.pow(touchX - center.x, 2) + Math.pow(touchY - center.y, 2)
      );

      if (distance < 30) {
        return i;
      }
    }
    return -1;
  }, []);

  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;
        setCurrentPointer({ x: touchX, y: touchY });

        const letterIndex = findLetterAtPosition(touchX, touchY);
        if (letterIndex !== -1) {
          setIsTouch(true);
          if (!selectedLettersRef.current.includes(letterIndex)) {
            onLetterPressRef.current(letterIndex);
          }
        }
      },
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;
        setCurrentPointer({ x: touchX, y: touchY });

        const letterIndex = findLetterAtPosition(touchX, touchY);
        if (letterIndex !== -1) {
          onLetterPressRef.current(letterIndex);
        }
      },
      onPanResponderRelease: () => {
        setIsTouch(false);
        setCurrentPointer(null);
        onLetterReleaseRef.current();
      },
    })
  ).current;

  const renderLines = () => {
    if (selectedLetters.length === 0 || Platform.OS === 'web') return null;

    const lines = [];
    
    // Draw lines between selected letters
    for (let i = 0; i < selectedLetters.length - 1; i++) {
      const startIndex = selectedLetters[i];
      const endIndex = selectedLetters[i + 1];
      const start = letterCenters.current[startIndex];
      const end = letterCenters.current[endIndex];
      
      if (start && end) {
        lines.push(
          <Line
            key={`line-${i}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={GREEN}
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      }
    }

    // Draw line from last selected letter to current pointer
    if (selectedLetters.length > 0 && currentPointer) {
      const lastIndex = selectedLetters[selectedLetters.length - 1];
      const lastCenter = letterCenters.current[lastIndex];
      
      if (lastCenter) {
        lines.push(
          <Line
            key="current-line"
            x1={lastCenter.x}
            y1={lastCenter.y}
            x2={currentPointer.x}
            y2={currentPointer.y}
            stroke={GREEN}
            strokeWidth={8}
            strokeLinecap="round"
            opacity={0.6}
          />
        );
      }
    }

    return (
      <Svg
        style={StyleSheet.absoluteFill}
        width={width}
        height={height}
      >
        {lines}
      </Svg>
    );
  };

  const renderLetters = () => {
    return shuffledLetters.map((letter, index) => {
      const pos = getLetterPosition(index);
      const isSelected = selectedLetters.includes(index);

      // Store letter center position
      letterCenters.current[index] = { x: pos.x, y: pos.y };

      // Guard against undefined animations
      if (!letterAnimations[index]) {
        return null;
      }

      const scale = letterAnimations[index].interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      });

      const backgroundColor = letterAnimations[index].interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.9)', GREEN],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.letterCircle,
            {
              left: pos.x - 25,
              top: pos.y - 25,
              backgroundColor,
              transform: [{ scale }],
            },
          ]}
        >
          <Text style={[
            styles.letterText,
            isSelected && styles.letterTextSelected
          ]}>
            {letter}
          </Text>
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.circleContainer} {...panResponder.panHandlers}>
      <View
        style={[
          styles.circleBackground,
          {
            width: circleRadius * 2,
            height: circleRadius * 2,
            left: circleCenter.x - circleRadius,
            top: circleCenter.y - circleRadius,
          },
        ]}
      />
      {renderLines()}
      {renderLetters()}
      
      {/* Shuffle Button in Center - Hide when touching */}
      {!isTouch && (
        <TouchableOpacity
          style={[
            styles.shuffleButton,
            {
              left: circleCenter.x - 25,
              top: circleCenter.y - 25,
            },
          ]}
          onPress={onShuffle}
          activeOpacity={0.7}
        >
          <Entypo name="shuffle" size={24} color="#333" />
        </TouchableOpacity>
      )}
    </View>
  );
});

LettersCycle.displayName = 'LettersCycle';

const styles = StyleSheet.create({
  circleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff'
  },
  circleBackground: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.73)',
  },
  letterCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  letterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GREEN,
  },
  letterTextSelected: {
    color: '#fff',
  },
  shuffleButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});

export default LettersCycle;
