import React from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useVibration } from '@/hooks/useVibration';

/**
 * Drop-in replacement for React Native's TouchableOpacity that vibrates on
 * press by default (respecting the user's vibration settings via
 * `useVibration`). Pass `noVibrate` to opt a specific button out, or
 * `vibrationPattern`/`game` to customize the vibration.
 */
export default function TouchableOpacity({
  onPress = () => {},
  disabled = false,
  noVibrate = false,
  vibrationPattern = 10,
  game = undefined,
  ...rest
}) {
  const vibrate = useVibration();

  const handlePress = (event) => {
    if (!disabled && !noVibrate) {
      vibrate(vibrationPattern, { type: 'button', game });
    }
    onPress?.(event);
  };

  return <RNTouchableOpacity onPress={handlePress} disabled={disabled} {...rest} />;
}
