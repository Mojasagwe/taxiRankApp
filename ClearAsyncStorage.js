import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to clear all AsyncStorage data
export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage has been cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    return false;
  }
};

// For testing in dev menu
global.clearAsyncStorage = clearAsyncStorage; 