'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import type { Patient, PatientFormData } from '@/types';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  patients: Patient[];
  registerPatient: (callback: (data: { sessionId: string; patientId: string }) => void) => void;
  updatePatient: (sessionId: string, formData: Partial<PatientFormData>) => void;
  submitPatient: (sessionId: string, formData: PatientFormData) => void;
  getPatientList: (callback: (patients: Patient[]) => void) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(undefined, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketRef.current.on('patient:updated', (patient: Patient) => {
      setPatients((prevPatients) => {
        const exists = prevPatients.find((p) => p.sessionId === patient.sessionId);
        if (exists) {
          return prevPatients.map((p) => (p.sessionId === patient.sessionId ? patient : p));
        }
        return [...prevPatients, patient];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const registerPatient = useCallback(
    (callback: (data: { sessionId: string; patientId: string }) => void) => {
      if (socketRef.current) {
        socketRef.current.emit('patient:register', callback);
      }
    },
    []
  );

  const updatePatient = useCallback((sessionId: string, formData: Partial<PatientFormData>) => {
    if (socketRef.current) {
      socketRef.current.emit('patient:update', { sessionId, formData });
    }
  }, []);

  const submitPatient = useCallback((sessionId: string, formData: PatientFormData) => {
    if (socketRef.current) {
      socketRef.current.emit('patient:submit', { sessionId, formData });
    }
  }, []);

  const getPatientList = useCallback((callback: (patients: Patient[]) => void) => {
    if (socketRef.current) {
      socketRef.current.emit('patient:list', callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    patients,
    registerPatient,
    updatePatient,
    submitPatient,
    getPatientList,
  };
}
