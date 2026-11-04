// Mirrors the backend's TripDtos and MyAccountDtos (com.taxirank.backend.dto)

/** ACTIVE: the rider is in the taxi now */
export type TripStatus = 'PLANNED' | 'ACTIVE' | 'TAKEN';

export interface Trip {
  id: number;
  rank: { id: number; code: string; name: string };
  terminalId?: number;
  destination: string;
  fare: number;
  status: TripStatus;
  /** Local date-time, e.g. 2026-11-04T07:12:00 */
  tripDate: string;
  bay?: string;
  /** Riders' taps: in the taxi, taxi left, arrived */
  boardedAt?: string;
  departedAt?: string;
  arrivedAt?: string;
}

export type QueueReport = 'TAXI_LOADING' | 'WAITED' | 'LONG_QUEUE';
export type RideRating = 'GOOD' | 'OK' | 'BAD';

export interface TripFeedback {
  farePaid?: number;
  queue?: QueueReport;
  rating?: RideRating;
}

/** Counts taken trips only */
export interface TripSummary {
  tripsTaken: number;
  spentThisMonth: number;
  ranksUsed: number;
}

/** A destination served from a rank, with its fare */
export interface Destination {
  id: number;
  name: string;
  fare: number;
  travelTime?: string;
  distance?: string;
}

export interface LogTripRequest {
  terminalId: number;
  status: TripStatus;
  tripDate?: string;
}

export interface NotificationSettings {
  applicationUpdates: boolean;
  rankChanges: boolean;
  news: boolean;
}
