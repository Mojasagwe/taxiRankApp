import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import JourneyResultsScreen from '../../../src/screens/commuter/JourneyResultsScreen';
import { journeyService } from '../../../src/services/api/journeys';

const mockNavigate = jest.fn();
const place = { name: 'Mamelodi West', area: '', latitude: -25.72, longitude: 28.395, kind: 'ROUTE_END' };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: { place, radiusKm: 2 } }),
}));
// Same object every render, as the real hook keeps it in state
const mockLocation = { location: { latitude: -26.2041, longitude: 28.0435 }, problem: null, locating: false, locate: jest.fn() };
jest.mock('../../../src/hooks/useCurrentLocation', () => ({ useCurrentLocation: () => mockLocation }));
jest.mock('../../../src/services/api/journeys', () => ({ journeyService: { search: jest.fn() } }));

const rank = (id: number, name: string) => ({ id, code: 'X', name, latitude: -26.2, longitude: 28.04 });
const leg = (terminalId: number, destination: string, fare: number, extra = {}) => ({
  terminalId, destination, fare, runningToday: true, riderTrips: 0, travelTime: '40 min', travelMinutes: 40, ...extra,
});

describe('JourneyResultsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows direct ranks with fare, wait and last taxi', async () => {
    (journeyService.search as jest.Mock).mockResolvedValue({
      radiusKm: 2, ranksInRadius: 2, connecting: [], further: [],
      direct: [{ rank: rank(1, 'Central Taxi Rank'), walkKm: 0.38, walkMinutes: 6, route: leg(1, 'Mamelodi West', 18, { typicalWaitNow: 8, lastTaxiToday: '19:30:00', bay: 'Bay 4' }) }],
    });
    const { findByText, getByText } = render(<JourneyResultsScreen />);
    expect(await findByText('Central Taxi Rank')).toBeTruthy();
    expect(getByText('380 m · 6 min walk · Bay 4')).toBeTruthy();
    expect(getByText('~8 min')).toBeTruthy();
    expect(getByText('19:30')).toBeTruthy();
    fireEvent.press(getByText('Central Taxi Rank'));
    expect(mockNavigate).toHaveBeenCalledWith('RouteDetail', expect.objectContaining({ place }));
  });

  it('offers a change and a wider search when nothing is direct', async () => {
    (journeyService.search as jest.Mock).mockResolvedValue({
      radiusKm: 2, ranksInRadius: 2, direct: [], further: [],
      connecting: [{
        rank: rank(11, 'Bree Street Taxi Rank'), walkKm: 0.3, walkMinutes: 5, changeAt: rank(3, 'Pretoria Central Rank'),
        firstLeg: leg(4, 'Pretoria', 45), secondLeg: leg(5, 'Mamelodi West', 16), totalFare: 61, totalMinutes: 140, leaveBy: '23:59:00',
      }],
    });
    const { findByText, getByText } = render(<JourneyResultsScreen />);
    expect(await findByText('No direct taxi within 2 km')).toBeTruthy();
    expect(getByText('Bree Street Taxi Rank → Pretoria Central Rank')).toBeTruthy();
    expect(getByText('R61')).toBeTruthy();
    expect(getByText('Leave by 23:59')).toBeTruthy();
    expect(getByText('About 2 h 20 min door to door')).toBeTruthy();

    fireEvent.press(getByText('Search within 5 km'));
    await waitFor(() => expect(journeyService.search).toHaveBeenLastCalledWith(expect.anything(), place, 5));
  });

  it('says when the last connecting taxi has already gone', async () => {
    (journeyService.search as jest.Mock).mockResolvedValue({
      radiusKm: 2, ranksInRadius: 2, direct: [], further: [],
      connecting: [{
        rank: rank(11, 'Bree Street Taxi Rank'), walkKm: 0.3, walkMinutes: 5, changeAt: rank(3, 'Pretoria Central Rank'),
        firstLeg: leg(4, 'Pretoria', 45), secondLeg: leg(5, 'Mamelodi West', 16), totalFare: 61, leaveBy: '00:00:00',
      }],
    });
    const { findByText } = render(<JourneyResultsScreen />);
    // Any time after midnight has passed 00:00 (the test fails only in the minute 00:00–00:01)
    expect(await findByText('Too late today')).toBeTruthy();
  });
});
