import { LogBox } from 'react-native';

// expo-notifications logs this the instant it's imported, on every Android
// Expo Go session, regardless of whether push tokens are actually used.
// It's a dev-only nag to use a development build; harmless for local
// notifications. Must be imported before `expo-notifications` anywhere in
// the module graph to register before the warning fires.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
