import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { COURSE } from '@/lib/config';
import { siteUrl } from '@/lib/site';

export const runtime = 'nodejs';

/**
 * /guide — the enrollment guide as a real download.
 *
 * Linking straight to the file in public/ opens the browser's built-in PDF
 * viewer instead of saving it, and on mobile mail apps it often opens nothing
 * at all. Serving it here lets us set Content-Disposition: attachment, so one
 * tap saves the file on every device.
 */
export async function GET() {
  const rel = COURSE.guidePath.replace(/^\//, '');

  let buf = null;
  try {
    buf = await readFile(path.join(process.cwd(), 'public', rel));
  } catch {
    // Not traced into the bundle — take the CDN copy of our own file instead.
    try {
      const res = await fetch(`${siteUrl()}/${rel}`, { cache: 'no-store' });
      if (res.ok) buf = Buffer.from(await res.arrayBuffer());
    } catch {
      /* handled below */
    }
  }

  if (!buf || buf.subarray(0, 4).toString('latin1') !== '%PDF') {
    return NextResponse.json({ error: 'The enrollment guide is not available yet.' }, { status: 404 });
  }

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(buf.length),
      'Content-Disposition': `attachment; filename="${COURSE.guideFilename}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
