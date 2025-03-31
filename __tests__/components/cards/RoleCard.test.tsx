import React from 'react';
import { render } from '@testing-library/react-native';
import RoleCard from '../../../src/components/cards/RoleCard';

// Skip this test file for now
describe.skip('RoleCard', () => {
  const mockIcon = { uri: 'https://example.com/icon.png' };
  const mockTitle = 'Test Title';
  const mockDescription = 'Test Description';
  const onPressMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <RoleCard 
        title={mockTitle}
        description={mockDescription}
        icon={mockIcon}
        onPress={onPressMock}
      />
    );
  });
}); 