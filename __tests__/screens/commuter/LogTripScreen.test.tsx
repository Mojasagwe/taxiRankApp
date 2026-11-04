import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LogTripScreen from '../../../src/screens/commuter/LogTripScreen';
import { tripService } from '../../../src/services/api/trips';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
}));
jest.mock('../../../src/services/api/ranks', () => ({
  rankService: {
    list: jest.fn().mockResolvedValue([
      { id: 1, name: 'Central Taxi Rank', city: 'Johannesburg', address: '1 Main St', isActive: true },
      { id: 2, name: 'Closed Rank', city: 'Durban', isActive: false },
    ]),
    destinations: jest.fn().mockResolvedValue([{ id: 8, name: 'Soweto · Bara', fare: 18, travelTime: '40 min' }]),
  },
}));
jest.mock('../../../src/services/api/trips', () => ({ tripService: { log: jest.fn() } }));

describe('LogTripScreen', () => {
  it('logs a taken trip from a rank to a destination', async () => {
    (tripService.log as jest.Mock).mockResolvedValue({});
    const { findByText, queryByText, getByTestId } = render(<LogTripScreen />);
    fireEvent.press(await findByText('Central Taxi Rank'));
    expect(queryByText('Closed Rank')).toBeNull();
    fireEvent.press(await findByText('Soweto · Bara'));
    fireEvent.press(getByTestId('save-trip'));
    await waitFor(() => expect(tripService.log).toHaveBeenCalledWith({ terminalId: 8, status: 'TAKEN', tripDate: undefined }));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('plans a trip for a chosen day and time', async () => {
    (tripService.log as jest.Mock).mockResolvedValue({});
    const { findByText, getByText, getByTestId } = render(<LogTripScreen />);
    fireEvent.press(await findByText('Central Taxi Rank'));
    fireEvent.press(await findByText('Soweto · Bara'));
    fireEvent.press(getByText("I'm planning it"));
    fireEvent.press(getByText('Tomorrow'));
    fireEvent.press(getByText('Evening'));
    fireEvent.press(getByTestId('save-trip'));
    await waitFor(() => expect(tripService.log).toHaveBeenCalled());
    const request = (tripService.log as jest.Mock).mock.calls.at(-1)[0];
    expect(request.status).toBe('PLANNED');
    expect(request.tripDate).toMatch(/T19:00:00$/);
  });
});
