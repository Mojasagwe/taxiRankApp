import api from './axios';
import { AccountStatus, ApiResponse, ProfileCode, User } from '../../types/auth';
import { IssuedCredentials, UserDetail, UserFilters } from '../../types/applications';

const data = <T>(response: { data: ApiResponse<T> }): T => response.data.data as T;

export interface CreateUserRequest {
  profileCode: ProfileCode;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  /** Rank accounts only */
  rankId?: number;
  responsiblePersonName?: string;
  responsiblePersonPhone?: string;
}

/** System Administrator account management (/api/admin/users) */
export const userAdminService = {
  list: async (filters: UserFilters = {}) => data<User[]>(await api.get('/admin/users', { params: filters })),

  get: async (id: number) => data<UserDetail>(await api.get(`/admin/users/${id}`)),

  create: async (request: CreateUserRequest) =>
    data<IssuedCredentials & { user: User }>(await api.post('/admin/users', request)),

  update: async (id: number, changes: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phoneNumber'>> & { profileCode?: ProfileCode }) =>
    data<User>(await api.put(`/admin/users/${id}`, changes)),

  resetPassword: async (id: number) =>
    data<IssuedCredentials & { user: User }>(await api.post(`/admin/users/${id}/reset-password`)),

  setStatus: async (id: number, status: AccountStatus, reason?: string) =>
    data<User>(await api.post(`/admin/users/${id}/status`, { status, reason })),

  setResponsiblePerson: async (id: number, name: string, phone: string) =>
    data<User>(await api.put(`/admin/users/${id}/responsible-person`, { name, phone })),
};
