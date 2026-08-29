import { readFile } from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { COURSE } from './config';
import { siteUrl, assetOrigin } from './site';
import { studentHtml, studentText, adminHtml, adminText } from './email-template';

/**
 * Mail goes out over Gmail SMTP straight from banodigitalhub@gmail.com, so no
 * domain verification is needed. GMAIL_APP_PASSWORD must be a Google App
 * Password (https://myaccount.google.com/apppasswords), not the account
 * password — Google blocks plain-password SMTP.
 *
 * Every link inside the mail is built from lib/site.js, never from the request,
 * so a mail sent while running locally still points at the live domain.
 */
const GMAIL_USER = process.env.GMAIL_USER || 'banodigitalhub@gmail.com';
// App passwords are shown in groups of four; Google accepts them without spaces.
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const FROM = process.env.MAIL_FROM || `Bano Digital Hub <${GMAIL_USER}>`;
const ADMIN_TO = process.env.ADMIN_EMAIL || COURSE.supportEmail;

let transporter = null;

function getTransport() {
  if (!GMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
      pool: true,
      maxConnections: 3,
    });
  }
  return transporter;
}

export function isMailConfigured() {
  return Boolean(GMAIL_PASS);
}

/** Verifies the SMTP credentials — used by the admin panel's mail check. */
export async function verifyMail() {
  const t = getTransport();
  if (!t) return { ok: false, error: 'GMAIL_APP_PASSWORD is not set.' };
  try {
    await t.verify();
    return { ok: true, user: GMAIL_USER };
  } catch (err) {
    return { ok: false, error: err?.message || 'SMTP verification failed.' };
  }
}

/**
 * Reads an asset out of public/. Tries the filesystem first, then falls back to
 * fetching it over HTTP — on Vercel, files under public/ are served by the CDN
 * but are not always traced into the serverless bundle. The origin used here is
 * only for reading our own files; it never appears in the mail.
 * Returns null when the file has not been added yet.
 */
async function readPublic(relPath, origin) {
  const rel = relPath.replace(/^\//, '');
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', rel));
    if (buf.length) return buf;
  } catch {
    /* fall through to the HTTP fetch */
  }
  try {
    const res = await fetch(`${assetOrigin(origin)}/${rel}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length ? buf : null;
  } catch {
    return null;
  }
}

/** The enrollment guide PDF, attached when it exists in public/. */
async function loadGuide(origin) {
  const buf = await readPublic(COURSE.guidePath, origin);
  // Guard against a 404 HTML page being attached as a "PDF".
  if (!buf || buf.subarray(0, 4).toString('latin1') !== '%PDF') return null;
  return {
    filename: COURSE.guideFilename || 'Bano-Digital-Hub-Enrollment-Guide.pdf',
    content: buf,
    contentType: 'application/pdf',
  };
}

/** The logo rides along as an inline (cid:) image so it always renders. */
async function brandImages(origin) {
  const logo = await readPublic('email-logo.png', origin);
  return logo
    ? [{ filename: 'logo.png', content: logo, cid: 'bdhlogo', contentType: 'image/png' }]
    : [];
}

/* ----------------------------------------------------------- student mail */
/** Confirmation to the applicant. Resolves true only once Gmail accepted it. */
export async function sendStudentEmail(student, requestOrigin) {
  const t = getTransport();
  if (!t) {
    console.warn('[email] GMAIL_APP_PASSWORD missing — confirmation email skipped.');
    return false;
  }

  const links = siteUrl(); // always the live domain, never localhost
  const [guide, images] = await Promise.all([
    loadGuide(requestOrigin),
    brandImages(requestOrigin),
  ]);

  try {
    await t.sendMail({
      from: FROM,
      to: student.email,
      replyTo: COURSE.supportEmail,
      subject: `Application received — your interview call is on ${COURSE.interviewDate}`,
      html: studentHtml(student, links, Boolean(guide)),
      text: studentText(student, links),
      attachments: guide ? [...images, guide] : images,
    });
    return true;
  } catch (err) {
    console.error('[email] student send failed:', err?.message || err);
    return false;
  }
}

/* ------------------------------------------------------------- admin mail */
export async function sendAdminEmail(student, requestOrigin) {
  const t = getTransport();
  if (!t) return false;

  const links = siteUrl();

  try {
    await t.sendMail({
      from: FROM,
      to: ADMIN_TO,
      replyTo: student.email,
      subject: `New course application — ${student.fullName}`,
      html: adminHtml(student, links),
      text: adminText(student, links),
      attachments: await brandImages(requestOrigin),
    });
    return true;
  } catch (err) {
    console.error('[email] admin send failed:', err?.message || err);
    return false;
  }
}
