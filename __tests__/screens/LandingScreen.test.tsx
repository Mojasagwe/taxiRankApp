import React from 'react';
import { render } from '@testing-library/react-native';
import LandingScreen from '../../src/screens/LandingScreen';

// Skip this test file for now
describe.skip('LandingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LandingScreen />);
  });
}); 