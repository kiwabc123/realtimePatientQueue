'use client';

import type { PatientStatus } from '@/types';

interface StatusBadgeProps {
  status: PatientStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    SUBMITTED: {
      label: 'Submitted',
      color: 'bg-green-100 text-green-800',
      icon: '✓',
    },
    ACTIVELY_FILLING: {
      label: 'Actively Filling',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
    },
    REGISTERED: {
      label: 'Registered',
      color: 'bg-blue-100 text-blue-800',
      icon: '📝',
    },
    INACTIVE: {
      label: 'Inactive',
      color: 'bg-red-100 text-red-800',
      icon: '⏸',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
