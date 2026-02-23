import { patients, updatePatientStatus } from '@/lib/patientStore';
import type { PatientFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const { sessionId, formData } = await request.json();
    const patient = patients.get(sessionId);

    if (!patient) {
      return Response.json({ error: 'Patient not found' }, { status: 404 });
    }

    Object.assign(patient, formData);
    updatePatientStatus(sessionId, 'ACTIVELY_FILLING');

    return Response.json({ patient }, { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return Response.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
