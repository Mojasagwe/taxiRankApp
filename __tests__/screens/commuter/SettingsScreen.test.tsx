import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../../src/screens/commuter/SettingsScreen';
import { myAccountService } from '../../../src/services/api/account';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));
jest.mock('../../../src/services/api/account', () => ({
  myAccountService: { notifications: jest.fn(), updateNotifications: jest.fn() },
}));

const saved = { applicationUpdates: true, rankChanges: true, news: false };

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (myAccountService.notifications as jest.Mock).mockResolvedValue(saved);
  });

  it('saves a switch as soon as it flips', async () => {
    (myAccountService.updateNotifications as jest.Mock).mockImplementation(async s => s);
    const { findByLabelText } = render(<SettingsScreen />);
    fireEvent.press(await findByLabelText('Travy news'));
    await waitFor(() => expect(myAccountService.updateNotifications).toHaveBeenCalledWith({ ...saved, news: true }));
  });

  it('flips back and says so when saving fails', async () => {
    (myAccountService.updateNotifications as jest.Mock).mockRejectedValue({ response: { status: 500, data: {} } });
    const { findByLabelText, findByText } = render(<SettingsScreen />);
    fireEvent.press(await findByLabelText('Travy news'));
    expect(await findByText('Could not save that change')).toBeTruthy();
    expect((await findByLabelText('Travy news')).props.accessibilityState.checked).toBe(false);
  });

  it('leads to delete account', async () => {
    const { findByTestId } = render(<SettingsScreen />);
    fireEvent.press(await findByTestId('row-delete-account'));
    expect(mockNavigate).toHaveBeenCalledWith('DeleteAccount');
  });
});
