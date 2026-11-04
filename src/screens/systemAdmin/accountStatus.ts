import { AccountStatus } from '../../types/auth';

export const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Active',
  FLAGGED: 'Flagged',
  SUSPENDED: 'Suspended',
  BLOCKED: 'Blocked',
};

export const STATUS_TONE: Record<AccountStatus, 'success' | 'alert' | 'danger' | 'dark'> = {
  ACTIVE: 'success',
  FLAGGED: 'alert',
  SUSPENDED: 'danger',
  BLOCKED: 'dark',
};

export const STATUS_HELP: Record<AccountStatus, string> = {
  ACTIVE: 'Normal access.',
  FLAGGED: 'Still works, but marked for review. Use for complaints or suspicious changes.',
  SUSPENDED: "Can't log in until reactivated. Rank info stays visible to commuters.",
  BLOCKED: 'Permanently locked. A rank needs a new account through a new application.',
};

export const EVENT_LABEL: Record<string, string> = {
  ACCOUNT_CREATED: 'Account created',
  PASSWORD_RESET: 'Password reset',
  PASSWORD_CHANGED: 'Password changed',
  STATUS_CHANGED: 'Status changed',
  PROFILE_CHANGED: 'Profile changed',
  DETAILS_CHANGED: 'Details changed',
  RESPONSIBLE_PERSON_CHANGED: 'Responsible person changed',
};
