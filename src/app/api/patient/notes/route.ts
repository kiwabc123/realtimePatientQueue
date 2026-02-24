import { NextRequest, NextResponse } from 'next/server';
import { patients, listeners } from '@/lib/patientStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, notes } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const patient = patients.get(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update patient notes
    patient.notes = notes || '';
    patient.lastUpdated = new Date();

    // Broadcast update to all connected SSE clients
    listeners.forEach((listener) => {
      try {
        listener(patient);
      } catch (error) {
        console.error('Error broadcasting update:', error);
      }
    });

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('Error updating patient notes:', error);
    return NextResponse.json(
      { error: 'Failed to update notes' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const patient = patients.get(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ notes: patient.notes || '' });
  } catch (error) {
    console.error('Error fetching patient notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}
