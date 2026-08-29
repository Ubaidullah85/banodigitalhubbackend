import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getStudents, isDbConfigured } from '@/lib/mongodb';
import { guard } from '@/lib/auth';
import { isMailConfigured, verifyMail, sendAdminEmail } from '@/lib/email';
import { COURSE } from '@/lib/config';
import { siteUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Is the interview guide PDF actually in place? */
async function guideStatus(origin) {
  const rel = COURSE.guidePath.replace(/^\//, '');
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', rel));
    if (buf.subarray(0, 4).toString('latin1') === '%PDF')
      return { present: true, bytes: buf.length };
  } catch {
    /* not on disk — try the CDN copy */
  }
  try {
    const res = await fetch(`${origin}/${rel}`, { cache: 'no-store' });
    const type = res.headers.get('content-type') || '';
    if (res.ok && type.includes('pdf')) {
      return { present: true, bytes: Number(res.headers.get('content-length')) || null };
    }
  } catch {
    /* ignore */
  }
  return { present: false, bytes: 0 };
}

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;

  const origin = new URL(req.url).origin;

  const db = { configured: isDbConfigured(), connected: false, students: 0, error: null };
  if (db.configured) {
    try {
      const col = await getStudents();
      db.students = await col.countDocuments({});
      db.connected = true;
    } catch (err) {
      db.error = err?.message || 'Connection failed.';
    }
  }

  const mail = { configured: isMailConfigured(), verified: false, user: null, error: null };
  if (mail.configured) {
    const res = await verifyMail();
    mail.verified = res.ok;
    mail.user = res.user || null;
    mail.error = res.error || null;
  } else {
    mail.error = 'GMAIL_APP_PASSWORD is not set.';
  }

  return NextResponse.json({
    db,
    mail,
    guide: await guideStatus(origin),
    adminEmail: process.env.ADMIN_EMAIL || COURSE.supportEmail,
    siteUrl: siteUrl(),
  });
}

/** Sends a sample application email to the admin address, to prove mail works. */
export async function POST(req) {
  const denied = await guard();
  if (denied) return denied;

  if (!isMailConfigured())
    return NextResponse.json(
      { error: 'GMAIL_APP_PASSWORD is not set, so no email can be sent yet.' },
      { status: 400 }
    );

  const origin = new URL(req.url).origin;

  const sent = await sendAdminEmail(
    {
      fullName: 'Test Student (delivery check)',
      email: process.env.ADMIN_EMAIL || COURSE.supportEmail,
      phone: '923001234567',
      phoneRaw: '0300 1234567',
      whatsapp: '923001234567',
      whatsappRaw: '0300 1234567',
      cnic: '35202-1234567-1',
      age: 20,
      gender: 'Male',
      studyLevel: 'Bachelors (BS / BSc)',
      laptop: true,
      createdAt: new Date(),
    },
    origin
  );

  return sent
    ? NextResponse.json({ ok: true, to: process.env.ADMIN_EMAIL || COURSE.supportEmail })
    : NextResponse.json({ error: 'Gmail rejected the message. Check the app password.' }, { status: 500 });
}
