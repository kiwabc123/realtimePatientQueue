import { NextRequest, NextResponse } from 'next/server';
import { patients } from '@/lib/patientStore';

// Helper function to properly escape CSV fields
function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return '';
  }
  const stringField = String(field);
  // If field contains comma, newline, or double quote, wrap in quotes and escape inner quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

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

    // Create CSV rows with proper escaping
    const rows = patientList.map((patient) => [
      escapeCSVField(patient.id),
      escapeCSVField(patient.firstName),
      escapeCSVField(patient.lastName),
      escapeCSVField(patient.email),
      escapeCSVField(patient.phoneNumber),
      escapeCSVField(patient.dateOfBirth),
      escapeCSVField(patient.gender),
      escapeCSVField(patient.address),
      escapeCSVField(patient.nationality),
      escapeCSVField(patient.status),
      escapeCSVField(new Date(patient.createdAt).toLocaleString()),
      escapeCSVField(new Date(patient.lastUpdated).toLocaleString()),
      escapeCSVField(patient.notes || ''),
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
