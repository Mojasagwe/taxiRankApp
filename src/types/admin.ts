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
}

export interface RankDetails extends Rank {
  terminals: TaxiTerminal[];
  imageUrl?: string;
  openTime: string;
  closeTime: string;
}
