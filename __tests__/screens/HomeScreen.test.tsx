import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { applicationService } from '../../src/services/api/applications';
import { tripService } from '../../src/services/api/trips';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});

const mockCan = jest.fn((_p: string) => true);
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { firstName: 'Lerato' }, can: mockCan }),
}));

const mockLocation = { location: { latitude: -26.2041, longitude: 28.0435 } as any, problem: null as any, locating: false, locate: jest.fn() };
jest.mock('../../src/hooks/useCurrentLocation', () => ({ useCurrentLocation: () => mockLocation }));

jest.mock('../../src/services/api/ranks', () => ({
  rankService: {
    list: jest.fn().mockResolvedValue([
      { id: 1, name: 'Central Taxi Rank', address: '123 Main Street', latitude: -26.2041, longitude: 28.0473, isActive: true },
      { id: 2, name: 'Sandton City Rank', address: '25 Maude Street', latitude: -26.1067, longitude: 28.0567, isActive: true },
    ]),
  },
}));
jest.mock('../../src/services/api/trips', () => ({ tripService: { active: jest.fn() } }));
jest.mock('../../src/services/api/applications', () => ({ applicationService: { mine: jest.fn() } }));
jest.mock('../../src/services/recentPlaces', () => ({
  recentPlaces: { list: jest.fn().mockResolvedValue([{ name: 'Soweto · Bara', area: 'Route destination', latitude: -26.26, longitude: 27.94, kind: 'ROUTE_END' }]) },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.problem = null;
    (tripService.active as jest.Mock).mockResolvedValue(null);
    (applicationService.mine as jest.Mock).mockResolvedValue([]);
  });

  it('asks where to and opens the search with the chosen radius', async () => {
    const { getByTestId, getByRole, findByText } = render(<HomeScreen />);
    await findByText('Near Central Taxi Rank');
    fireEvent.press(getByRole('button', { name: '5 km' }));
    fireEvent.press(getByTestId('where-to'));
    expect(mockNavigate).toHaveBeenCalledWith('DestinationSearch', { radiusKm: 5 });
  });

  it('lists ranks within the radius only', async () => {
    const { findByText, queryByText, getByRole } = render(<HomeScreen />);
    expect(await findByText('Central Taxi Rank')).toBeTruthy();
    expect(queryByText('Sandton City Rank')).toBeNull(); // ~11 km away
    fireEvent.press(getByRole('button', { name: '1 km' }));
    expect(await findByText('Central Taxi Rank')).toBeTruthy();
  });

  it('goes straight to results from a recent destination', async () => {
    const { findByText } = render(<HomeScreen />);
    fireEvent.press(await findByText('Soweto · Bara'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyResults', expect.objectContaining({ radiusKm: 2, place: expect.objectContaining({ name: 'Soweto · Bara' }) }));
  });

  it('shows the trip in progress', async () => {
    (tripService.active as jest.Mock).mockResolvedValue({ id: 9, rank: { name: 'Central Taxi Rank' }, destination: 'Soweto · Bara' });
    const { findByTestId } = render(<HomeScreen />);
    fireEvent.press(await findByTestId('active-trip'));
    expect(mockNavigate).toHaveBeenCalledWith('ActiveTrip');
  });

  it('explains when location is off', async () => {
    mockLocation.problem = 'denied';
    const { findByText } = render(<HomeScreen />);
    expect(await findByText('Location is off')).toBeTruthy();
  });

  it('still offers rank admin applications', async () => {
    const { findByTestId } = render(<HomeScreen />);
    fireEvent.press(await findByTestId('apply-entry'));
    expect(mockNavigate).toHaveBeenCalledWith('Apply');
  });
});
