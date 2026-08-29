import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'bdh_admin';
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('ADMIN_SESSION_SECRET / ADMIN_PASSWORD is not configured');
  return s;
}

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Password check that does not leak length through timing. */
export function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const hash = (v) => createHmac('sha256', 'bdh-pw').update(String(v)).digest();
  const a = hash(candidate);
  const b = hash(expected);
  return timingSafeEqual(a, b);
}

export function createToken() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (!safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}

export async function isAuthed() {
  try {
    const store = await cookies();
    return verifyToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}

/**
 * When the admin panel is served from a different host than this API (a Vercel
 * frontend calling the Render backend), the session cookie is a third-party
 * cookie: browsers only keep it with SameSite=None, and only over HTTPS.
 * Same-origin deployments stay on Lax, which is the stricter default.
 */
const crossSite = Boolean(process.env.ALLOWED_ORIGINS);

export function sessionCookieOptions(maxAge = MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

/** Returns a 401 response when the caller is not a signed-in admin, else null. */
export async function guard() {
  if (await isAuthed()) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
