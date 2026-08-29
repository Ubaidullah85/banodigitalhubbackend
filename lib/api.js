/**
 * Where the browser sends API calls.
 *
 * By default the app talks to its own /api routes, which is what you want when
 * one host serves everything. Setting NEXT_PUBLIC_API_BASE_URL points the
 * browser at a separate backend instead — for example a Vercel frontend
 * calling the Render deployment:
 *
 *   NEXT_PUBLIC_API_BASE_URL=https://banodigitalhubbackend.onrender.com
 *
 * Two things follow automatically once that is set, and both are required for
 * the admin panel to keep working across hosts:
 *
 *   - requests carry credentials, so the admin session cookie is sent;
 *   - the backend must allow this origin (ALLOWED_ORIGINS) and issue the
 *     session cookie as SameSite=None — see middleware.js and lib/auth.js.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

/** True when the API lives on a different origin than the page. */
export const isSplitBackend = API_BASE.length > 0;

/** `/api/enroll` -> the full URL to call. */
export const apiUrl = (path) => `${API_BASE}${path}`;

/**
 * fetch() for our own API. Identical to fetch when the API is same-origin;
 * sends cookies when it is not.
 */
export function apiFetch(path, init = {}) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: init.credentials || (isSplitBackend ? 'include' : 'same-origin'),
  });
}
