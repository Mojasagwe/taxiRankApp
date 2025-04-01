// Jest setup file
const { jest } = require('@jest/globals');

// Mock react-native-dropdown-picker
jest.mock('react-native-dropdown-picker', () => require('./__mocks__/react-native-dropdown-picker'));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock any other problematic libraries as needed 