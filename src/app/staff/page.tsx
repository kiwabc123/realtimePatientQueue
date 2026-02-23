'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PatientCard } from '@/components/ui/PatientCard';
import type { Patient, PatientStatus } from '@/types';

type SortOption = 'name' | 'time' | 'status';

export default function StaffPage() {
  const { isConnected, patients, getPatientList } = useWebSocket();
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'ALL'>('ALL');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (isConnected) {
      getPatientList((list) => {
        setFilteredPatients(list);
      });
    }
  }, [isConnected, getPatientList]);

  useEffect(() => {
    let filtered = patients;

    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'time':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    setFilteredPatients(sorted);
  }, [patients, sortBy, filterStatus]);

  const statusCounts = {
    SUBMITTED: patients.filter((p) => p.status === 'SUBMITTED').length,
    ACTIVELY_FILLING: patients.filter((p) => p.status === 'ACTIVELY_FILLING').length,
    REGISTERED: patients.filter((p) => p.status === 'REGISTERED').length,
    INACTIVE: patients.filter((p) => p.status === 'INACTIVE').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-700 mt-2">Real-time patient management</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-semibold underline text-center sm:text-left"
            >
              ← Back
            </Link>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 text-sm font-semibold p-4 rounded-lg mb-6 ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}></span>
            {isConnected ? 'Connected to Server' : 'Connecting...'}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{statusCounts.SUBMITTED}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{statusCounts.ACTIVELY_FILLING}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{statusCounts.INACTIVE}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PatientStatus | 'ALL')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ACTIVELY_FILLING">Actively Filling</option>
                <option value="REGISTERED">Registered</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Sort Option */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="time">Last Updated (Newest)</option>
                <option value="name">Name (A-Z)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient List */}
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.sessionId} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
            <p className="text-xl text-gray-500 mb-2">
              {patients.length === 0 ? 'No patients registered yet' : 'No patients match the current filters'}
            </p>
            {patients.length === 0 && (
              <p className="text-gray-400">
                Waiting for patients to register...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
