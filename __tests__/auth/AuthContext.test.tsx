import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/api/auth';
import { AuthContextType, User } from '../../src/types/auth';

jest.mock('../../src/services/api/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    changePassword: jest.fn(),
    storedUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mocked = authService as jest.Mocked<typeof authService>;

const user = (overrides: Partial<User> = {}): User => ({
  id: 1,
  firstName: 'Sipho',
  lastName: 'Ndlovu',
  displayName: 'Sipho Ndlovu',
  loginName: 'sipho@test.local',
  profileCode: 'COMMUTER',
  profileName: 'Commuter',
  permissions: ['APPLICATIONS_SUBMIT'],
  accountStatus: 'ACTIVE',
  mustChangePassword: false,
  ...overrides,
});

let auth: AuthContextType;
const Probe = () => {
  auth = useAuth();
  return <Text>{auth.loading ? 'loading' : auth.user?.displayName ?? 'signed out'}</Text>;
};
const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe('AuthContext', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mocked.storedUser.mockResolvedValue(null);
  });

  it('starts signed out when nothing is stored', async () => {
    const { getByText } = renderProvider();
    await waitFor(() => expect(getByText('signed out')).toBeTruthy());
    expect(mocked.me).not.toHaveBeenCalled();
  });

  it('logs in and checks permissions', async () => {
    mocked.login.mockResolvedValue(user());
    const { getByText } = renderProvider();
    await waitFor(() => getByText('signed out'));

    await act(() => auth.login('sipho@test.local', 'Passw0rd!'));

    expect(mocked.login).toHaveBeenCalledWith('sipho@test.local', 'Passw0rd!');
    expect(getByText('Sipho Ndlovu')).toBeTruthy();
    expect(auth.can('APPLICATIONS_SUBMIT')).toBe(true);
    expect(auth.can('USERS_VIEW')).toBe(false);
  });

  it('remembers that a person signed up as a rank admin', async () => {
    mocked.register.mockResolvedValue(user());
    renderProvider();
    await waitFor(() => expect(auth.loading).toBe(false));

    await act(() =>
      auth.register({ firstName: 'S', lastName: 'N', email: 's@test.local', phoneNumber: '0725550142', password: 'Passw0rd!' }, 'RANK_ADMIN'),
    );
    expect(auth.signUpIntent).toBe('RANK_ADMIN');

    act(() => auth.clearSignUpIntent());
    expect(auth.signUpIntent).toBeNull();
  });

  it('refreshes a stored session from the server on start', async () => {
    mocked.storedUser.mockResolvedValue(user({ displayName: 'Old name' }));
    mocked.me.mockResolvedValue(user({ displayName: 'Fresh name' }));
    const { getByText } = renderProvider();
    await waitFor(() => expect(getByText('Fresh name')).toBeTruthy());
  });

  it('signs out when the server rejects the stored session (e.g. suspended)', async () => {
    mocked.storedUser.mockResolvedValue(user());
    mocked.me.mockRejectedValue({ response: { status: 403, data: { error: 'Access denied' } } });
    const { getByText } = renderProvider();
    await waitFor(() => expect(getByText('signed out')).toBeTruthy());
    expect(mocked.logout).toHaveBeenCalled();
  });

  it('keeps the stored session when the server is unreachable', async () => {
    mocked.storedUser.mockResolvedValue(user());
    mocked.me.mockRejectedValue(new Error('Network Error'));
    const { getByText } = renderProvider();
    await waitFor(() => expect(getByText('Sipho Ndlovu')).toBeTruthy());
    expect(mocked.logout).not.toHaveBeenCalled();
  });
});
