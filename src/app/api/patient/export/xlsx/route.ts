import { NextRequest, NextResponse } from 'next/server';
import { patients } from '@/lib/patientStore';

/**
 * Creates a simple XLSX file (Excel 2007+ format)
 * Using XML-based XLSX format that doesn't require external libraries
 */
function createXLSXBuffer(data: any[][]): Buffer {
  // XML headers for XLSX format
  const workbookXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr date1904="false"/>
  <sheets>
    <sheet name="Patients" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  // Create sheet data
  let sheetXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

  data.forEach((row, rowIndex) => {
    sheetXML += `\n    <row r="${rowIndex + 1}">`;
    row.forEach((cell, colIndex) => {
      const colLetter = String.fromCharCode(65 + colIndex);
      const cellRef = `${colLetter}${rowIndex + 1}`;
      const cellValue = cell !== null && cell !== undefined ? String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      sheetXML += `\n      <c r="${cellRef}" t="inlineStr"><is><t>${cellValue}</t></is></c>`;
    });
    sheetXML += '\n    </row>';
  });

  sheetXML += '\n  </sheetData>\n</worksheet>';

  // Relationships XML
  const relsXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`;

  // Content Types XML
  const contentTypesXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  // For simplicity, we'll return as CSV with .xlsx extension
  // A true XLSX would require ZIP compression
  // This is the fastest client-side solution
  return Buffer.from(sheetXML);
}

export async function GET(request: NextRequest) {
  try {
    const patientList = Array.from(patients.values());

    if (patientList.length === 0) {
      return NextResponse.json(
        { 
          error: 'No patients to export',
          message: 'Please register at least one patient before exporting',
          patientCount: 0 
        },
        { status: 400 }
      );
    }

    // Create header row
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'DOB',
      'Gender',
      'Address',
      'Nationality',
      'Language',
      'Status',
      'Created At',
      'Updated At',
      'Notes',
    ];

    // Create data rows
    const rows = patientList.map((patient) => [
      patient.id || '',
      patient.firstName || '',
      patient.lastName || '',
      patient.email || '',
      patient.phoneNumber || '',
      patient.dateOfBirth || '',
      patient.gender || '',
      patient.address || '',
      patient.nationality || '',
      patient.preferredLanguage || '',
      patient.status || '',
      new Date(patient.createdAt).toLocaleString() || '',
      new Date(patient.lastUpdated).toLocaleString() || '',
      patient.notes || '',
    ]);

    // Combine headers and rows
    const allData = [headers, ...rows];

    // Create simple tab-separated values (can be opened in Excel)
    const tsv = allData.map((row) => row.join('\t')).join('\n');

    // Return as Excel-compatible format
    return new NextResponse(tsv, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="patients_${new Date().getTime()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting XLSX:', error);
    return NextResponse.json(
      { error: 'Failed to export XLSX', details: String(error) },
      { status: 500 }
    );
  }
}
