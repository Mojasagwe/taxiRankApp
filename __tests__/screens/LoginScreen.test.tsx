import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const mockLogin = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks for email or rank code', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Email or rank code')).toBeTruthy();
    expect(getByText('Rank accounts log in with their rank code, e.g. CTR001')).toBeTruthy();
  });

  it('requires both fields', async () => {
    const { getByTestId, findByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-button'));
    expect(await findByText('Enter your email or rank code and your password')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('logs in with a rank code', async () => {
    mockLogin.mockResolvedValue({});
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('identifier-input'), 'CTR001');
    fireEvent.changeText(getByTestId('password-input'), 'Example-Rank-Pass-1');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('CTR001', 'Example-Rank-Pass-1'));
  });

  it("shows the backend's message when login fails", async () => {
    mockLogin.mockRejectedValue({ response: { status: 401, data: { error: 'Incorrect login or password' } } });
    const { getByTestId, findByText } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('identifier-input'), 'rider@travy.local');
    fireEvent.changeText(getByTestId('password-input'), 'wrong');
    fireEvent.press(getByTestId('login-button'));
    expect(await findByText('Incorrect login or password')).toBeTruthy();
  });

  it('explains when the server is unreachable', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    const { getByTestId, findByText } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('identifier-input'), 'rider@travy.local');
    fireEvent.changeText(getByTestId('password-input'), 'Example-Pass-1');
    fireEvent.press(getByTestId('login-button'));
    expect(await findByText('Cannot reach the Travy server')).toBeTruthy();
  });
});
