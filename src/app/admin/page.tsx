'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSSE } from '@/hooks/useSSE';
import type { Patient } from '@/types';

export default function AdminPage() {
  const { patients } = useSSE();
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    submittedPatients: 0,
    activePatients: 0,
    registeredPatients: 0,
    inactivePatients: 0,
    averageWaitTime: 0,
    patientsWithNotes: 0,
  });

  useEffect(() => {
    const submittedCount = patients.filter((p) => p.status === 'SUBMITTED').length;
    const activeCount = patients.filter((p) => p.status === 'ACTIVELY_FILLING').length;
    const registeredCount = patients.filter((p) => p.status === 'REGISTERED').length;
    const inactiveCount = patients.filter((p) => p.status === 'INACTIVE').length;
    const patientsWithNotesCount = patients.filter((p) => p.notes && p.notes.trim().length > 0).length;

    // Calculate average wait time (in minutes)
    let totalWaitTime = 0;
    patients.forEach((p) => {
      const createdTime = new Date(p.createdAt).getTime();
      const currentTime = new Date().getTime();
      totalWaitTime += (currentTime - createdTime) / (1000 * 60); // Convert to minutes
    });
    const avgWaitTime = patients.length > 0 ? totalWaitTime / patients.length : 0;

    setAnalytics({
      totalPatients: patients.length,
      submittedPatients: submittedCount,
      activePatients: activeCount,
      registeredPatients: registeredCount,
      inactivePatients: inactiveCount,
      averageWaitTime: Math.round(avgWaitTime * 10) / 10,
      patientsWithNotes: patientsWithNotesCount,
    });
  }, [patients]);

  const completionRate = analytics.totalPatients > 0
    ? Math.round((analytics.submittedPatients / analytics.totalPatients) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-700 mt-2">Patient queue system analytics</p>
            </div>
            <Link
              href="/staff"
              className="text-blue-600 hover:text-blue-800 font-semibold underline text-center sm:text-left"
            >
              ← Back to Staff
            </Link>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Patients */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Patients</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{analytics.totalPatients}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          {/* Submitted */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Submitted</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{analytics.submittedPatients}</p>
                <p className="text-xs text-gray-500 mt-1">{completionRate}% completion</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          {/* Active Patients */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Actively Filling</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{analytics.activePatients}</p>
              </div>
              <div className="text-5xl">✏️</div>
            </div>
          </div>

          {/* Avg Wait Time */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Avg Wait Time</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{analytics.averageWaitTime}m</p>
              </div>
              <div className="text-5xl">⏱️</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Registered */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Registered</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.registeredPatients}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Inactive</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{analytics.inactivePatients}</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>

          {/* Patients with Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">With Notes</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{analytics.patientsWithNotes}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>

        {/* Status Distribution Chart (Text-based) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Distribution</h2>
          
          <div className="space-y-4">
            {/* Submitted */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Submitted</span>
                <span className="text-green-600 font-bold">{analytics.submittedPatients}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(analytics.submittedPatients / Math.max(analytics.totalPatients, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Actively Filling */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Actively Filling</span>
                <span className="text-yellow-600 font-bold">{analytics.activePatients}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(analytics.activePatients / Math.max(analytics.totalPatients, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Registered */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Registered</span>
                <span className="text-blue-600 font-bold">{analytics.registeredPatients}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(analytics.registeredPatients / Math.max(analytics.totalPatients, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Inactive */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Inactive</span>
                <span className="text-red-600 font-bold">{analytics.inactivePatients}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(analytics.inactivePatients / Math.max(analytics.totalPatients, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-indigo-100 text-sm font-semibold">Completion Rate</p>
              <p className="text-4xl font-bold mt-2">{completionRate}%</p>
              <p className="text-indigo-200 text-sm mt-2">
                {analytics.submittedPatients} out of {analytics.totalPatients} patients have completed registration
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-semibold">Documentation</p>
              <p className="text-4xl font-bold mt-2">{analytics.patientsWithNotes}</p>
              <p className="text-indigo-200 text-sm mt-2">
                {analytics.patientsWithNotes} patients have clinical notes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
