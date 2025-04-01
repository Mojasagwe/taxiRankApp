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

module.exports = jest.fn().mockImplementation(() => ({
  setOpen: jest.fn(),
  setItems: jest.fn(),
  setValue: jest.fn(),
  setSelectionState: jest.fn(),
  ...DropDownPicker,
}));

// Export the constants as well
Object.keys(DropDownPicker).forEach(key => {
  module.exports[key] = DropDownPicker[key];
}); 