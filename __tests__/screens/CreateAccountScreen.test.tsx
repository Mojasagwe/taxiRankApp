import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateAccountScreen from '../../src/screens/auth/CreateAccountScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const mockRegister = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

const fill = (getByTestId: (id: string) => any) => {
  fireEvent.changeText(getByTestId('first-name-input'), 'Sipho');
  fireEvent.changeText(getByTestId('last-name-input'), 'Ndlovu');
  fireEvent.changeText(getByTestId('email-input'), 'sipho@test.local');
  fireEvent.changeText(getByTestId('phone-input'), '072 555 0142');
  fireEvent.changeText(getByTestId('password-input'), 'Passw0rd!');
};

const expectedRequest = {
  firstName: 'Sipho',
  lastName: 'Ndlovu',
  email: 'sipho@test.local',
  phoneNumber: '072 555 0142',
  password: 'Passw0rd!',
};

describe('CreateAccountScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('signs up a rider by default', async () => {
    mockRegister.mockResolvedValue({});
    const { getByTestId, getByText } = render(<CreateAccountScreen />);
    expect(getByText('Create rider account')).toBeTruthy();
    fill(getByTestId);
    fireEvent.press(getByTestId('create-account-button'));
    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(expectedRequest, 'RIDER'));
  });

  it('switches to the rank admin path', async () => {
    mockRegister.mockResolvedValue({});
    const { getByTestId, getByText } = render(<CreateAccountScreen />);
    fireEvent.press(getByTestId('choose-RANK_ADMIN'));
    expect(getByText('Step 1 of 2')).toBeTruthy();
    expect(getByText('Continue to rank details')).toBeTruthy();
    expect(getByText('Password (to track your application)')).toBeTruthy();
    fill(getByTestId);
    fireEvent.press(getByTestId('create-account-button'));
    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(expectedRequest, 'RANK_ADMIN'));
  });

  it('validates before calling the backend', async () => {
    const { getByTestId, findByText } = render(<CreateAccountScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'not-an-email');
    fireEvent.changeText(getByTestId('password-input'), 'short');
    fireEvent.press(getByTestId('create-account-button'));
    expect(await findByText('Enter a valid email')).toBeTruthy();
    expect(await findByText('At least 8 characters')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows a duplicate-account error from the backend', async () => {
    mockRegister.mockRejectedValue({ response: { status: 409, data: { error: 'An account with this email already exists' } } });
    const { getByTestId, findByText } = render(<CreateAccountScreen />);
    fill(getByTestId);
    fireEvent.press(getByTestId('create-account-button'));
    expect(await findByText('An account with this email already exists')).toBeTruthy();
  });
});
