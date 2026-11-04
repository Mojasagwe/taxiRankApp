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

// Mock react-native-date-picker
jest.mock('react-native-date-picker', () => {
  const MockDatePicker = jest.fn().mockImplementation(props => {
    return {
      type: 'DatePicker',
      props: { ...props },
    };
  });
  
  // Add any methods or properties the component needs
  MockDatePicker.prototype.render = jest.fn();
  
  return MockDatePicker;
}); 
// Native photo picker: tests drive the callbacks themselves
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Safe-area insets without a native provider
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// GPS: tests set positions through the mock
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));
