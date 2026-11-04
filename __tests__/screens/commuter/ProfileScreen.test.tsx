import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ProfileScreen from '../../../src/screens/commuter/ProfileScreen';
import { myAccountService } from '../../../src/services/api/account';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});

const mockLogout = jest.fn();
const mockUpdateUser = jest.fn();
const mockUser = { id: 7, firstName: 'Lerato', displayName: 'Lerato Mokoena', email: 'lerato@example.com', phoneNumber: '0821234567' };
jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout, updateUser: mockUpdateUser, can: () => true }),
}));
jest.mock('../../../src/services/api/trips', () => ({
  tripService: { summary: jest.fn().mockResolvedValue({ tripsTaken: 12, spentThisMonth: 85, ranksUsed: 3 }) },
}));
jest.mock('../../../src/services/api/account', () => ({
  myAccountService: { uploadPhoto: jest.fn(), removePhoto: jest.fn(), photoSource: jest.fn() },
}));

describe('ProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the rider, their initials and trip stats', async () => {
    const { getByText, getByTestId, findByText } = render(<ProfileScreen />);
    expect(getByText('Lerato Mokoena')).toBeTruthy();
    expect(getByText('lerato@example.com  ·  0821234567')).toBeTruthy();
    expect(getByTestId('avatar-initials')).toBeTruthy();
    expect(getByText('LM')).toBeTruthy();
    expect(await findByText('12')).toBeTruthy();
    expect(getByText('R85')).toBeTruthy();
  });

  it('uploads a photo chosen from the gallery', async () => {
    (launchImageLibrary as jest.Mock).mockImplementation((_options, callback) =>
      callback({ assets: [{ uri: 'file:///photo.jpg', type: 'image/jpeg', fileName: 'photo.jpg' }] }),
    );
    const updated = { ...mockUser, photoUrl: '/api/users/7/photo?v=abc' };
    (myAccountService.uploadPhoto as jest.Mock).mockResolvedValue(updated);

    const { getByTestId, getByText } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('change-photo'));
    fireEvent.press(getByText('Choose from gallery'));

    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith(updated));
    expect(myAccountService.uploadPhoto).toHaveBeenCalledWith({ uri: 'file:///photo.jpg', type: 'image/jpeg', fileName: 'photo.jpg' });
  });

  it('explains a camera permission problem', async () => {
    const { launchCamera } = require('react-native-image-picker');
    (launchCamera as jest.Mock).mockImplementation((_options, callback) => callback({ errorCode: 'permission' }));
    const { getByTestId, getByText, findByText } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('change-photo'));
    fireEvent.press(getByText('Take a photo'));
    expect(await findByText(/needs permission to use the camera/)).toBeTruthy();
    expect(myAccountService.uploadPhoto).not.toHaveBeenCalled();
  });

  it('opens account screens and logs out', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('row-edit-details'));
    expect(mockNavigate).toHaveBeenCalledWith('EditDetails');
    fireEvent.press(getByTestId('row-trips'));
    expect(mockNavigate).toHaveBeenCalledWith('Tabs', { screen: 'Trips' });
    fireEvent.press(getByTestId('logout-button'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
