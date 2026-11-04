import { formatFare, formatTripDate, groupByMonth, toLocalDateTime } from '../../../src/screens/commuter/tripFormat';

const now = new Date(2026, 10, 4, 9, 0); // Wed 4 Nov 2026

describe('tripFormat', () => {
  it('formats fares in rand', () => {
    expect(formatFare(18)).toBe('R18');
    expect(formatFare(22.5)).toBe('R22.50');
  });

  it('describes dates relative to today', () => {
    expect(formatTripDate('2026-11-04T07:12:00', now)).toBe('Today, 07:12');
    expect(formatTripDate('2026-11-05T06:30:00', now)).toBe('Tomorrow, 06:30');
    expect(formatTripDate('2026-11-02T16:40:00', now)).toBe('Mon 2 Nov, 16:40');
    expect(formatTripDate('2025-12-31T08:00:00', now)).toBe('Wed 31 Dec 2025, 08:00');
  });

  it('round-trips local date-times', () => {
    expect(toLocalDateTime(new Date(2026, 0, 9, 7, 5))).toBe('2026-01-09T07:05:00');
  });

  it('only counts taken trips in a month total', () => {
    const rank = { id: 1, code: 'C', name: 'Central' };
    const [month] = groupByMonth([
      { id: 1, rank, destination: 'A', fare: 18, status: 'TAKEN', tripDate: '2026-11-02T07:00:00' },
      { id: 2, rank, destination: 'B', fare: 22, status: 'PLANNED', tripDate: '2026-11-03T07:00:00' },
    ]);
    expect(month.title).toBe('NOVEMBER 2026');
    expect(month.spent).toBe(18);
    expect(month.trips).toHaveLength(2);
  });
});
