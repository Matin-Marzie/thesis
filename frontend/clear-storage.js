// Run this in Expo Go by pressing 'm' for menu, then 'Debug Remote JS'
// Then in browser console, run: AsyncStorage.clear()

// Or add this temporarily to your app
import AsyncStorage from '@react-native-async-storage/async-storage';

async function clearStorage() {
  try {
    await AsyncStorage.clear();
    console.log('Storage cleared!');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

clearStorage();
