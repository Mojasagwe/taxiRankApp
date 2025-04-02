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

module.exports = mock; 