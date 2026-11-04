import api from './axios';
import { ApiResponse } from '../../types/auth';
import { Rank } from '../../types/admin';
import { Destination } from '../../types/trips';

/** Public, read-only rank list (each rank says whether it already has a rank account) */
export const rankService = {
  list: async (): Promise<Rank[]> => {
    const response = await api.get<ApiResponse<Rank[]>>('/ranks');
    return response.data.data ?? [];
  },

  /** Active destinations from a rank, with fares */
  destinations: async (rankId: number): Promise<Destination[]> => {
    const response = await api.get<ApiResponse<Destination[]>>(`/ranks/${rankId}/destinations`);
    return response.data.data ?? [];
  },
};
