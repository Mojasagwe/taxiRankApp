import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import EditDetailsScreen from '../../../src/screens/commuter/EditDetailsScreen';
import { myAccountService } from '../../../src/services/api/account';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
}));

const mockUpdateUser = jest.fn();
jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 7, firstName: 'Lerato', lastName: 'Mokoena', email: 'lerato@example.com', phoneNumber: '0821234567' },
    updateUser: mockUpdateUser,
  }),
}));
jest.mock('../../../src/services/api/account', () => ({ myAccountService: { updateDetails: jest.fn() } }));

describe('EditDetailsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('saves a name change without asking for the password', async () => {
    (myAccountService.updateDetails as jest.Mock).mockResolvedValue({ id: 7 });
    const { getByLabelText, getByTestId, queryByTestId } = render(<EditDetailsScreen />);
    fireEvent.changeText(getByLabelText('First name'), 'Lera');
    expect(queryByTestId('details-password')).toBeNull();
    fireEvent.press(getByTestId('save-details'));
    await waitFor(() => expect(myAccountService.updateDetails).toHaveBeenCalledWith({ firstName: 'Lera' }));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('needs the current password to change the email', async () => {
    (myAccountService.updateDetails as jest.Mock).mockResolvedValue({ id: 7 });
    const { getByLabelText, getByTestId, findByText } = render(<EditDetailsScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'new@example.com');
    expect(getByTestId('details-password')).toBeTruthy();

    fireEvent.press(getByTestId('save-details'));
    expect(await findByText('Enter your current password')).toBeTruthy();
    expect(myAccountService.updateDetails).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Current password'), 'Example-Pass-1');
    fireEvent.press(getByTestId('save-details'));
    await waitFor(() =>
      expect(myAccountService.updateDetails).toHaveBeenCalledWith({ email: 'new@example.com', currentPassword: 'Example-Pass-1' }),
    );
  });

  it('shows the server error, e.g. a wrong password', async () => {
    (myAccountService.updateDetails as jest.Mock).mockRejectedValue({
      response: { status: 400, data: { error: 'Enter your current password to change your email or mobile number' } },
    });
    const { getByLabelText, getByTestId, findByText } = render(<EditDetailsScreen />);
    fireEvent.changeText(getByLabelText('Mobile number'), '0829999999');
    fireEvent.changeText(getByLabelText('Current password'), 'wrong-pass');
    fireEvent.press(getByTestId('save-details'));
    expect(await findByText(/to change your email or mobile number/)).toBeTruthy();
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
