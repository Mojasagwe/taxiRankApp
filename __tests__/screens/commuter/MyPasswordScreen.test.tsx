import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import MyPasswordScreen from '../../../src/screens/commuter/MyPasswordScreen';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
}));
const mockChangePassword = jest.fn();
jest.mock('../../../src/context/AuthContext', () => ({ useAuth: () => ({ changePassword: mockChangePassword }) }));

describe('MyPasswordScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ticks off the rules and changes the password', async () => {
    mockChangePassword.mockResolvedValue({});
    const { getByLabelText, getByTestId, getByText } = render(<MyPasswordScreen />);
    fireEvent.changeText(getByLabelText('Current password'), 'Example-Pass-1');
    fireEvent.changeText(getByLabelText('New password'), 'Example-Pass-2');
    fireEvent.changeText(getByLabelText('Confirm new password'), 'Example-Pass-2');
    expect(getByLabelText('Passwords match: done')).toBeTruthy();
    expect(getByText(/Any other phone using your account will be logged out/)).toBeTruthy();

    fireEvent.press(getByTestId('change-password'));
    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('Example-Pass-1', 'Example-Pass-2'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("doesn't submit when the passwords don't match", async () => {
    const { getByLabelText, getByTestId, findByText } = render(<MyPasswordScreen />);
    fireEvent.changeText(getByLabelText('Current password'), 'Example-Pass-1');
    fireEvent.changeText(getByLabelText('New password'), 'Example-Pass-2');
    fireEvent.changeText(getByLabelText('Confirm new password'), 'Example-Pass-3');
    fireEvent.press(getByTestId('change-password'));
    expect(await findByText('Check the requirements below')).toBeTruthy();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });
});
