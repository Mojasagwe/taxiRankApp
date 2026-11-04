import api from './axios';
import { ApiResponse } from '../../types/auth';
import { Application, ApplicationRequest, ApprovalResult, ProposedRank } from '../../types/applications';

const data = <T>(response: { data: ApiResponse<T> }): T => response.data.data as T;

export const applicationService = {
  // --- applicant ---
  submit: async (request: ApplicationRequest) =>
    data<Application>(await api.post('/applications', request)),

  mine: async () => data<Application[]>(await api.get('/applications/mine')),

  resubmit: async (id: number, request: ApplicationRequest) =>
    data<Application>(await api.put(`/applications/${id}`, request)),

  withdraw: async (id: number) => data<Application>(await api.post(`/applications/${id}/withdraw`)),

  get: async (id: number) => data<Application>(await api.get(`/applications/${id}`)),

  // --- reviewer (System Administrator) ---
  list: async (status: 'open' | 'decided' | 'all' = 'open') =>
    data<Application[]>(await api.get('/applications', { params: { status } })),

  requestInfo: async (id: number, note: string) =>
    data<Application>(await api.post(`/applications/${id}/request-info`, { note })),

  reject: async (id: number, note: string) =>
    data<Application>(await api.post(`/applications/${id}/reject`, { note })),

  linkToRank: async (id: number, rankId: number) =>
    data<Application>(await api.post(`/applications/${id}/link`, { rankId })),

  /** For proposals: optional rank code and corrected rank details */
  approve: async (id: number, overrides?: { code?: string; rank?: ProposedRank }) =>
    data<ApprovalResult>(await api.post(`/applications/${id}/approve`, overrides ?? {})),
};
