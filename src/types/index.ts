export type PatientStatus = 'REGISTERED' | 'ACTIVELY_FILLING' | 'SUBMITTED' | 'INACTIVE';

export interface EmergencyContact {
  name: string;
  relationship: string;
}

export interface PatientFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContact?: EmergencyContact;
}

export interface Patient extends PatientFormData {
  id: string;
  status: PatientStatus;
  createdAt: Date;
  lastUpdated: Date;
  sessionId: string;
  notes?: string;
  queueNumber?: number;
}
