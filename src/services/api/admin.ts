import api from './axios';
import {
  AdminRegRequest,
  AvailableRanksResponse,
  AdminRequestResponse,
  PendingRequestsResponse,
  RequestDetailsResponse,
  ReviewDecision,
  ReviewResponse,
  RankAdminsResponse,
  DashboardStatsResponse,
  RankDetails,
  TaxiTerminal
} from '../../types/admin';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await api.get<DashboardStatsResponse>('/dashboard/my-stats');
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to get dashboard stats',
        message: 'Could not fetch dashboard statistics from server',
        data: { 
          managedRanksCount: 0,
          managedRanks: []
        }
      };
    }
  },

  // 1. Check Available Ranks
  getAvailableRanks: async (): Promise<AvailableRanksResponse> => {
    try {
      // Using the correct endpoint for available ranks
      const response = await api.get<AvailableRanksResponse>('/admin-registration/available-ranks');
      
      // Handle the case where data is an empty array but the request was successful
      if (response.data.success && (!response.data.data || response.data.data.length === 0)) {
        return {
          success: true,
          data: [],
          message: 'No available ranks found'
        };
      }
      
      return response.data;
    } catch (error: any) {
      // Return a more informative error message
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to get available ranks',
        message: 'Could not fetch available ranks from server'
      };
    }
  },

  // 2. Submit Registration Request
  submitRegistrationRequest: async (adminData: AdminRegRequest): Promise<AdminRequestResponse> => {
    try {
      const response = await api.post<AdminRequestResponse>('/admin-registration/request', adminData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to submit registration request' };
    }
  },

  // 3. Check Pending Requests
  getPendingRequests: async (): Promise<PendingRequestsResponse> => {
    try {
      const response = await api.get<PendingRequestsResponse>('/admin-registration/status/PENDING');
      return response.data;
    } catch (error: any) {
      console.error('Get pending requests error:', error.response?.data || error);
      throw error.response?.data || { success: false, error: 'Failed to get pending requests' };
    }
  },

  // 4. View Specific Registration Request
  getRequestDetails: async (requestId: string): Promise<RequestDetailsResponse> => {
    try {
      const response = await api.get<RequestDetailsResponse>(`/admin/request/${requestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get request details error:', error.response?.data || error);
      throw error.response?.data || { success: false, error: 'Failed to get request details' };
    }
  },

  // 5. Review Registration Request
  reviewRequest: async (requestId: string, decision: ReviewDecision): Promise<ReviewResponse> => {
    try {
      const response = await api.post<ReviewResponse>(`/admin/request/${requestId}/review`, decision);
      return response.data;
    } catch (error: any) {
      console.error('Review request error:', error.response?.data || error);
      throw error.response?.data || { success: false, error: 'Failed to review request' };
    }
  },

  // 6. Verify Admin Assignment
  getRankAdmins: async (rankId: string): Promise<RankAdminsResponse> => {
    try {
      const response = await api.get<RankAdminsResponse>(`/ranks/${rankId}/admins`);
      return response.data;
    } catch (error: any) {
      console.error('Get rank admins error:', error.response?.data || error);
      throw error.response?.data || { success: false, error: 'Failed to get rank admins' };
    }
  },

  // Get Rank Details
  getRankDetails: async (rankId: number): Promise<{ 
    success: boolean; 
    data?: RankDetails;
    error?: string; 
    message?: string;
  }> => {
    try {
      const response = await api.get<{ 
        success: boolean; 
        data?: RankDetails;
        error?: string; 
        message?: string;
      }>(`/ranks/${rankId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get rank details error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to get rank details',
        message: 'Could not fetch rank details from server'
      };
    }
  },

  // Update Rank Details
  updateRankDetails: async (rankId: number, rankData: Partial<RankDetails>): Promise<{
    success: boolean;
    data?: RankDetails;
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.put<{
        success: boolean;
        data?: RankDetails;
        error?: string;
        message?: string;
      }>(`/ranks/${rankId}`, rankData);
      return response.data;
    } catch (error: any) {
      console.error('Update rank details error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update rank details',
        message: 'Could not update rank details on server'
      };
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
      }>(`/ranks/${rankId}/terminals`, terminal);
      return response.data;
    } catch (error: any) {
      console.error('Add terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add terminal',
        message: 'Could not add terminal to rank'
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
      }>(`/ranks/${rankId}/terminals/${terminalId}`, terminal);
      return response.data;
    } catch (error: any) {
      console.error('Update terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update terminal',
        message: 'Could not update terminal'
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
      }>(`/ranks/${rankId}/terminals/${terminalId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete terminal error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete terminal',
        message: 'Could not delete terminal'
      };
    }
  },

  // Upload Rank Image
  uploadRankImage: async (rankId: number, imageFile: FormData): Promise<{
    success: boolean;
    data?: { imageUrl: string };
    error?: string;
    message?: string;
  }> => {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { imageUrl: string };
        error?: string;
        message?: string;
      }>(`/ranks/${rankId}/image`, imageFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload rank image error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to upload rank image',
        message: 'Could not upload rank image'
      };
    }
  }
}; 