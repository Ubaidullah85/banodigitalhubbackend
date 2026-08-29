import { COURSE } from './config';
import { siteUrl } from './site';

/**
 * One source of truth for anything SEO reads. The URL comes from lib/site.js,
 * so the canonical tags, the sitemap and robots.txt can never drift onto a
 * different domain — or onto localhost when the build runs on a dev machine.
 */
export const SITE = {
  url: siteUrl(),
  name: 'Bano Digital Hub',
  legalName: 'Bano Digital Hub',
  tagline: 'Digital Growth for Businesses',
  description:
    'Bano Digital Hub helps local businesses grow online with professional websites, digital marketing and branding — and trains the next generation of Pakistani web developers.',
  locale: 'en_PK',
  ogImage: '/og-image.png',
  logo: '/logo.png',
  street: 'E359 Gulberg',
  city: 'Lahore',
  region: 'Punjab',
  country: 'PK',
  socials: [
    'https://www.linkedin.com/in/bano-digital-hub-33170537b',
    'https://www.instagram.com/banodigitalhubpk/',
    'https://www.facebook.com/profile.php?id=61575323543149',
    'https://www.tiktok.com/@banodigitalhub',
  ],
};

export const abs = (p = '/') => `${SITE.url}${p.startsWith('/') ? p : `/${p}`}`;

/** Renders a JSON-LD block. Next keeps this out of the hydration diff. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': abs('/#organization'),
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: abs(SITE.logo),
  image: abs(SITE.ogImage),
  description: SITE.description,
  email: COURSE.supportEmail,
  telephone: COURSE.supportPhone,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.street,
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    addressCountry: SITE.country,
  },
  areaServed: [
    { '@type': 'Country', name: 'Pakistan' },
    { '@type': 'City', name: 'Lahore' },
  ],
  sameAs: SITE.socials,
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': abs('/#organization') },
  inLanguage: 'en',
});

/** Marks up the /course page so Google can show it as a course result. */
export const courseLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  '@id': abs('/course#course'),
  name: 'AI Web Development Course',
  description:
    `A ${COURSE.durationWeeks}-week hands-on AI web development course in Lahore. Build real websites ` +
    `with AI-powered tools and finish with your own first paid client project. Enrollment is free and ` +
    `the batch is limited to ${COURSE.seats} students.`,
  url: abs('/course'),
  inLanguage: 'en',
  provider: { '@id': abs('/#organization') },
  educationalLevel: 'Beginner',
  teaches: [
    'Web development',
    'AI-powered development tools',
    'Freelancing',
    'Client project delivery',
  ],
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      name: `AI Web Development Course — batch starting ${COURSE.classesStart}`,
      courseMode: 'Online',
      courseWorkload: `P${COURSE.durationWeeks}W`,
      inLanguage: 'en',
      location: {
        '@type': 'Place',
        name: SITE.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.city,
          addressRegion: SITE.region,
          addressCountry: SITE.country,
        },
      },
    },
  ],
});

export const faqLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const breadcrumbLd = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: abs(t.path),
  })),
});
