import { abs } from '@/lib/seo';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: abs('/sitemap.xml'),
    host: abs('/'),
  };
}
