import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/screens/LoginScreen';

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
const mockLogin = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    error: null,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Mock styles
jest.mock('../../src/styles/loginScreen.styles', () => ({
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

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText("Don't have an account? Sign up")).toBeTruthy();
  });

  it('validates fields before submitting', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    // Try to submit without filling fields
    fireEvent.press(getByText('Sign In'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    // Enter invalid email
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits login with valid data', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login failure', async () => {
    mockLogin.mockRejectedValue({ success: false, error: 'Login failed' });
    
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('Login failed'));
    });
  });

  it('navigates to register screen', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation as any} />);
    
    fireEvent.press(getByText("Don't have an account? Sign up"));
    
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
}); 