import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useVibrationSettings } from '@/context/VibrationContext';

/**
 * iOS's Vibration.vibrate() ignores whatever duration/pattern you pass it and
 * always fires the same ~400ms system buzz, Use expo-haptics instead: array patterns
 * are always used for "invalid/error" feedback, mapped to a notification haptic; single
 * numbers are short taps, mapped to an impact haptic sized by magnitude.
 */
const fireIosHaptic = (pattern) => {
  if (Array.isArray(pattern)) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  if (pattern <= 10) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else if (pattern <= 25) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Returns a `vibrate(pattern, options)` function that respects the user's
 * vibration settings (master switch, button/animation type, per-game switch)
 * before triggering haptic feedback.
 *
 * @param {number|number[]} pattern - forwarded to Vibration.vibrate on Android; mapped to an expo-haptics call on iOS
 * @param {{ type?: 'button'|'animation', game?: 'wordOfWonders'|'wordle' }} [options]
 */
export function useVibration() {
  const { vibrationSettings } = useVibrationSettings();

  const vibrate = useCallback((pattern, options = {}) => {
    const { type, game } = options;
    const settings = vibrationSettings;

    if (!settings?.enabled) return;
    if (type === 'button' && !settings.buttons) return;
    if (type === 'animation' && !settings.animations) return;
    if (game === 'wordOfWonders' && !settings.wordOfWonders) return;
    if (game === 'wordle' && !settings.wordle) return;

    if (Platform.OS === 'ios') {
      fireIosHaptic(pattern);
    } else {
      Vibration.vibrate(pattern);
    }
  }, [vibrationSettings]);

  return vibrate;
}
