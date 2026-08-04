import { createContext, useContext, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_VIBRATION_SETTINGS, STORAGE_KEYS, validators } from '../constants/defaults';

/**
 * @typedef {Object} VibrationContextType
 * @property {Object} vibrationSettings
 * @property {Function} setVibrationSettings
 * @property {boolean} isVibrationSettingsLoaded
 */

/** @type {import('react').Context<VibrationContextType>} */
const VibrationContext = createContext({});

export const VibrationProvider = ({ children }) => {
  const {
    value: vibrationSettings,
    setValue: setVibrationSettings,
    isLoaded: isVibrationSettingsLoaded,
  } = usePersistedState(STORAGE_KEYS.VIBRATION_SETTINGS, DEFAULT_VIBRATION_SETTINGS, validators.vibrationSettings);

  const value = useMemo(() => ({
    vibrationSettings, setVibrationSettings,
    isVibrationSettingsLoaded,
  }), [vibrationSettings, setVibrationSettings, isVibrationSettingsLoaded]);

  return <VibrationContext.Provider value={value}>{children}</VibrationContext.Provider>;
};

// Custom hook to use the VibrationContext
export const useVibrationSettings = () => {
  const context = useContext(VibrationContext);
  if (!context) {
    throw new Error('useVibrationSettings must be used within a VibrationProvider');
  }
  return context;
};

export default VibrationContext;
