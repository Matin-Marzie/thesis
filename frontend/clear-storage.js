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
