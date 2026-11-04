import api from './axios';
import { ApiResponse } from '../../types/auth';
import { Coordinates, DayType, JourneyResults, Place, RouteInsights } from '../../types/journeys';

const data = <T>(response: { data: ApiResponse<T> }): T => response.data.data as T;

/** Finding taxis to a destination */
export const journeyService = {
  search: async (from: Coordinates, to: Coordinates, radiusKm: number) =>
    data<JourneyResults>(
      await api.get('/journeys', {
        params: { fromLat: from.latitude, fromLng: from.longitude, toLat: to.latitude, toLng: to.longitude, radiusKm },
      }),
    ),

  /** Destinations Travy knows (route ends and ranks). Google place search replaces this once the app has a key. */
  places: async (query: string) => data<Place[]>(await api.get('/places', { params: { q: query } })),

  insights: async (rankId: number, terminalId: number, day?: DayType) =>
    data<RouteInsights>(await api.get(`/ranks/${rankId}/destinations/${terminalId}/insights`, { params: day ? { day } : {} })),
};
