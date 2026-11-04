import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ActiveTripScreen from '../../../src/screens/commuter/ActiveTripScreen';
import { tripService } from '../../../src/services/api/trips';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ replace: mockReplace, goBack: jest.fn() }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});
jest.mock('../../../src/services/api/trips', () => ({
  tripService: { active: jest.fn(), departed: jest.fn(), arrived: jest.fn(), remove: jest.fn() },
}));

const base = { id: 9, rank: { id: 1, code: 'CTR001', name: 'Central Taxi Rank' }, destination: 'Soweto · Bara', fare: 18, bay: 'Bay 4', tripDate: '' };

describe('ActiveTripScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('records the taxi leaving, then arriving, then asks the questions', async () => {
    (tripService.active as jest.Mock).mockResolvedValue({ ...base, status: 'ACTIVE', boardedAt: '2026-11-04T16:32:00' });
    (tripService.departed as jest.Mock).mockResolvedValue({ ...base, status: 'ACTIVE', boardedAt: '2026-11-04T16:32:00', departedAt: '2026-11-04T16:41:00' });
    const taken = { ...base, status: 'TAKEN', boardedAt: '2026-11-04T16:32:00', departedAt: '2026-11-04T16:41:00', arrivedAt: '2026-11-04T17:20:00' };
    (tripService.arrived as jest.Mock).mockResolvedValue(taken);

    const { findByTestId, findByText, getByText } = render(<ActiveTripScreen />);
    expect(await findByText(/FILLING UP/)).toBeTruthy();
    expect(getByText('Central Taxi Rank · Bay 4')).toBeTruthy();

    fireEvent.press(await findByTestId('departed'));
    expect(await findByText('ON THE WAY')).toBeTruthy();
    expect(getByText('9 min')).toBeTruthy();

    fireEvent.press(await findByTestId('arrived'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('TripQuestions', { trip: taken }));
  });

  it('says when there is no trip in progress', async () => {
    (tripService.active as jest.Mock).mockResolvedValue(null);
    const { findByText } = render(<ActiveTripScreen />);
    expect(await findByText('No trip in progress.')).toBeTruthy();
  });
});
