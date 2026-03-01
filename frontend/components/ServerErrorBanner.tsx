import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

type BannerType = 'error' | 'success' | null;

/**
 * Banner component that shows when the backend server is not reachable
 * or when it recovers. Auto-dismisses after a few seconds or can be manually dismissed.
 */
export default function ServerErrorBanner() {
  const { isBackendServerReachable } = useAppContext();
  const [visible, setVisible] = useState(false);
  const [bannerType, setBannerType] = useState<BannerType>(null);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const wasUnreachableRef = useRef(false);

  useEffect(() => {
    if (!isBackendServerReachable) {
      // Server became unreachable - show error banner
      wasUnreachableRef.current = true;
      showBanner('error');
    } else if (wasUnreachableRef.current && isBackendServerReachable) {
      // Server recovered - show success banner
      wasUnreachableRef.current = false;
      showBanner('success');
    }
  }, [isBackendServerReachable]);

  const showBanner = (type: BannerType) => {
    setBannerType(type);
    setVisible(true);
    
    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Auto-dismiss after 5 seconds for error, 3 seconds for success
    const timeout = type === 'error' ? 5000 : 3000;
    const timer = setTimeout(() => {
      dismissBanner();
    }, timeout);

    return () => clearTimeout(timer);
  };

  const dismissBanner = () => {
    // Slide out
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setBannerType(null);
    });
  };

  if (!visible || !bannerType) {
    return null;
  }

  const isError = bannerType === 'error';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isError ? '#e74c3c' : '#27ae60',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={isError ? "cloud-offline-outline" : "checkmark-circle-outline"} 
          size={24} 
          color="#fff" 
          style={styles.icon} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isError ? "Sorry, we're having trouble" : "Back online!"}
          </Text>
          <Text style={styles.subtitle}>
            {isError ? "You can still use offline mode" : "Connection restored"}
          </Text>
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
    paddingTop: 50, // Account for status bar
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#e74c3c', // Red color for error
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
