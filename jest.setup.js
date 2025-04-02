// Jest setup file
const { jest } = require('@jest/globals');

// Mock react-native-dropdown-picker directly
jest.mock('react-native-dropdown-picker', () => {
  const DropDownPicker = {
    SelectionState: {
      OPEN: 'OPEN',
      CLOSE: 'CLOSE',
    },
    MODE: {
      DEFAULT: 'DEFAULT',
    },
    LIST_MODE: {
      DEFAULT: 'DEFAULT',
    },
    DROPDOWN_DIRECTION: {
      DEFAULT: 'DEFAULT',
    },
    LANGUAGE: {
      DEFAULT: 'DEFAULT',
    },
    TRANSLATIONS: {},
  };

  const mock = jest.fn(() => ({
    setOpen: jest.fn(),
    setItems: jest.fn(),
    setValue: jest.fn(),
    setSelectionState: jest.fn(),
  }));

  // Add constants as properties of the function
  Object.keys(DropDownPicker).forEach(key => {
    mock[key] = DropDownPicker[key];
  });

  return mock;
});

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