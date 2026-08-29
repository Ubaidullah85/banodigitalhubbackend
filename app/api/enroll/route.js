import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { ensureIndexes, getStudents, isDbConfigured } from '@/lib/mongodb';
import { sendAdminEmail, sendStudentEmail } from '@/lib/email';
import { GENDERS, STUDY_LEVELS } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const digits = (v) => String(v ?? '').replace(/\D/g, '');

/** 03001234567 / 3001234567 / +923001234567 -> 923001234567 (wa.me friendly). */
function toIntl(raw) {
  let d = digits(raw);
  if (!d) return '';
  if (d.startsWith('0')) d = `92${d.slice(1)}`;
  else if (d.length === 10) d = `92${d}`;
  return d;
}

/** 3520212345671 -> 35202-1234567-1 */
function formatCnic(raw) {
  const d = digits(raw);
  return d.length === 13 ? `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}` : d;
}

function validate(b) {
  const fullName = String(b.fullName ?? '').trim().replace(/\s+/g, ' ');
  const email = String(b.email ?? '').trim().toLowerCase();
  const cnicDigits = digits(b.cnic);
  const age = Number(b.age);

  if (fullName.length < 3 || fullName.length > 80) return { error: 'Please enter your full name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return { error: 'Please enter a valid email address.' };
  if (digits(b.phone).length < 10) return { error: 'Please enter a valid mobile number.' };
  if (digits(b.whatsapp).length < 10) return { error: 'Please enter a valid WhatsApp number.' };
  if (cnicDigits.length !== 13) return { error: 'CNIC must be exactly 13 digits.' };
  if (!Number.isFinite(age) || age < 14 || age > 60)
    return { error: 'Please enter an age between 14 and 60.' };
  if (!GENDERS.includes(b.gender)) return { error: 'Please select your gender.' };
  if (!STUDY_LEVELS.includes(b.studyLevel))
    return { error: 'Please select your current study level.' };

  return {
    student: {
      fullName,
      email,
      phone: toIntl(b.phone),
      phoneRaw: String(b.phone ?? '').trim(),
      whatsapp: toIntl(b.whatsapp),
      whatsappRaw: String(b.whatsapp ?? '').trim(),
      cnic: formatCnic(cnicDigits),
      age,
      gender: b.gender,
      studyLevel: b.studyLevel,
      laptop: Boolean(b.laptop),
      status: 'new',
      contacted: false,
      createdAt: new Date(),
    },
  };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { error, student } = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Registration is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }

  // ---- persist -----------------------------------------------------------
  try {
    await ensureIndexes();
    const col = await getStudents();
    const { insertedId } = await col.insertOne(student);
    student._id = insertedId;
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'An application with this CNIC has already been submitted.' },
        { status: 409 }
      );
    }
    console.error('[enroll] insert failed:', err);
    return NextResponse.json(
      { error: 'Could not save your application. Please try again.' },
      { status: 500 }
    );
  }

  // ---- notify ------------------------------------------------------------
  // Only used so the server can read its own files in public/. Every link that
  // ends up inside the mail comes from lib/site.js, so a student never receives
  // a localhost URL, whichever machine sent the mail.
  const requestOrigin = new URL(req.url).origin;

  const emailSent = await sendStudentEmail(
    { ...student, phone: student.phoneRaw, whatsapp: student.whatsappRaw },
    requestOrigin
  );

  // The admin notification must never delay the student's response.
  after(async () => {
    await sendAdminEmail(student, requestOrigin);
  });

  return NextResponse.json({ ok: true, emailSent });
}
