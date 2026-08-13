import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TouchableOpacity from './TouchableOpacity';

/**
 * Banner shown when a previously-authenticated session was definitively
 * invalidated (refresh token expired past its absolute cap, or revoked via
 * reuse detection). Purely presentational - toggle `trigger` (e.g. a
 * counter or boolean flip) to show it again.
 */
export default function SessionExpiredBanner({ trigger }: { trigger: number | null }) {
  const [visible, setVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    if (!trigger) return;

    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    const timer = setTimeout(() => dismissBanner(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const dismissBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#fff" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Session expired</Text>
          <Text style={styles.subtitle}>For your security, please log in again</Text>
        </View>
        <TouchableOpacity onPress={dismissBanner} style={styles.closeButton}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#b8860b', // Amber - informational, not a network error
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
