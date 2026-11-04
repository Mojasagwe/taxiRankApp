import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { Permission, User } from '../../src/types/auth';

// Each area renders a marker so the test sees which one AppNavigator chose
jest.mock('../../src/navigation/AuthNavigator', () => () => require('react').createElement(require('react-native').Text, null, 'AUTH'));
jest.mock('../../src/navigation/CommuterNavigator', () => () => require('react').createElement(require('react-native').Text, null, 'COMMUTER'));
jest.mock('../../src/navigation/RankAdminNavigator', () => () => require('react').createElement(require('react-native').Text, null, 'RANK_ADMIN'));
jest.mock('../../src/navigation/SystemAdminNavigator', () => () => require('react').createElement(require('react-native').Text, null, 'SYSTEM_ADMIN'));
jest.mock('../../src/screens/auth/ChangePasswordScreen', () => () => require('react').createElement(require('react-native').Text, null, 'CHANGE_PASSWORD'));

let mockUser: User | null = null;
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    can: (p: Permission) => !!mockUser?.permissions.includes(p),
  }),
}));

const account = (permissions: Permission[], mustChangePassword = false): User => ({
  id: 1,
  firstName: 'Test',
  displayName: 'Test',
  loginName: 'test',
  profileCode: 'COMMUTER',
  profileName: 'Test',
  permissions,
  accountStatus: 'ACTIVE',
  mustChangePassword,
});

describe('AppNavigator routes by permission', () => {
  it.each([
    ['signed out', null, 'AUTH'],
    ['commuter', account(['APPLICATIONS_SUBMIT']), 'COMMUTER'],
    ['rank account', account(['RANK_MANAGE_OWN']), 'RANK_ADMIN'],
    ['system administrator', account(['USERS_VIEW', 'APPLICATIONS_REVIEW', 'RANKS_MANAGE']), 'SYSTEM_ADMIN'],
    ['temporary password beats everything', account(['USERS_VIEW'], true), 'CHANGE_PASSWORD'],
  ])('%s', (_label, user, expected) => {
    mockUser = user;
    const { getByText } = render(<AppNavigator />);
    expect(getByText(expected)).toBeTruthy();
  });
});
