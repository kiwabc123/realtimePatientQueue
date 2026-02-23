import type { Patient, PatientStatus } from '@/types';

// In-memory storage
export const patients = new Map<string, Patient>();
export const sessionTimeout = new Map<string, NodeJS.Timeout>();
export const listeners = new Set<(patient: Patient) => void>();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function updatePatientStatus(sessionId: string, status: PatientStatus): Patient | null {
  const patient = patients.get(sessionId);
  if (patient) {
    patient.status = status;
    patient.lastUpdated = new Date();

    // Clear existing timeout
    if (sessionTimeout.has(sessionId)) {
      clearTimeout(sessionTimeout.get(sessionId)!);
    }

    // Set timeout for inactive status
    if (status === 'ACTIVELY_FILLING') {
      const timeout = setTimeout(() => {
        const p = patients.get(sessionId);
        if (p && p.status === 'ACTIVELY_FILLING') {
          p.status = 'INACTIVE';
          p.lastUpdated = new Date();
          notifyListeners(p);
        }
      }, 30000);

      sessionTimeout.set(sessionId, timeout);
    }

    notifyListeners(patient);
    return patient;
  }
  return null;
}

export function notifyListeners(patient: Patient): void {
  listeners.forEach((listener) => {
    try {
      listener(patient);
    } catch (error) {
      console.error('Error notifying listener:', error);
    }
  });
}

export function registerPatient(): { sessionId: string; patientId: string; patient: Patient } {
  const sessionId = generateId();
  const patientId = generateId();

  const patient: Patient = {
    id: patientId,
    sessionId,
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    preferredLanguage: '',
    nationality: '',
    status: 'REGISTERED',
    createdAt: new Date(),
    lastUpdated: new Date(),
  };

  patients.set(sessionId, patient);
  notifyListeners(patient);
  return { sessionId, patientId, patient };
}

export function getAllPatients(): Patient[] {
  return Array.from(patients.values());
}
