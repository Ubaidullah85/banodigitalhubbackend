import { SITE, abs } from '@/lib/seo';

export default function sitemap() {
  const now = new Date();
  return [
    { url: abs('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: abs('/course'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: abs('/legal'), lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: abs('/dataprotection'), lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
