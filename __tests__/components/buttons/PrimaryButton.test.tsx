import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../../src/components/buttons/PrimaryButton';

describe('PrimaryButton', () => {
  const onPressMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPressMock} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when isLoading is true', () => {
    const { queryByText } = render(
      <PrimaryButton title="Test Button" onPress={onPressMock} isLoading={true} />
    );
    
    // When loading, button text should not be visible
    expect(queryByText('Test Button')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
}); 