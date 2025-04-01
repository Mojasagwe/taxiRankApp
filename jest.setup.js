// Jest setup file
const { jest } = require('@jest/globals');

// Mock react-native-dropdown-picker
jest.mock('react-native-dropdown-picker', () => require('./__mocks__/react-native-dropdown-picker'));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  __esModule: true,
  default: {
    extractNativeEvent: jest.fn(),
    API: {
      createAnimatedComponent: jest.fn(),
    },
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}), { virtual: true });

// Mock any other problematic libraries as needed 