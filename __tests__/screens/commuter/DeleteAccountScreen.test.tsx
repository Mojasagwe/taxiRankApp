import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import DeleteAccountScreen from '../../../src/screens/commuter/DeleteAccountScreen';
import { myAccountService } from '../../../src/services/api/account';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
const mockLogout = jest.fn();
jest.mock('../../../src/context/AuthContext', () => ({ useAuth: () => ({ logout: mockLogout, can: () => true }) }));
jest.mock('../../../src/services/api/account', () => ({ myAccountService: { deleteAccount: jest.fn() } }));
jest.mock('../../../src/services/api/applications', () => ({
  applicationService: {
    mine: jest.fn().mockResolvedValue([{ id: 3, status: 'PENDING', proposedRank: { name: 'Bree Street Taxi Rank' } }]),
  },
}));

describe('DeleteAccountScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('warns that an open application will be withdrawn', async () => {
    const { findByText } = render(<DeleteAccountScreen />);
    expect(await findByText(/Bree Street Taxi Rank\) will be withdrawn/)).toBeTruthy();
  });

  it('only enables delete once DELETE and the password are entered, then logs out', async () => {
    (myAccountService.deleteAccount as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId, getByLabelText } = render(<DeleteAccountScreen />);
    const button = getByTestId('confirm-delete');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByLabelText('Password'), 'Example-Pass-1');
    fireEvent.changeText(getByLabelText('Type DELETE to confirm'), 'DELE');
    expect(getByTestId('confirm-delete').props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByLabelText('Type DELETE to confirm'), 'delete');
    expect(getByTestId('confirm-delete').props.accessibilityState.disabled).toBe(false);
    fireEvent.press(getByTestId('confirm-delete'));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(myAccountService.deleteAccount).toHaveBeenCalledWith('Example-Pass-1', 'delete');
  });

  it('stays put when the password is wrong', async () => {
    (myAccountService.deleteAccount as jest.Mock).mockRejectedValue({ response: { status: 400, data: { error: 'Password is incorrect' } } });
    const { getByTestId, getByLabelText, findByText } = render(<DeleteAccountScreen />);
    fireEvent.changeText(getByLabelText('Password'), 'wrong');
    fireEvent.changeText(getByLabelText('Type DELETE to confirm'), 'DELETE');
    fireEvent.press(getByTestId('confirm-delete'));
    expect(await findByText('Password is incorrect')).toBeTruthy();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
