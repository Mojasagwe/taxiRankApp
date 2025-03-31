import api from './axios';
import {
  AdminRegRequest,
  AvailableRanksResponse,
  AdminRequestResponse,
  PendingRequestsResponse,
  RequestDetailsResponse,
  ReviewDecision,
  ReviewResponse,
  RankAdminsResponse
} from '../../types/admin';

export const adminService = {
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
      const response = await api.get<PendingRequestsResponse>('/admin/requests/PENDING');
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
  }
}; 