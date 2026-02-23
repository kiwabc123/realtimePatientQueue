'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Patient, PatientFormData } from '@/types';

interface UseSSEReturn {
  isConnected: boolean;
  patients: Patient[];
  registerPatient: (callback: (data: { sessionId: string; patientId: string }) => void) => void;
  updatePatient: (sessionId: string, formData: Partial<PatientFormData>) => void;
  submitPatient: (sessionId: string, formData: PatientFormData) => void;
  getPatientList: (callback: (patients: Patient[]) => void) => void;
}

export function useSSE(): UseSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Initialize SSE connection
  useEffect(() => {
    const connectSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/api/patient/stream');

        eventSourceRef.current.onopen = () => {
          console.log('SSE Connected');
          setIsConnected(true);
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'patient:updated') {
              const patient = message.data;
              setPatients((prevPatients) => {
                const exists = prevPatients.find((p) => p.sessionId === patient.sessionId);
                if (exists) {
                  return prevPatients.map((p) => (p.sessionId === patient.sessionId ? patient : p));
                }
                return [...prevPatients, patient];
              });
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSourceRef.current.onerror = () => {
          console.log('SSE Disconnected');
          setIsConnected(false);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          // Attempt to reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (error) {
        console.error('Error connecting to SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const registerPatient = useCallback(
    async (callback: (data: { sessionId: string; patientId: string }) => void) => {
      try {
        const response = await fetch('/api/patient/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        callback({ sessionId: data.sessionId, patientId: data.patientId });
      } catch (error) {
        console.error('Error registering patient:', error);
      }
    },
    []
  );

  const updatePatient = useCallback((sessionId: string, formData: Partial<PatientFormData>) => {
    try {
      fetch('/api/patient/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, formData }),
      }).catch((error) => console.error('Error updating patient:', error));
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  }, []);

  const submitPatient = useCallback((sessionId: string, formData: PatientFormData) => {
    try {
      fetch('/api/patient/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, formData }),
      }).catch((error) => console.error('Error submitting patient:', error));
    } catch (error) {
      console.error('Error submitting patient:', error);
    }
  }, []);

  const getPatientList = useCallback(async (callback: (patients: Patient[]) => void) => {
    try {
      const response = await fetch('/api/patient/list');
      const data = await response.json();
      callback(data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, []);

  return {
    isConnected,
    patients,
    registerPatient,
    updatePatient,
    submitPatient,
    getPatientList,
  };
}
