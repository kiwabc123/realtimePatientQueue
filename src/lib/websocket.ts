import { Socket, Server as SocketIOServer } from 'socket.io';
import type { Patient, PatientStatus } from '@/types';

// In-memory store for patients
const patients = new Map<string, Patient>();
const sessionTimeout = new Map<string, NodeJS.Timeout>();

// Initialize Socket.IO
let io: SocketIOServer | null = null;

function getIO(): SocketIOServer {
  if (!io) {
    io = new SocketIOServer({
      cors: { origin: '*' },
    });
  }
  return io;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function updatePatientStatus(sessionId: string, status: PatientStatus): void {
  const patient = patients.get(sessionId);
  if (patient) {
    patient.status = status;
    patient.lastUpdated = new Date();

    // Clear existing timeout
    if (sessionTimeout.has(sessionId)) {
      clearTimeout(sessionTimeout.get(sessionId));
    }

    // Set new timeout for inactive status (30 seconds)
    if (status === 'ACTIVELY_FILLING') {
      const timeout = setTimeout(() => {
        const p = patients.get(sessionId);
        if (p && p.status === 'ACTIVELY_FILLING') {
          p.status = 'INACTIVE';
          p.lastUpdated = new Date();
          getIO().emit('patient:updated', p);
        }
      }, 30000);

      sessionTimeout.set(sessionId, timeout);
    }

    // Broadcast update to all connected clients
    getIO().emit('patient:updated', patient);
  }
}

// Socket.IO connection handler
export function initializeSocket(socket: Socket): void {
  socket.on('patient:register', (callback) => {
    const sessionId = generateId();
    const patientId = generateId();

    const patient: Patient = {
      id: patientId,
      sessionId,
      firstName: '',
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
    callback({ sessionId, patientId });
  });

  socket.on('patient:update', (data) => {
    const { sessionId, formData } = data;
    const patient = patients.get(sessionId);

    if (patient) {
      Object.assign(patient, formData);
      patient.lastUpdated = new Date();
      updatePatientStatus(sessionId, 'ACTIVELY_FILLING');
    }
  });

  socket.on('patient:submit', (data) => {
    const { sessionId, formData } = data;
    const patient = patients.get(sessionId);

    if (patient) {
      Object.assign(patient, formData);
      patient.status = 'SUBMITTED';
      patient.lastUpdated = new Date();

      // Clear timeout
      if (sessionTimeout.has(sessionId)) {
        clearTimeout(sessionTimeout.get(sessionId));
        sessionTimeout.delete(sessionId);
      }

      getIO().emit('patient:updated', patient);
    }
  });

  socket.on('patient:list', (callback) => {
    const patientList = Array.from(patients.values());
    callback(patientList);
  });

  socket.on('disconnect', () => {
    // Cleanup on disconnect if needed
  });
}
