import { Trip } from '../../types/trips';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** R18, R22.50 */
export const formatFare = (fare: number) => `R${Number.isInteger(fare) ? fare : fare.toFixed(2)}`;

const pad = (n: number) => String(n).padStart(2, '0');

// The server sends local date-times without a zone; read them as local time
const parse = (value: string) => {
  const [date, time = '00:00'] = value.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

/** "Today, 07:12", "Tomorrow, 06:30", "Mon 2 Nov, 16:40" */
export const formatTripDate = (value: string, now = new Date()) => {
  const date = parse(value);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const dayDiff = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
      86_400_000,
  );
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  if (dayDiff === -1) return `Yesterday, ${time}`;
  const year = date.getFullYear() === now.getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}${year}, ${time}`;
};

/** A local date-time string the server accepts, e.g. 2026-11-04T07:12:00 */
export const toLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

export interface TripMonth {
  key: string;
  title: string;
  /** Sum of taken trips */
  spent: number;
  trips: Trip[];
}

/** Groups newest-first trips by month, e.g. "NOVEMBER 2026" with what was spent */
export const groupByMonth = (trips: Trip[]): TripMonth[] => {
  const groups: TripMonth[] = [];
  for (const trip of trips) {
    const date = parse(trip.tripDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.find(g => g.key === key);
    if (!group) {
      group = { key, title: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`.toUpperCase(), spent: 0, trips: [] };
      groups.push(group);
    }
    group.trips.push(trip);
    if (trip.status === 'TAKEN') {
      group.spent += trip.fare;
    }
  }
  return groups;
};
