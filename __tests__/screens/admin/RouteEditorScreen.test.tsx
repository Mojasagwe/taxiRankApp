import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import RouteEditorScreen from '../../../src/screens/admin/RouteEditorScreen';
import { adminService } from '../../../src/services/api/admin';

const mockGoBack = jest.fn();
const terminal = {
  id: 1, name: 'Soweto · Bara', fare: 18, travelTime: '40 min', distance: '25 km', isActive: true, createdAt: '', updatedAt: '',
  bay: 'Bay 4', intervalMinutes: 15, runningToday: true, lastTaxiWeekday: '19:30:00',
  destinationLatitude: -26.261, destinationLongitude: 27.943, fareReport: { reportedFare: 20, reports: 7 },
};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: { rankId: 1, terminal } }),
}));
jest.mock('../../../src/services/api/ranks', () => ({
  rankService: { list: jest.fn().mockResolvedValue([{ id: 3, name: 'Pretoria Central Rank', city: 'Pretoria', isActive: true }]) },
}));
jest.mock('../../../src/services/api/admin', () => ({ adminService: { updateTerminal: jest.fn(), addTerminal: jest.fn(), confirmFare: jest.fn() } }));

describe('RouteEditorScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it("answers riders' fare reports", async () => {
    (adminService.confirmFare as jest.Mock).mockResolvedValue({ ...terminal, fare: 20, fareReport: null });
    const { getByText, queryByText, getByDisplayValue } = render(<RouteEditorScreen />);
    expect(getByText('7 riders paid R20 this week')).toBeTruthy();
    fireEvent.press(getByText('Set fare to R20'));
    await waitFor(() => expect(adminService.confirmFare).toHaveBeenCalledWith(1, 1, 20));
    expect(queryByText('7 riders paid R20 this week')).toBeNull();
    expect(getByDisplayValue('20')).toBeTruthy();
  });

  it('saves the whole route, keeping the map pin', async () => {
    (adminService.updateTerminal as jest.Mock).mockResolvedValue({ success: true });
    const { getByText, getByLabelText, getByTestId, findByText } = render(<RouteEditorScreen />);
    fireEvent.press(getByLabelText('Running today'));
    fireEvent.press(getByText('20 min'));
    fireEvent.changeText(getByLabelText('Last (Sat)'), '18:00');
    fireEvent.press(await findByText('Pretoria Central Rank'));
    fireEvent.press(getByTestId('save-route'));
    await waitFor(() => expect(adminService.updateTerminal).toHaveBeenCalled());
    expect((adminService.updateTerminal as jest.Mock).mock.calls[0][2]).toMatchObject({
      runningToday: false, intervalMinutes: 20, lastTaxiWeekday: '19:30', lastTaxiSaturday: '18:00', lastTaxiSunday: null,
      endsAtRankId: 3, destinationLatitude: -26.261, bay: 'Bay 4',
    });
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('checks times and required fields', async () => {
    const { getByLabelText, getByTestId, findByText } = render(<RouteEditorScreen />);
    fireEvent.changeText(getByLabelText('First taxi'), '5am');
    fireEvent.changeText(getByLabelText('Fare (R)'), '');
    fireEvent.press(getByTestId('save-route'));
    expect(await findByText('Use 24-hour time, e.g. 19:30')).toBeTruthy();
    expect(await findByText('Enter the fare in rand')).toBeTruthy();
    expect(adminService.updateTerminal).not.toHaveBeenCalled();
  });
});
