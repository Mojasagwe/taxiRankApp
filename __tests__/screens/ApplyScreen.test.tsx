import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ApplyScreen from '../../src/screens/commuter/ApplyScreen';
import { applicationService } from '../../src/services/api/applications';
import { rankService } from '../../src/services/api/ranks';

const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ reset: mockReset, goBack: jest.fn(), navigate: jest.fn() }),
  useRoute: () => ({ params: undefined }),
}));

const mockClearSignUpIntent = jest.fn();
let mockSignUpIntent: string | null = null;
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ signUpIntent: mockSignUpIntent, clearSignUpIntent: mockClearSignUpIntent }),
}));

jest.mock('../../src/services/api/ranks', () => ({ rankService: { list: jest.fn() } }));
jest.mock('../../src/services/api/applications', () => ({
  applicationService: { submit: jest.fn(), resubmit: jest.fn(), get: jest.fn() },
}));

const ranks = [
  { id: 1, code: 'CTR001', name: 'Central Taxi Rank', address: '1 Main', city: 'Johannesburg', province: 'Gauteng', isActive: true, hasAccount: true },
  { id: 4, code: 'CTS001', name: 'Cape Town Station', address: 'Adderley', city: 'Cape Town', province: 'Western Cape', isActive: true, hasAccount: false },
];

describe('ApplyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUpIntent = null;
    (rankService.list as jest.Mock).mockResolvedValue(ranks);
    (applicationService.submit as jest.Mock).mockResolvedValue({ id: 9 });
  });

  it('applies for an available existing rank', async () => {
    const { findByTestId, getByTestId } = render(<ApplyScreen />);
    fireEvent.press(await findByTestId('rank-CTS001'));
    fireEvent.changeText(getByTestId('designation-input'), 'Association secretary');
    fireEvent.press(getByTestId('submit-application'));

    await waitFor(() =>
      expect(applicationService.submit).toHaveBeenCalledWith({ rankId: 4, designation: 'Association secretary', motivation: undefined }),
    );
    expect(mockReset).toHaveBeenCalledWith({ index: 1, routes: [{ name: 'Home' }, { name: 'MyApplication' }] });
  });

  it("won't select a rank that already has an admin", async () => {
    const { findByTestId, getByTestId, findByText } = render(<ApplyScreen />);
    fireEvent.press(await findByTestId('rank-CTR001'));
    fireEvent.changeText(getByTestId('designation-input'), 'Marshal');
    fireEvent.press(getByTestId('submit-application'));
    expect(await findByText(/Choose your rank/)).toBeTruthy();
    expect(applicationService.submit).not.toHaveBeenCalled();
  });

  it('proposes a rank that is not listed', async () => {
    const { findByText, getByText, getByTestId } = render(<ApplyScreen />);
    fireEvent.press(await findByText("My rank isn't listed"));
    fireEvent.changeText(getByTestId('proposed-name'), 'Bree Street Taxi Rank');
    fireEvent.changeText(getByTestId('proposed-address'), 'Cnr Bree & Joubert St');
    fireEvent.changeText(getByTestId('proposed-city'), 'Johannesburg');
    fireEvent.changeText(getByTestId('proposed-province'), 'Gauteng');
    fireEvent.changeText(getByTestId('designation-input'), 'Rank marshal');
    fireEvent.press(getByText('Submit application'));

    await waitFor(() =>
      expect(applicationService.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          proposedRank: expect.objectContaining({ name: 'Bree Street Taxi Rank', city: 'Johannesburg', province: 'Gauteng' }),
          designation: 'Rank marshal',
        }),
      ),
    );
  });

  it('shows the backend error, e.g. an open application already exists', async () => {
    (applicationService.submit as jest.Mock).mockRejectedValue({ response: { status: 409, data: { error: 'You already have an open application' } } });
    const { findByTestId, getByTestId, findByText } = render(<ApplyScreen />);
    fireEvent.press(await findByTestId('rank-CTS001'));
    fireEvent.changeText(getByTestId('designation-input'), 'Marshal');
    fireEvent.press(getByTestId('submit-application'));
    expect(await findByText('You already have an open application')).toBeTruthy();
  });

  it('is step 2 of 2 right after signing up as a rank admin, and can be skipped', async () => {
    mockSignUpIntent = 'RANK_ADMIN';
    const { findByText, getByText } = render(<ApplyScreen />);
    expect(await findByText('Step 2 of 2')).toBeTruthy();
    fireEvent.press(getByText('Skip for now'));
    expect(mockClearSignUpIntent).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] });
  });
});
