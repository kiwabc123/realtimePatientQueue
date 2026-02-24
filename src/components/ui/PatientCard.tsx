'use client';

import { useState } from 'react';
import type { Patient } from '@/types';
import { StatusBadge } from './StatusBadge';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(patient.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const lastUpdated = new Date(patient.lastUpdated).toLocaleTimeString();

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const response = await fetch('/api/patient/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      setIsEditingNotes(false);
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

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

      {/* Notes Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2"
        >
          📝 {showNotes ? 'Hide' : 'Show'} Notes {patient.notes && '✓'}
        </button>

        {showNotes && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {isEditingNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add clinical notes..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-3 rounded transition"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(patient.notes || '');
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold py-2 px-3 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {patient.notes || '— No notes yet —'}
                </p>
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}
