// Mirrors ApplicationDtos and AccountAdminDtos on the backend
import { AccountStatus, RankSummary, User } from './auth';

export type ApplicationStatus = 'PENDING' | 'INFO_REQUESTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export interface ProposedRank {
  name: string;
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  capacity?: number;
  contactPhone?: string;
  contactEmail?: string;
}

/** Exactly one of rankId or proposedRank */
export interface ApplicationRequest {
  rankId?: number;
  proposedRank?: ProposedRank;
  designation: string;
  motivation?: string;
}

export interface NearbyRank {
  id: number;
  code: string;
  name: string;
  distanceMeters: number;
  hasAccount: boolean;
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  applicant: { id: number; name: string; email?: string; phoneNumber?: string };
  rank?: RankSummary;
  proposedRank?: ProposedRank;
  designation: string;
  motivation?: string;
  reviewerNote?: string;
  reviewedAt?: string;
  rankAccountLoginName?: string;
  createdAt: string;
  updatedAt: string;
  nearbyRanks?: NearbyRank[];
}

/** Returned once by approve, create user and reset password */
export interface IssuedCredentials {
  loginName: string;
  temporaryPassword: string;
}

export interface ApprovalResult extends IssuedCredentials {
  application: Application;
}

export interface AccountEvent {
  action: string;
  details?: string;
  actorName: string;
  createdAt: string;
}

export interface UserDetail {
  user: User;
  history: AccountEvent[];
}

export interface UserFilters {
  profile?: string;
  status?: AccountStatus;
  q?: string;
}
