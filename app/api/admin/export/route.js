import { NextResponse } from 'next/server';
import { getStudents, isDbConfigured } from '@/lib/mongodb';
import { guard } from '@/lib/auth';
import { buildXlsx } from '@/lib/xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLUMNS = [
  ['Submitted On', 22, (s) => (s.createdAt ? new Date(s.createdAt).toLocaleString('en-GB') : '')],
  ['Full Name', 24, (s) => s.fullName],
  ['Email', 30, (s) => s.email],
  ['Mobile Number', 18, (s) => s.phoneRaw || s.phone],
  ['WhatsApp Number', 18, (s) => s.whatsappRaw || s.whatsapp],
  ['WhatsApp Link', 30, (s) => (s.whatsapp ? `https://wa.me/${s.whatsapp}` : '')],
  ['CNIC', 20, (s) => s.cnic],
  ['Age', 7, (s) => (Number.isFinite(Number(s.age)) ? Number(s.age) : s.age)],
  ['Gender', 11, (s) => s.gender],
  ['Study Level', 26, (s) => s.studyLevel],
  ['Laptop Available', 16, (s) => (s.laptop ? 'Yes' : 'No')],
  ['Status', 14, (s) => s.status || 'new'],
  ['Contacted', 12, (s) => (s.contacted ? 'Yes' : 'No')],
  ['Notes', 40, (s) => s.notes || ''],
];

/**
 * Quotes a CSV cell and neutralises spreadsheet formula injection —
 * a value starting with = + - @ would otherwise execute when opened in Excel.
 */
function cell(value) {
  let v = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

async function loadAll() {
  const col = await getStudents();
  return col.find({}).sort({ createdAt: -1 }).toArray();
}

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;

  if (!isDbConfigured())
    return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });

  const format = (new URL(req.url).searchParams.get('format') || 'csv').toLowerCase();
  const stamp = new Date().toISOString().slice(0, 10);

  try {
    const students = await loadAll();

    if (format === 'xlsx') {
      const buffer = buildXlsx({
        sheetName: 'Applications',
        columns: COLUMNS.map(([header, width]) => ({ header, width })),
        rows: students.map((s) => COLUMNS.map(([, , pick]) => pick(s) ?? '')),
      });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="bdh-students-${stamp}.xlsx"`,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'no-store',
        },
      });
    }

    const rows = [
      COLUMNS.map(([header]) => cell(header)).join(','),
      ...students.map((s) => COLUMNS.map(([, , pick]) => cell(pick(s))).join(',')),
    ];

    // Leading BOM so Excel opens the file as UTF-8 (keeps names readable).
    const csv = `﻿${rows.join('\r\n')}`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bdh-students-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/export] failed:', err);
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }
}
