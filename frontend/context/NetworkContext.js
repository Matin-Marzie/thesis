import { createContext, useState, useContext, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { apiEvents, API_EVENTS } from '../api/apiEvents';

/**
 * @typedef {Object} NetworkContextType
 * @property {boolean} isOnline
 * @property {boolean} isBackendServerReachable
 * @property {Function} setIsBackendServerReachable
 */

/** @type {import('react').Context<NetworkContextType>} */
const NetworkContext = createContext({});

export const NetworkProvider = ({ children }) => {
  // Network status from custom hook
  const isOnline = useNetworkStatus();

  const [isBackendServerReachable, setIsBackendServerReachable] = useState(true);

  // Listen for API server errors (5xx or network errors)
  useEffect(() => {
    const unsubscribeError = apiEvents.on(API_EVENTS.SERVER_ERROR, () => {
      setIsBackendServerReachable(false);
    });

    const unsubscribeRecovery = apiEvents.on(API_EVENTS.SERVER_RECOVERED, () => {
      setIsBackendServerReachable(true);
    });

    return () => {
      unsubscribeError();
      unsubscribeRecovery();
    };
  }, []);

  const value = {
    isOnline,
    isBackendServerReachable, setIsBackendServerReachable,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

// Custom hook to use the NetworkContext
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
