export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  preferredPaymentMethod?: string;
  profilePicture?: string | null;
  password?: string;
  accountStatus?: string;
  isVerified?: boolean;
  rating?: number;
  totalTrips?: number;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  managedRanks?: string[];
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  preferredPaymentMethod: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    rider?: User;
    user?: User;
    token: string;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  testAuth: () => Promise<boolean>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
} 