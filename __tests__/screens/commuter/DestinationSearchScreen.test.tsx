import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import DestinationSearchScreen from '../../../src/screens/commuter/DestinationSearchScreen';
import { journeyService } from '../../../src/services/api/journeys';
import { recentPlaces } from '../../../src/services/recentPlaces';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ replace: mockReplace, goBack: jest.fn() }),
  useRoute: () => ({ params: { radiusKm: 2 } }),
}));
jest.mock('../../../src/services/api/journeys', () => ({ journeyService: { places: jest.fn() } }));
jest.mock('../../../src/services/recentPlaces', () => ({
  recentPlaces: { list: jest.fn().mockResolvedValue([]), add: jest.fn().mockResolvedValue(undefined) },
}));

const bara = { name: 'Soweto · Bara', area: 'Route destination', latitude: -26.26, longitude: 27.94, kind: 'ROUTE_END' };

describe('DestinationSearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('searches after a pause in typing and opens results for the chosen place', async () => {
    (journeyService.places as jest.Mock).mockResolvedValue([bara]);
    const { getByLabelText, findByText } = render(<DestinationSearchScreen />);
    fireEvent.changeText(getByLabelText('Destination'), 'ba');
    fireEvent.changeText(getByLabelText('Destination'), 'bara');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(journeyService.places).toHaveBeenCalledTimes(1);
    expect(journeyService.places).toHaveBeenCalledWith('bara');

    fireEvent.press(await findByText('Soweto · Bara'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('JourneyResults', { place: bara, radiusKm: 2 }));
    expect(recentPlaces.add).toHaveBeenCalledWith(bara);
  });

  it('says when nothing matches', async () => {
    (journeyService.places as jest.Mock).mockResolvedValue([]);
    const { getByLabelText, findByText } = render(<DestinationSearchScreen />);
    fireEvent.changeText(getByLabelText('Destination'), 'Nowhere');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(await findByText(/No place called "Nowhere" yet/)).toBeTruthy();
  });
});
