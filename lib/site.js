/**
 * One place that decides which public URL this project answers on.
 *
 * Anything that leaves the server — an email link, a canonical tag, the
 * sitemap — must point at the live domain, never at http://localhost:3000.
 * A local .env.local (or a preview deployment) would otherwise leak a dead
 * link into a student's inbox, so a localhost value is deliberately ignored
 * here rather than trusted.
 */

/** The production domain. Used whenever nothing better is configured. */
export const CANONICAL_SITE_URL = 'https://www.banodigitalhub.pk';

const trim = (u) => String(u || '').trim().replace(/\/+$/, '');
const withScheme = (u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `https://${u}`);

/** localhost, a LAN IP or a *.local host — fine for dev, never for a link we send. */
export function isLocalUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|192\.168\.[\d.]+|10\.[\d.]+|[^/]+\.local)(:\d+)?(\/|$)/i.test(
    String(url || '')
  );
}

/**
 * The URL every outgoing link must use.
 *   1. NEXT_PUBLIC_SITE_URL, unless it points at a dev machine
 *   2. the Vercel production domain, when the project runs there
 *   3. the canonical domain above
 */
export function siteUrl() {
  const configured = trim(withScheme(process.env.NEXT_PUBLIC_SITE_URL));
  if (configured && !isLocalUrl(configured)) return configured;

  const vercel = trim(withScheme(process.env.VERCEL_PROJECT_PRODUCTION_URL));
  if (vercel && !isLocalUrl(vercel)) return vercel;

  return CANONICAL_SITE_URL;
}

/** Absolute URL for a path on the live site — `absoluteUrl('/guide')`. */
export const absoluteUrl = (path = '/') =>
  `${siteUrl()}${String(path).startsWith('/') ? path : `/${path}`}`;

/**
 * Where the server may *read* its own static files from at runtime.
 * Unlike siteUrl() this may be localhost: it never appears in the mail, it is
 * only used to fetch public/ assets when they are not on the filesystem.
 */
export function assetOrigin(requestOrigin) {
  return trim(requestOrigin) || siteUrl();
}
