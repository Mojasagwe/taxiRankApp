import { clockIn, formatClock, formatDistance, formatDuration, isPast, waitText } from '../../../src/screens/commuter/journeyFormat';

describe('journeyFormat', () => {
  it('formats clocks, distances and durations', () => {
    expect(formatClock('19:30:00')).toBe('19:30');
    expect(formatClock(null)).toBeUndefined();
    expect(formatDistance(0.38)).toBe('380 m');
    expect(formatDistance(1.24)).toBe('1.2 km');
    expect(formatDuration(40)).toBe('40 min');
    expect(formatDuration(70)).toBe('1 h 10 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(clockIn(45, new Date(2026, 10, 4, 16, 20))).toBe('17:05');
  });

  it("prefers riders' wait times over the rank's interval", () => {
    const leg = { terminalId: 1, destination: 'Bara', fare: 18, runningToday: true, riderTrips: 0 };
    expect(waitText({ ...leg, typicalWaitNow: 8, intervalMinutes: 15 })).toBe('~8 min');
    expect(waitText({ ...leg, intervalMinutes: 15 })).toBe('every 15 min');
    expect(waitText(leg)).toBe('—');
  });

  it('knows when a time today has passed', () => {
    const now = new Date(2026, 10, 4, 18, 26);
    expect(isPast('17:08:00', now)).toBe(true);
    expect(isPast('19:00', now)).toBe(false);
    expect(isPast(null, now)).toBe(false);
  });
});
