import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TripQuestionsScreen from '../../../src/screens/commuter/TripQuestionsScreen';
import { tripService } from '../../../src/services/api/trips';

const mockReset = jest.fn();
const trip = { id: 9, rank: { id: 1, code: 'CTR001', name: 'Central Taxi Rank' }, destination: 'Soweto · Bara', fare: 18, status: 'TAKEN', tripDate: '' };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ reset: mockReset }),
  useRoute: () => ({ params: { trip } }),
}));
jest.mock('../../../src/services/api/trips', () => ({ tripService: { feedback: jest.fn() } }));

describe('TripQuestionsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends a different fare, the queue and the rating', async () => {
    (tripService.feedback as jest.Mock).mockResolvedValue(undefined);
    const { getByText, getByLabelText, getByTestId } = render(<TripQuestionsScreen />);
    fireEvent.press(getByText('I paid more'));
    fireEvent.changeText(getByLabelText('What did you pay?'), 'R20');
    fireEvent.press(getByText('Long queue of people'));
    fireEvent.press(getByText('Good'));
    fireEvent.press(getByTestId('send-answers'));
    await waitFor(() => expect(tripService.feedback).toHaveBeenCalledWith(9, { farePaid: 20, queue: 'LONG_QUEUE', rating: 'GOOD' }));
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Trips' } }] });
  });

  it('confirms the listed fare, and skips without sending anything', async () => {
    (tripService.feedback as jest.Mock).mockResolvedValue(undefined);
    const { getByText, getByTestId, rerender } = render(<TripQuestionsScreen />);
    fireEvent.press(getByText('Yes, R18'));
    fireEvent.press(getByTestId('send-answers'));
    await waitFor(() => expect(tripService.feedback).toHaveBeenCalledWith(9, { farePaid: 18 }));

    jest.clearAllMocks();
    rerender(<TripQuestionsScreen />);
    fireEvent.press(getByText('Skip'));
    expect(tripService.feedback).not.toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  it('needs an amount when the fare was different', async () => {
    const { getByText, getByTestId, findByText } = render(<TripQuestionsScreen />);
    fireEvent.press(getByText('I paid less'));
    fireEvent.press(getByTestId('send-answers'));
    expect(await findByText(/Enter what you paid/)).toBeTruthy();
    expect(tripService.feedback).not.toHaveBeenCalled();
  });
});
