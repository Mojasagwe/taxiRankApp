import { User } from './auth';

export interface Rank {
  id: number;
  name: string;
  code: string;
  description: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  operatingHours: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rankAdmins: any[]; // Could be more specific if you have a type for admins
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface AdminRegRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  preferredPaymentMethod: string;
  selectedRankCodes: string[]; // Changed from rankCodes
  designation: string;
  justification: string;
  professionalExperience: string;
  adminNotes?: string;
}

export interface AdminRegistrationRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  rankCodes: string[]; // Changed from rankIds to rankCodes
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Admin extends User {
  role: 'ADMIN';
  assignedRankCodes: string[]; // Updated: rank codes the admin manages
}

export interface ReviewDecision {
  approved: boolean;
  rejectionReason?: string; // Required if approved is false
}

export interface AvailableRanksResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Rank[];
}

export interface AdminRequestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    requestId: string;
  };
}

export interface PendingRequestsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: AdminRegistrationRequest[];
}

export interface RequestDetailsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: AdminRegistrationRequest;
}

export interface ReviewResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    request: AdminRegistrationRequest;
    admin?: Admin; // Included if approved
  };
}

export interface RankAdminsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Admin[];
}

export interface DashboardStatsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    managedRanksCount: number;
    managedRanks: ManagedRank[];
  };
}

export interface ManagedRank {
  id: number;
  name: string;
  code: string;
  city: string;
} 