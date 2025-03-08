import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('App Component', () => {
  test('renders correctly', async () => {
    let root!: ReactTestRenderer.ReactTestRenderer;


    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    expect(root.toJSON()).toBeTruthy();
  });
});
