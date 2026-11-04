// Mirrors the backend's UserResponse and auth DTOs (com.taxirank.backend.dto)

export type Permission =
  | 'USERS_VIEW'
  | 'USERS_MANAGE'
  | 'USERS_RESET_PASSWORD'
  | 'USERS_SET_STATUS'
  | 'APPLICATIONS_REVIEW'
  | 'APPLICATIONS_SUBMIT'
  | 'RANKS_MANAGE'
  | 'RANK_MANAGE_OWN'
  | 'ROUTES_MANAGE'
  | 'TRIPS_OWN';

export type ProfileCode = 'SYSTEM_ADMIN' | 'RANK_ADMIN' | 'COMMUTER';

/** DELETED: the holder deleted their account; personal data is erased */
export type AccountStatus = 'ACTIVE' | 'FLAGGED' | 'SUSPENDED' | 'BLOCKED' | 'DELETED';

export interface RankSummary {
  id: number;
  code: string;
  name: string;
  city?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  /** Email for people, rank code for rank accounts */
  loginName: string;
  profileCode: ProfileCode;
  profileName: string;
  permissions: Permission[];
  accountStatus: AccountStatus;
  statusReason?: string;
  mustChangePassword: boolean;
  /** Set on rank accounts only */
  rank?: RankSummary;
  responsiblePersonName?: string;
  responsiblePersonPhone?: string;
  /** Relative to the server root (/api/users/7/photo?v=…); changes with every new photo */
  photoUrl?: string;
  lastLogin?: string;
  createdAt?: string;
}

/** Standard envelope for every backend response */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

/** What a person signed up as; rank admins continue to the application */
export type SignUpIntent = 'RIDER' | 'RANK_ADMIN';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpIntent: SignUpIntent | null;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: RegisterRequest, intent: SignUpIntent) => Promise<User>;
  /** Signs out every other session; this one gets a fresh token */
  changePassword: (currentPassword: string, newPassword: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  /** Keep the session in step after the user edits their own account */
  updateUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
  clearSignUpIntent: () => void;
}
