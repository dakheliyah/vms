import { StatusConfig } from '@/types';

// Registration Status Configurations
export const registrationStatusConfig: Record<string, StatusConfig> = {
  REGISTERED: {
    label: 'REGISTERED',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  PENDING: {
    label: 'PENDING',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  REJECTED: {
    label: 'REJECTED',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

// Pass Status Configurations
export const passStatusConfig: Record<string, StatusConfig> = {
  ALLOCATED: {
    label: 'Allocated',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  PENDING: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

// Data Status Configurations
export const dataStatusConfig: Record<string, StatusConfig> = {
  VERIFIED: {
    label: 'VERIFIED',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  PENDING: {
    label: 'PENDING',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  INCOMPLETE: {
    label: 'INCOMPLETE',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

// Helper function to get status configuration
export const getStatusConfig = (status: string, type: 'registration' | 'pass' | 'data'): StatusConfig => {
  switch (type) {
    case 'registration':
      return registrationStatusConfig[status] || registrationStatusConfig.PENDING;
    case 'pass':
      return passStatusConfig[status] || passStatusConfig.PENDING;
    case 'data':
      return dataStatusConfig[status] || dataStatusConfig.PENDING;
    default:
      return { label: status, variant: 'secondary' };
  }
};