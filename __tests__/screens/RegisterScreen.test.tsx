import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';

// Create mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

// Mock navigation hook
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => mockNavigation,
  };
});

// Mock auth context
const mockRegister = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    error: null,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Mock styles
jest.mock('../../src/styles/registerScreen.styles', () => ({
  styles: {
    container: {},
    title: {},
    subtitle: {},
    form: {},
    input: {},
    button: {},
    buttonText: {},
    linkButton: {},
    linkText: {},
  },
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign up to get started')).toBeTruthy();
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Already have an account? Sign in')).toBeTruthy();
  });

  it('validates fields before submitting', () => {
    const { getByText } = render(<RegisterScreen />);
    
    // Try to submit without filling fields
    fireEvent.press(getByText('Sign Up'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates email format', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Fill required fields
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByText('Sign Up'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates password length', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Fill required fields with short password
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), '12345');
    
    fireEvent.press(getByText('Sign Up'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters long');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits registration with valid data', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Fill all fields with valid data
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByText('Sign Up'));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        preferredPaymentMethod: 'CASH',
      });
    });
    
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Registration successful! Please login.');
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('handles registration failure', async () => {
    mockRegister.mockRejectedValue({ success: false, error: 'Registration failed' });
    
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Fill all fields with valid data
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByText('Sign Up'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('Registration failed'));
    });
  });

  it('navigates to login screen', () => {
    const { getByText } = render(<RegisterScreen />);
    
    fireEvent.press(getByText('Already have an account? Sign in'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
}); 