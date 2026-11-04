import api from './axios';
import { ApiResponse } from '../../types/auth';
import { Rank } from '../../types/admin';

/** Public, read-only rank list (each rank says whether it already has a rank account) */
export const rankService = {
  list: async (): Promise<Rank[]> => {
    const response = await api.get<ApiResponse<Rank[]>>('/ranks');
    return response.data.data ?? [];
  },
};
