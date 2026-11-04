import { ApplicationStatus } from '../../types/applications';

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  INFO_REQUESTED: 'Info requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_TONE: Record<ApplicationStatus, 'warn' | 'info' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warn',
  INFO_REQUESTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export const isOpen = (status: ApplicationStatus) => status === 'PENDING' || status === 'INFO_REQUESTED';
