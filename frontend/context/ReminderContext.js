import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { DEFAULT_REMINDER_SETTINGS, STORAGE_KEYS, validators } from '../constants/defaults';
import { scheduleDailyReminder, cancelDailyReminder } from '../utils/notifications';
import { useProfile } from './ProfileContext';

/**
 * @typedef {Object} ReminderContextType
 * @property {{enabled: boolean, hour: number, minute: number}} reminderSettings
 * @property {Function} setReminderSettings
 * @property {boolean} isReminderSettingsLoaded
 */

/** @type {import('react').Context<ReminderContextType>} */
const ReminderContext = createContext({});

export const ReminderProvider = ({ children }) => {
  const { userProfile } = useProfile();
  const {
    value: reminderSettings,
    setValue: setReminderSettings,
    isLoaded: isReminderSettingsLoaded,
  } = usePersistedState(STORAGE_KEYS.REMINDER_SETTINGS, DEFAULT_REMINDER_SETTINGS, validators.reminderSettings);

  // Keep the OS-scheduled notification in sync with the persisted setting
  useEffect(() => {
    if (!isReminderSettingsLoaded) return;

    if (reminderSettings.enabled) {
      scheduleDailyReminder(reminderSettings.hour, reminderSettings.minute, userProfile.first_name);
    } else {
      cancelDailyReminder();
    }
  }, [isReminderSettingsLoaded, reminderSettings.enabled, reminderSettings.hour, reminderSettings.minute, userProfile.first_name]);

  const value = useMemo(() => ({
    reminderSettings, setReminderSettings,
    isReminderSettingsLoaded,
  }), [reminderSettings, setReminderSettings, isReminderSettingsLoaded]);

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
};

// Custom hook to use the ReminderContext
export const useReminderSettings = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminderSettings must be used within a ReminderProvider');
  }
  return context;
};

export default ReminderContext;
