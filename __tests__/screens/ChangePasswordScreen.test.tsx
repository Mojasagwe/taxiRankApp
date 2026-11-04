import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChangePasswordScreen from '../../src/screens/auth/ChangePasswordScreen';

const mockChangePassword = jest.fn();
let mockUser: any;
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, changePassword: mockChangePassword, logout: jest.fn() }),
}));

const enter = (getByTestId: (id: string) => any, current: string, next: string, confirm = next) => {
  fireEvent.changeText(getByTestId('current-password-input'), current);
  fireEvent.changeText(getByTestId('new-password-input'), next);
  fireEvent.changeText(getByTestId('confirm-password-input'), confirm);
  fireEvent.press(getByTestId('save-password-button'));
};

describe('ChangePasswordScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks rank accounts for at least 12 characters', async () => {
    mockUser = { displayName: 'Central Taxi Rank', rank: { id: 1, code: 'CTR001', name: 'Central Taxi Rank' } };
    const { getByTestId, getByText, findByText } = render(<ChangePasswordScreen />);
    expect(getByText("Set your rank's password")).toBeTruthy();
    enter(getByTestId, 'Temp-Pass-0001', 'short-pass');
    expect(await findByText('Check the requirements below')).toBeTruthy();
    expect(mockChangePassword).not.toHaveBeenCalled();

    enter(getByTestId, 'Temp-Pass-0001', 'Central-Rank-2026');
    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('Temp-Pass-0001', 'Central-Rank-2026'));
  });

  it('lets people use 8 characters and requires a match', async () => {
    mockUser = { displayName: 'Naledi Dube' };
    const { getByTestId, findByText } = render(<ChangePasswordScreen />);
    enter(getByTestId, 'Temp-Pass-0001', 'NewPass1', 'NewPass2');
    expect(await findByText('Check the requirements below')).toBeTruthy();

    enter(getByTestId, 'Temp-Pass-0001', 'NewPass1');
    await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith('Temp-Pass-0001', 'NewPass1'));
  });
});
