import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface CoinRewardBadgeProps {
  amount: number;
  // Bumped by the caller each time a reward should animate - a plain
  // boolean can't re-trigger on back-to-back rewards for the same mounted
  // instance, since a value that's already `true` doesn't change.
  triggerKey: number;
}

// "+N coins" pop - scales/floats up then fades, mirroring the like
// button's withSpring bounce elsewhere in the reels UI. Purely decorative;
// the caller owns actually crediting the coins.
export function CoinRewardBadge({ amount, triggerKey }: CoinRewardBadgeProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (triggerKey === 0) return;
    opacity.value = 0;
    translateY.value = 0;
    scale.value = 0.6;

    opacity.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withDelay(500, withTiming(0, { duration: 350 }))
    );
    translateY.value = withTiming(-36, { duration: 1000, easing: Easing.out(Easing.quad) });
    scale.value = withSequence(
      withTiming(1.15, { duration: 180, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <FontAwesome5 name="coins" size={18} color="#FFD700" />
      <Text style={styles.text}>{`+${amount}`}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
