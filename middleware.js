import { NextResponse } from 'next/server';

/**
 * CORS for /api/*, so a frontend hosted somewhere else (a Vercel deployment
 * calling this Render service, say) can reach the API.
 *
 * Origins are read from ALLOWED_ORIGINS, comma separated:
 *
 *   ALLOWED_ORIGINS=https://www.banodigitalhub.pk,https://banodigitalhub.vercel.app
 *
 * Nothing is allowed unless it is named there. `*` is deliberately not
 * supported: the admin API rides on a cookie, and a wildcard origin cannot be
 * combined with credentials — the browser rejects the response. When the
 * variable is unset the API stays same-origin only, which is the safe default.
 */
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

function corsHeaders(origin) {
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    // Caches must not hand one origin's response to another.
    Vary: 'Origin',
  };
}

export function middleware(request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  // Preflight — answer it here, the route never runs.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: headers ? 204 : 403, headers: headers || undefined });
  }

  const res = NextResponse.next();
  if (headers) for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
