import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LinkButton from '../../../src/components/buttons/LinkButton';

describe('LinkButton', () => {
  const onPressMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <LinkButton title="Test Link" onPress={onPressMock} />
    );
    
    expect(getByText('Test Link')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <LinkButton title="Test Link" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Link'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('applies custom color when provided', () => {
    const testColor = '#FF0000';
    const { getByText } = render(
      <LinkButton 
        title="Test Link" 
        onPress={onPressMock} 
        color={testColor}
      />
    );
    
    const textElement = getByText('Test Link');
    expect(textElement.props.style[1].color).toBe(testColor);
  });

  it('uses default color when no color is provided', () => {
    const { getByText } = render(
      <LinkButton title="Test Link" onPress={onPressMock} />
    );
    
    const textElement = getByText('Test Link');
    expect(textElement.props.style[1].color).toBe('#0066cc');
  });
}); 