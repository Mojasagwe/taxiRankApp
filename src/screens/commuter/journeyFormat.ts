import { RouteLeg } from '../../types/journeys';

/** "19:30:00" → "19:30" */
export const formatClock = (time?: string | null) => (time ? time.slice(0, 5) : undefined);

/** 0.38 → "380 m", 1.2 → "1.2 km" */
export const formatDistance = (km: number) => (km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`);

/** 70 → "1 h 10 min" */
export const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;

/** How soon a taxi leaves: riders' data first, else the rank's interval */
export const waitText = (leg: RouteLeg) =>
  leg.typicalWaitNow != null ? `~${leg.typicalWaitNow} min` : leg.intervalMinutes ? `every ${leg.intervalMinutes} min` : '—';

/** The current time plus minutes, as "17:05" */
export const clockIn = (minutes: number, now = new Date()) => {
  const at = new Date(now.getTime() + minutes * 60000);
  return `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
};

/** True when a "HH:mm[:ss]" time today has already passed */
export const isPast = (time?: string | null, now = new Date()) => {
  if (!time) return false;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m < now.getHours() * 60 + now.getMinutes();
};
