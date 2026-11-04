import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ApplicationReviewScreen from '../../src/screens/systemAdmin/ApplicationReviewScreen';
import { applicationService } from '../../src/services/api/applications';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ replace: mockReplace, goBack: jest.fn(), navigate: jest.fn() }),
    useRoute: () => ({ params: { id: 42 } }),
    useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]),
  };
});

jest.mock('../../src/services/api/applications', () => ({
  applicationService: { get: jest.fn(), approve: jest.fn(), reject: jest.fn(), requestInfo: jest.fn(), linkToRank: jest.fn() },
}));

const proposal = {
  id: 42,
  status: 'PENDING',
  applicant: { id: 7, name: 'Sipho Ndlovu', email: 'sipho@test.local', phoneNumber: '0725550142' },
  proposedRank: { name: 'Bree Street Taxi Rank', address: 'Cnr Bree & Joubert', city: 'Johannesburg', province: 'Gauteng', operatingHours: '04:30-21:00' },
  designation: 'Rank marshal',
  createdAt: '2026-11-01T10:00:00',
  updatedAt: '2026-11-01T10:00:00',
  nearbyRanks: [{ id: 1, code: 'CTR001', name: 'Central Taxi Rank', distanceMeters: 300, hasAccount: true }],
};

describe('ApplicationReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (applicationService.get as jest.Mock).mockResolvedValue(proposal);
  });

  it('warns about nearby ranks', async () => {
    const { findByText, getByText } = render(<ApplicationReviewScreen />);
    expect(await findByText('Possible duplicate')).toBeTruthy();
    expect(getByText(/Central Taxi Rank · CTR001 · 300 m away/)).toBeTruthy();
  });

  it('approves a proposal with a chosen code and shows the one-time login', async () => {
    (applicationService.approve as jest.Mock).mockResolvedValue({
      loginName: 'BSR001',
      temporaryPassword: 'Kx7m-Q2pR-9Tzc',
      application: { ...proposal, status: 'APPROVED', rank: { id: 9, code: 'BSR001', name: 'Bree Street Taxi Rank' } },
    });
    const { findByTestId, getByTestId } = render(<ApplicationReviewScreen />);
    fireEvent.changeText(await findByTestId('rank-code-input'), 'bsr001');
    fireEvent.press(getByTestId('approve-button'));

    await waitFor(() =>
      expect(applicationService.approve).toHaveBeenCalledWith(42, {
        code: 'BSR001',
        rank: expect.objectContaining({ name: 'Bree Street Taxi Rank', operatingHours: '04:30-21:00' }),
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith('Credentials', expect.objectContaining({ loginName: 'BSR001', temporaryPassword: 'Kx7m-Q2pR-9Tzc' }));
  });

  it('needs a reason to reject', async () => {
    (applicationService.reject as jest.Mock).mockResolvedValue({ ...proposal, status: 'REJECTED', reviewerNote: 'Not a real rank' });
    const { findByTestId, getByTestId, findByText } = render(<ApplicationReviewScreen />);
    fireEvent.press(await findByTestId('reject-button'));
    fireEvent.press(getByTestId('send-note-button'));
    expect(await findByText('Give a reason for rejecting')).toBeTruthy();
    expect(applicationService.reject).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId('note-input'), 'Not a real rank');
    fireEvent.press(getByTestId('send-note-button'));
    await waitFor(() => expect(applicationService.reject).toHaveBeenCalledWith(42, 'Not a real rank'));
    expect(await findByText('This application is closed.')).toBeTruthy();
  });
});
