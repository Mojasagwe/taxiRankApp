import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import RouteDetailScreen from '../../../src/screens/commuter/RouteDetailScreen';
import { journeyService } from '../../../src/services/api/journeys';
import { tripService } from '../../../src/services/api/trips';

const mockNavigate = jest.fn();
const option = {
  rank: { id: 1, code: 'CTR001', name: 'Central Taxi Rank', address: '123 Main Street', latitude: -26.2041, longitude: 28.0473 },
  walkKm: 0.38,
  walkMinutes: 6,
  route: { terminalId: 1, destination: 'Soweto · Bara', fare: 18, bay: 'Bay 4', travelTime: '40 min', travelMinutes: 40, intervalMinutes: 15, runningToday: true, lastTaxiToday: '19:30:00', typicalWaitNow: 8, riderTrips: 120 },
};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: { option, place: { name: 'Bara' } } }),
}));
jest.mock('../../../src/services/api/journeys', () => ({ journeyService: { insights: jest.fn() } }));
jest.mock('../../../src/services/api/trips', () => ({ tripService: { start: jest.fn(), log: jest.fn() } }));

const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, typicalWaitMinutes: hour >= 5 && hour <= 19 ? 10 : null, samples: 9 }));

describe('RouteDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (journeyService.insights as jest.Mock).mockResolvedValue({
      terminalId: 1, dayType: 'WEEKDAY', windowDays: 28, riderTrips: 126, hours, lastTaxiByRank: '19:30:00', latestDepartureSeen: '20:10:00',
    });
  });

  it("shows the rank's details, riders' trends and the last taxi", async () => {
    const { findByText, getByText } = render(<RouteDetailScreen />);
    expect(getByText('Soweto · Bara')).toBeTruthy();
    expect(getByText('Bay 4')).toBeTruthy();
    expect(getByText('Rank says: a taxi about every 15 min')).toBeTruthy();
    expect(await findByText(/From 126 rider trips on weekdays/)).toBeTruthy();
    expect(getByText('Last taxi usually 19:30')).toBeTruthy();
    expect(getByText('Riders saw one as late as 20:10.')).toBeTruthy();
  });

  it('opens walking directions to the rank', () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { getByTestId } = render(<RouteDetailScreen />);
    fireEvent.press(getByTestId('directions'));
    expect(open).toHaveBeenCalledWith('https://www.google.com/maps/dir/?api=1&destination=-26.2041,28.0473&travelmode=walking');
  });

  it('starts the trip, or opens the one already in progress', async () => {
    (tripService.start as jest.Mock).mockResolvedValueOnce({ id: 9 }).mockRejectedValueOnce({ response: { status: 409, data: {} } });
    const { getByTestId } = render(<RouteDetailScreen />);
    fireEvent.press(getByTestId('start-trip'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('ActiveTrip'));
    expect(tripService.start).toHaveBeenCalledWith(1);

    mockNavigate.mockClear();
    fireEvent.press(getByTestId('start-trip'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('ActiveTrip'));
  });
});
