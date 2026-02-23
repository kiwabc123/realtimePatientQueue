import { registerPatient } from '@/lib/patientStore';

export async function POST(request: Request) {
  try {
    const { sessionId, patientId, patient } = registerPatient();
    return Response.json({ sessionId, patientId, patient }, { status: 201 });
  } catch (error) {
    console.error('Error registering patient:', error);
    return Response.json({ error: 'Failed to register patient' }, { status: 500 });
  }
}
