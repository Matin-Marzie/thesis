import './suppressExpoGoNotificationWarning';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

export const REMINDER_NOTIFICATION_ID = 'daily-practice-reminder';

// expo-notifications throws (not just warns) the instant it's imported on
// Android in Expo Go, since push support was removed there in SDK 53 - see
// DevicePushTokenAutoRegistration.fx.ts, which registers a push token
// listener as an import-time side effect. Require it lazily, and only
// outside that environment, so the module graph doesn't crash on load.
const isNotificationsUnsupported = Platform.OS === 'android' && isRunningInExpoGo();

let cachedNotifications = null;
const getNotifications = () => {
  if (isNotificationsUnsupported) return null;
  if (!cachedNotifications) {
    cachedNotifications = require('expo-notifications');

    // Show the reminder banner even while the app is in the foreground
    cachedNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      cachedNotifications.setNotificationChannelAsync('reminders', {
        name: 'Practice reminders',
        importance: cachedNotifications.AndroidImportance.DEFAULT,
      });
    }
  }
  return cachedNotifications;
};

// Exposed so other modules (e.g. app/_layout.tsx) can react to notification
// taps without statically importing expo-notifications themselves.
export const getNotificationsModule = getNotifications;

/**
 * Requests OS notification permission if not already granted.
 * @returns {Promise<boolean>} whether permission is granted
 */
export const requestNotificationPermission = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const getNotificationPermissionStatus = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return 'undetermined';

  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

/**
 * Schedules (or reschedules) the daily practice reminder at the given time.
 */
export const scheduleDailyReminder = async (hour, minute, firstName) => {
  const Notifications = getNotifications();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID).catch(() => {});

  const body = firstName
    ? `${firstName[0].toUpperCase()}${firstName.slice(1)}, just 2 minutes 🔥`
    : ' Just 2 minutes 🔥';

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIFICATION_ID,
    content: {
      title: "New Reels waiting for you! 🎬",
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'reminders',
    },
  });
};

export const cancelDailyReminder = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID).catch(() => {});
};
