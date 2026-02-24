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

    // Generate HTML table
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Patient Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .SUBMITTED { background-color: #dcfce7; color: #166534; }
          .ACTIVELY_FILLING { background-color: #fef3c7; color: #92400e; }
          .REGISTERED { background-color: #dbeafe; color: #1e40af; }
          .INACTIVE { background-color: #fecaca; color: #991b1b; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Patient Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Patients: ${patientList.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${patientList
              .map(
                (p) => `
            <tr>
              <td>${p.firstName} ${p.lastName}</td>
              <td>${p.email}</td>
              <td>${p.phoneNumber}</td>
              <td><span class="status ${p.status}">${p.status}</span></td>
              <td>${new Date(p.createdAt).toLocaleString()}</td>
              <td>${p.notes || '—'}</td>
            </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is an automated report from the Patient Queue System.</p>
        </div>
      </body>
      </html>
    `;

    // For now, return HTML that can be printed as PDF
    // Users can print to PDF using browser print dialog
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Content-Disposition': 'attachment; filename="patients.html"',
      },
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
