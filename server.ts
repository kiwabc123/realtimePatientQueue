import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { Patient, PatientStatus } from '@/types';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory store
const patients = new Map<string, Patient>();
const sessionTimeout = new Map<string, NodeJS.Timeout>();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function updatePatientStatus(sessionId: string, status: PatientStatus, io: SocketIOServer): void {
  const patient = patients.get(sessionId);
  if (patient) {
    patient.status = status;
    patient.lastUpdated = new Date();

    if (sessionTimeout.has(sessionId)) {
      clearTimeout(sessionTimeout.get(sessionId)!);
    }

    if (status === 'ACTIVELY_FILLING') {
      const timeout = setTimeout(() => {
        const p = patients.get(sessionId);
        if (p && p.status === 'ACTIVELY_FILLING') {
          p.status = 'INACTIVE';
          p.lastUpdated = new Date();
          io.emit('patient:updated', p);
        }
      }, 30000);

      sessionTimeout.set(sessionId, timeout);
    }

    io.emit('patient:updated', patient);
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('patient:register', (callback) => {
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
      callback({ sessionId, patientId });
    });

    socket.on('patient:update', (data) => {
      const { sessionId, formData } = data;
      const patient = patients.get(sessionId);

      if (patient) {
        Object.assign(patient, formData);
        patient.lastUpdated = new Date();
        updatePatientStatus(sessionId, 'ACTIVELY_FILLING', io);
      }
    });

    socket.on('patient:submit', (data) => {
      const { sessionId, formData } = data;
      const patient = patients.get(sessionId);

      if (patient) {
        Object.assign(patient, formData);
        patient.status = 'SUBMITTED';
        patient.lastUpdated = new Date();

        if (sessionTimeout.has(sessionId)) {
          clearTimeout(sessionTimeout.get(sessionId)!);
          sessionTimeout.delete(sessionId);
        }

        io.emit('patient:updated', patient);
      }
    });

    socket.on('patient:list', (callback) => {
      const patientList = Array.from(patients.values());
      callback(patientList);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
