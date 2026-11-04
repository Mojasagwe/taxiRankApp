import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App Component', () => {
  test('renders correctly', async () => {
    let root!: ReactTestRenderer.ReactTestRenderer;


    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    expect(root.toJSON()).toBeTruthy();
  });
});
