'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSSE } from '@/hooks/useSSE';
import { PatientForm } from '@/components/PatientForm';
import type { PatientFormData } from '@/types';

export default function PatientPage() {
  const { registerPatient, updatePatient, submitPatient, isConnected } = useSSE();
  const [sessionId, setSessionId] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [patientId, setPatientId] = useState<string>('');

  useEffect(() => {
    if (isConnected && !sessionId) {
      registerPatient((data) => {
        setSessionId(data.sessionId);
        setPatientId(data.patientId);
      });
    }
  }, [isConnected, sessionId, registerPatient]);

  const handleInputChange = (data: Partial<PatientFormData>) => {
    if (sessionId) {
      updatePatient(sessionId, data);
    }
  };

  const handleSubmit = (data: PatientFormData) => {
    if (sessionId) {
      submitPatient(sessionId, data);
      setIsSubmitted(true);
    } else {
      // Allow submission even without WebSocket connection
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Patient Registration</h1>
              <p className="text-gray-700 mt-2">Please fill out your information to register</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-semibold underline text-center sm:text-left"
            >
              ← Back
            </Link>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 text-sm font-semibold p-4 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
            {isConnected ? 'Connected to Server' : 'Server Not Available - Form will be accepted but real-time updates disabled'}
          </div>
        </div>

        {/* Main Content */}
        {!isSubmitted ? (
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
            {sessionId ? (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Session ID:</strong> {sessionId}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Use this ID to track your registration</p>
                </div>
                <PatientForm
                  onSubmit={handleSubmit}
                  onInputChange={handleInputChange}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 animate-pulse">Loading form...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">Your registration has been submitted successfully.</p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 text-left">
                <p className="text-sm text-gray-700">
                  <strong>Patient ID:</strong> {patientId}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Session ID:</strong> {sessionId}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSessionId('');
                  setPatientId('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Submit Another Registration
              </button>
              <Link
                href="/staff"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
              >
                View Staff Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
