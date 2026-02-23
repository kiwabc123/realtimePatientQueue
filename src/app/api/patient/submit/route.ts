import { patients, sessionTimeout, notifyListeners, updatePatientStatus } from '@/lib/patientStore';
import type { PatientFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const { sessionId, formData } = await request.json();
    const patient = patients.get(sessionId);

    if (!patient) {
      return Response.json({ error: 'Patient not found' }, { status: 404 });
    }

    Object.assign(patient, formData);
    patient.status = 'SUBMITTED';
    patient.lastUpdated = new Date();

    // Clear timeout
    if (sessionTimeout.has(sessionId)) {
      clearTimeout(sessionTimeout.get(sessionId)!);
      sessionTimeout.delete(sessionId);
    }

    notifyListeners(patient);
    return Response.json({ patient }, { status: 200 });
  } catch (error) {
    console.error('Error submitting patient:', error);
    return Response.json({ error: 'Failed to submit patient' }, { status: 500 });
  }
}
