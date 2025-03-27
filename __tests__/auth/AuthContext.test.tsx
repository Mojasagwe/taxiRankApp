import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../../src/context/AuthContext';
import { Text } from 'react-native';

// Mock the authService
jest.mock('../../src/services/api/axios', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
}));

// Mock console methods to reduce noise
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('AuthProvider', () => {
  it('renders without crashing', () => {
    const testMessage = 'Test Content';
    const { getByText } = render(
      <AuthProvider>
        <Text>{testMessage}</Text>
      </AuthProvider>
    );
    expect(getByText(testMessage)).toBeTruthy();
  });
}); 