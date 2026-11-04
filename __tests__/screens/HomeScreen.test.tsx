import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { applicationService } from '../../src/services/api/applications';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});

const mockCan = jest.fn((p: string) => p === 'APPLICATIONS_SUBMIT');
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { firstName: 'Lerato' }, logout: jest.fn(), can: mockCan }),
}));

jest.mock('../../src/services/api/ranks', () => ({
  rankService: {
    list: jest.fn().mockResolvedValue([
      { id: 1, code: 'CTR001', name: 'Central Taxi Rank', address: '123 Main Street', city: 'Johannesburg', province: 'Gauteng', operatingHours: '05:00-22:00', isActive: true },
    ]),
  },
}));
jest.mock('../../src/services/api/applications', () => ({ applicationService: { mine: jest.fn() } }));

describe('HomeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('greets the rider and lists ranks', async () => {
    (applicationService.mine as jest.Mock).mockResolvedValue([]);
    const { findByText, getByText } = render(<HomeScreen />);
    expect(getByText('Hi, Lerato')).toBeTruthy();
    expect(await findByText('Central Taxi Rank')).toBeTruthy();
  });

  it('offers to apply when there is no application', async () => {
    (applicationService.mine as jest.Mock).mockResolvedValue([]);
    const { findByText } = render(<HomeScreen />);
    fireEvent.press(await findByText('Apply to manage a rank'));
    expect(mockNavigate).toHaveBeenCalledWith('Apply');
  });

  it('shows the latest application status', async () => {
    (applicationService.mine as jest.Mock).mockResolvedValue([
      { id: 3, status: 'INFO_REQUESTED', proposedRank: { name: 'Bree Street Taxi Rank' }, applicant: {}, designation: 'Marshal', createdAt: '', updatedAt: '' },
    ]);
    const { findByText } = render(<HomeScreen />);
    expect(await findByText('Info requested')).toBeTruthy();
    fireEvent.press(await findByText('View my application'));
    expect(mockNavigate).toHaveBeenCalledWith('MyApplication');
  });
});
