import './suppressExpoGoNotificationWarning';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REMINDER_NOTIFICATION_ID = 'daily-practice-reminder';

// Show the reminder banner even while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('reminders', {
    name: 'Practice reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Requests OS notification permission if not already granted.
 * @returns {Promise<boolean>} whether permission is granted
 */
export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const getNotificationPermissionStatus = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

/**
 * Schedules (or reschedules) the daily practice reminder at the given time.
 */
export const scheduleDailyReminder = async (hour, minute, firstName) => {
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
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID).catch(() => {});
};
