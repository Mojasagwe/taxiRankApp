import api from './axios';
import { ApiResponse } from '../../types/auth';
import { LogTripRequest, Trip, TripFeedback, TripStatus, TripSummary } from '../../types/trips';

const data = <T>(response: { data: ApiResponse<T> }): T => response.data.data as T;

/** The signed-in rider's trip history (/api/trips) */
export const tripService = {
  /** Newest first */
  list: async (status?: TripStatus) => data<Trip[]>(await api.get('/trips', { params: status ? { status } : {} })),

  summary: async () => data<TripSummary>(await api.get('/trips/summary')),

  log: async (request: LogTripRequest) => data<Trip>(await api.post('/trips', request)),

  markTaken: async (id: number) => data<Trip>(await api.post(`/trips/${id}/taken`)),

  /** Also cancels a trip in progress */
  remove: async (id: number) => {
    await api.delete(`/trips/${id}`);
  },

  /** The trip in progress, if any */
  active: async () => data<Trip | null>(await api.get('/trips/active')) ?? null,

  /** "I'm in the taxi" */
  start: async (terminalId: number) => data<Trip>(await api.post('/trips/start', { terminalId })),

  /** "We've left the rank" */
  departed: async (id: number) => data<Trip>(await api.post(`/trips/${id}/departed`)),

  /** "I've arrived" */
  arrived: async (id: number) => data<Trip>(await api.post(`/trips/${id}/arrived`)),

  feedback: async (id: number, answers: TripFeedback) => {
    await api.post(`/trips/${id}/feedback`, answers);
  },
};
