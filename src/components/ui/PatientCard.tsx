'use client';

import type { Patient } from '@/types';
import { StatusBadge } from './StatusBadge';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const lastUpdated = new Date(patient.lastUpdated).toLocaleTimeString();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {patient.firstName} {patient.middleName ? patient.middleName + ' ' : ''} {patient.lastName}
          </h3>
          <p className="text-sm text-gray-600 truncate">ID: {patient.id}</p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600">📅 DOB</p>
          <p className="font-semibold text-gray-900 truncate">{patient.dateOfBirth || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600">👤 Gender</p>
          <p className="font-semibold text-gray-900 truncate">{patient.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600">📱 Phone</p>
          <p className="font-semibold text-gray-900 truncate">{patient.phoneNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600">📧 Email</p>
          <p className="font-semibold text-gray-900 truncate text-xs">{patient.email || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}
