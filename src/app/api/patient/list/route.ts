import { getAllPatients } from '@/lib/patientStore';

export async function GET(request: Request) {
  try {
    const patients = getAllPatients();
    return Response.json({ patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return Response.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
