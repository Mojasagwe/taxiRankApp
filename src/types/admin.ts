// Ranks and terminals, mirroring TaxiRankDTO and TerminalDTO on the backend

export interface Rank {
  id: number;
  name: string;
  code: string;
  description?: string;
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  capacity?: number;
  isActive: boolean;
  /** Whether the rank already has its (single) rank admin account */
  hasAccount?: boolean;
  terminalCount?: number;
  activeTerminalCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxiTerminal {
  id: number;
  name: string;     // Destination name (e.g., "Pretoria", "Bloemfontein")
  fare: number;     // Fare amount in Rands
  travelTime: string; // Estimated travel time (e.g., "2 hours")
  distance: string;  // Distance to destination (e.g., "120km")
  departureSchedule?: string; // When taxis leave (e.g., "Every hour from 6AM-6PM")
  operatingDays?: string[];  // Days of the week when the route operates
  isActive: boolean; // Whether this terminal is active
  createdAt: string;
  updatedAt: string;
  /** Where the route ends: a map point and/or the rank it ends at */
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  destinationPlaceId?: string | null;
  endsAtRankId?: number | null;
  endsAtRankName?: string;
  bay?: string | null;
  /** The rank's word: a taxi leaves about every N minutes */
  intervalMinutes?: number | null;
  /** false = paused today only */
  runningToday?: boolean;
  /** "HH:mm" or "HH:mm:ss" */
  firstTaxi?: string | null;
  lastTaxiWeekday?: string | null;
  lastTaxiSaturday?: string | null;
  lastTaxiSunday?: string | null;
  /** Rank admin view only: riders paying a different fare since the rank last confirmed it */
  fareReport?: { reportedFare: number; reports: number } | null;
}

export interface RankDetails extends Rank {
  terminals: TaxiTerminal[];
  imageUrl?: string;
  openTime: string;
  closeTime: string;
}
