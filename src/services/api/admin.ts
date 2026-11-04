import api from './axios';
import { ApiResponse } from '../../types/auth';
import { Rank, TaxiTerminal } from '../../types/admin';

/**
 * The rank account's own rank and its terminals. The backend only lets a rank
 * account change its own rank (RANK_MANAGE_OWN), so rankId always comes from
 * the logged-in user's rank.
 */
export const adminService = {
  // The logged-in rank account's rank, with terminal counts
  getMyRank: async (): Promise<ApiResponse<Rank>> => {
    try {
      const response = await api.get<ApiResponse<Rank>>('/dashboard/rank');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to load your rank' };
    }
  },

  // Update rank details. The code can't change (it is the rank account's login) but must be sent.
  updateRank: async (rankId: number, rank: Partial<Rank>): Promise<ApiResponse<Rank>> => {
    try {
      const response = await api.put<ApiResponse<Rank>>(`/taxi-ranks/${rankId}`, rank);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update rank details' };
    }
  },

  // Add Terminal to Rank
  addTerminal: async (rankId: number, terminal: Partial<TaxiTerminal>): Promise<{
    success: boolean;
    data?: TaxiTerminal;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.post<{
        success: boolean;
        data?: TaxiTerminal;
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals`, terminal);
      return response.data;
    } catch (error: any) {
      console.error('Add terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add terminal',
        message: 'Could not add terminal to rank',
      };
    }
  },

  // Update Terminal
  updateTerminal: async (rankId: number, terminalId: number, terminal: Partial<TaxiTerminal>): Promise<{
    success: boolean;
    data?: TaxiTerminal;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.put<{
        success: boolean;
        data?: TaxiTerminal;
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals/${terminalId}`, terminal);
      return response.data;
    } catch (error: any) {
      console.error('Update terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update terminal',
        message: 'Could not update terminal',
      };
    }
  },

  // Delete Terminal
  deleteTerminal: async (rankId: number, terminalId: number): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.delete<{
        success: boolean;
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals/${terminalId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete terminal',
        message: 'Could not delete terminal',
      };
    }
  },

  // Get all terminals for a rank
  getTerminals: async (rankId: number, onlyActive?: boolean): Promise<{
    success: boolean;
    data?: TaxiTerminal[];
    error?: string;
    message?: string;
  }> => {
    try {
      const params = onlyActive !== undefined ? { onlyActive } : {};
      const response = await api.get<{
        success: boolean;
        data?: TaxiTerminal[];
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get terminals error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get terminals',
        message: 'Could not fetch terminals',
      };
    }
  },

  // Get terminal details
  getTerminalDetails: async (rankId: number, terminalId: number): Promise<{
    success: boolean;
    data?: TaxiTerminal;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.get<{
        success: boolean;
        data?: TaxiTerminal;
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals/${terminalId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get terminal details error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get terminal details',
        message: 'Could not fetch terminal details',
      };
    }
  },

  // Update terminal status (activate/deactivate)
  updateTerminalStatus: async (rankId: number, terminalId: number, isActive: boolean): Promise<{
    success: boolean;
    data?: TaxiTerminal;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.patch<{
        success: boolean;
        data?: TaxiTerminal;
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals/${terminalId}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('Update terminal status error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update terminal status',
        message: 'Could not update terminal status',
      };
    }
  },

  // Get terminal statistics
  getTerminalStats: async (rankId: number): Promise<{
    success: boolean;
    data?: {
      totalCount: number;
      activeCount: number;
    };
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.get<{
        success: boolean;
        data?: {
          totalCount: number;
          activeCount: number;
        };
        error?: string;
        message?: string;
      }>(`/taxi-ranks/${rankId}/terminals/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Get terminal stats error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get terminal statistics',
        message: 'Could not fetch terminal statistics',
      };
    }
  },
};
