import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 * @returns {boolean} isOnline - whether the device has internet connection
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get reliable initial status immediately - when app loads, we want to know right away if we're online or offline (NetInfo's default is 'unknown' until it checks)
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Listen for ongoing changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  return isOnline;
};
