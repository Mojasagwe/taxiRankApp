// Jest setup file

// Mock react-native-dropdown-picker
global.jest.mock('react-native-dropdown-picker', () => require('./__mocks__/react-native-dropdown-picker'));

// Silence the warning: Animated: `useNativeDriver` is not supported
global.jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock any other problematic libraries as needed 