import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TripsScreen from '../../../src/screens/commuter/TripsScreen';
import { tripService } from '../../../src/services/api/trips';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});
jest.mock('../../../src/services/api/trips', () => ({
  tripService: { list: jest.fn(), log: jest.fn(), markTaken: jest.fn(), remove: jest.fn() },
}));

const rank = { id: 1, code: 'CTR001', name: 'Central Taxi Rank' };
const trips = [
  { id: 3, rank, terminalId: 9, destination: 'Sandton', fare: 22, status: 'PLANNED', tripDate: '2026-11-20T07:00:00' },
  { id: 2, rank, terminalId: 8, destination: 'Soweto · Bara', fare: 18, status: 'TAKEN', tripDate: '2026-11-02T07:12:00' },
  { id: 1, rank, terminalId: 7, destination: 'Pretoria', fare: 45, status: 'TAKEN', tripDate: '2026-10-27T18:02:00' },
];

describe('TripsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tripService.list as jest.Mock).mockResolvedValue(trips);
  });

  it('groups trips by month with what was spent', async () => {
    const { findByText, getByText } = render(<TripsScreen />);
    expect(await findByText('NOVEMBER 2026')).toBeTruthy();
    expect(getByText('R18 spent')).toBeTruthy(); // the planned R22 doesn't count
    expect(getByText('OCTOBER 2026')).toBeTruthy();
    expect(getByText('R45 spent')).toBeTruthy();
  });

  it('filters to planned trips', async () => {
    const { findByText, queryByText, getByText, getByRole } = render(<TripsScreen />);
    await findByText('Sandton');
    fireEvent.press(getByRole('button', { name: 'Planned' }));
    expect(queryByText('Pretoria')).toBeNull();
    expect(getByText('Sandton')).toBeTruthy();
  });

  it('marks a planned trip as taken', async () => {
    (tripService.markTaken as jest.Mock).mockResolvedValue({});
    const { findByText } = render(<TripsScreen />);
    fireEvent.press(await findByText('I took it'));
    await waitFor(() => expect(tripService.markTaken).toHaveBeenCalledWith(3));
    expect(tripService.list).toHaveBeenCalledTimes(2);
  });

  it('invites a first trip when there are none', async () => {
    (tripService.list as jest.Mock).mockResolvedValue([]);
    const { findByText } = render(<TripsScreen />);
    fireEvent.press(await findByText('Log your first trip'));
    expect(mockNavigate).toHaveBeenCalledWith('LogTrip');
  });

  it('offers a retry when trips fail to load', async () => {
    (tripService.list as jest.Mock).mockRejectedValueOnce({ message: 'Network Error' });
    const { findByText } = render(<TripsScreen />);
    expect(await findByText('Cannot reach the Travy server')).toBeTruthy();
    fireEvent.press(await findByText('Try again'));
    expect(await findByText('Sandton')).toBeTruthy();
  });
});
