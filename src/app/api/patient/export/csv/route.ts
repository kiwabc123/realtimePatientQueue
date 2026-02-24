import { NextRequest, NextResponse } from 'next/server';
import { patients } from '@/lib/patientStore';

export async function GET(request: NextRequest) {
  try {
    const patientList = Array.from(patients.values());

    if (patientList.length === 0) {
      return NextResponse.json(
        { error: 'No patients to export' },
        { status: 400 }
      );
    }

    // Create CSV header
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Gender',
      'Address',
      'Nationality',
      'Status',
      'Created At',
      'Last Updated',
      'Notes',
    ];

    // Create CSV rows
    const rows = patientList.map((patient) => [
      patient.id,
      patient.firstName,
      patient.lastName,
      patient.email,
      patient.phoneNumber,
      patient.dateOfBirth,
      patient.gender,
      patient.address,
      patient.nationality,
      patient.status,
      new Date(patient.createdAt).toLocaleString(),
      new Date(patient.lastUpdated).toLocaleString(),
      `"${(patient.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="patients.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
