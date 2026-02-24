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

// Seed with demo data for testing
function seedDemoPatients() {
  const demoPatients: Array<{ sessionId: string; patient: Omit<Patient, 'id' | 'sessionId'> }> = [
    {
      sessionId: 'demo-001',
      patient: {
        firstName: 'John',
        middleName: '',
        lastName: 'Smith',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        phoneNumber: '+1234567890',
        email: 'john.smith@example.com',
        address: '123 Main St, City, State 12345',
        preferredLanguage: 'English',
        nationality: 'United States',
        status: 'SUBMITTED',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
        notes: 'Demo patient for testing exports',
      },
    },
    {
      sessionId: 'demo-002',
      patient: {
        firstName: 'Sarah',
        middleName: 'Marie',
        lastName: 'Johnson',
        dateOfBirth: '1992-07-22',
        gender: 'Female',
        phoneNumber: '+1987654321',
        email: 'sarah.johnson@example.com',
        address: '456 Oak Ave, Town, State 54321',
        preferredLanguage: 'English',
        nationality: 'United States',
        status: 'ACTIVELY_FILLING',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        lastUpdated: new Date(Date.now() - 300000), // 5 minutes ago
        notes: 'Currently filling out registration form',
      },
    },
    {
      sessionId: 'demo-003',
      patient: {
        firstName: 'Michael',
        middleName: 'David',
        lastName: 'Williams',
        dateOfBirth: '1978-11-08',
        gender: 'Male',
        phoneNumber: '+1555123456',
        email: 'michael.williams@example.com',
        address: '789 Pine Rd, Village, State 99999',
        preferredLanguage: 'English',
        nationality: 'Canada',
        status: 'REGISTERED',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        lastUpdated: new Date(Date.now() - 172800000),
        notes: 'Awaiting appointment confirmation',
      },
    },
  ];

  demoPatients.forEach(({ sessionId, patient }) => {
    const fullPatient: Patient = {
      ...patient,
      id: generateId(),
      sessionId,
    };
    patients.set(sessionId, fullPatient);
  });
}

// Initialize demo data on startup
seedDemoPatients();
