// Mirrors the backend's RouteDtos (com.taxirank.backend.dto)

export type DayType = 'WEEKDAY' | 'SATURDAY' | 'SUNDAY';

export interface RankPoint {
  id: number;
  code: string;
  name: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
}

/** One route as a rider needs it right now. Times are "HH:mm:ss". */
export interface RouteLeg {
  terminalId: number;
  destination: string;
  fare: number;
  bay?: string;
  travelTime?: string;
  travelMinutes?: number;
  /** The rank's word */
  intervalMinutes?: number;
  runningToday: boolean;
  firstTaxi?: string;
  lastTaxiToday?: string;
  /** From riders' taps; null when too few */
  typicalWaitNow?: number;
  latestDepartureSeen?: string;
  riderTrips: number;
}

export interface DirectOption {
  rank: RankPoint;
  walkKm: number;
  walkMinutes: number;
  route: RouteLeg;
}

export interface ConnectingOption {
  rank: RankPoint;
  walkKm: number;
  walkMinutes: number;
  firstLeg: RouteLeg;
  changeAt: RankPoint;
  secondLeg: RouteLeg;
  totalFare: number;
  totalMinutes?: number;
  leaveBy?: string;
}

export interface JourneyResults {
  radiusKm: number;
  ranksInRadius: number;
  direct: DirectOption[];
  connecting: ConnectingOption[];
  /** Direct ranks outside the radius, only when nothing inside goes direct */
  further: DirectOption[];
}

/** A destination: from Travy's own routes and ranks now, Google place search later */
export interface Place {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  kind: 'ROUTE_END' | 'RANK' | 'GOOGLE';
}

export interface HourlyWait {
  hour: number;
  typicalWaitMinutes?: number | null;
  samples: number;
}

export interface RouteInsights {
  terminalId: number;
  dayType: DayType;
  windowDays: number;
  riderTrips: number;
  hours: HourlyWait[];
  typicalWaitNow?: number | null;
  lastTaxiByRank?: string | null;
  latestDepartureSeen?: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
