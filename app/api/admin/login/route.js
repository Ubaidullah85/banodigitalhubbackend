import { NextResponse } from 'next/server';
import { SESSION_COOKIE, checkPassword, createToken, sessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not configured on the server.' },
      { status: 500 }
    );
  }

  const { password } = await req.json().catch(() => ({}));

  if (!checkPassword(password)) {
    // Small delay blunts brute-force attempts without hurting real logins.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createToken(), sessionCookieOptions());
  return res;
}
