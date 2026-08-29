import { Plus_Jakarta_Sans } from 'next/font/google';
import { SITE, JsonLd, organizationLd, websiteLd } from '@/lib/seo';
import './globals.css';

/* Self-hosted by next/font — no render-blocking Google request, no layout shift.
   globals.css / course.css read it through the --font-sans variable. */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  // Derived from NEXT_PUBLIC_SITE_URL so canonicals, the sitemap and robots.txt
  // always agree on one domain.
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Bano Digital Hub – Digital Growth for Businesses',
    template: '%s | Bano Digital Hub',
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'digital marketing Pakistan',
    'website design Lahore',
    'web development Lahore',
    'AI web development course',
    'freelancing course Pakistan',
    'branding agency Lahore',
    'Bano Digital Hub',
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: '/' },
  formatDetection: { telephone: true, address: false, email: true },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/favicon-180x180.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: 'Bano Digital Hub – Digital Growth for Businesses',
    description:
      'We help local businesses grow online with professional websites, digital marketing, and branding solutions.',
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bano Digital Hub – Digital Growth for Businesses',
    description:
      'Professional websites, digital marketing, and branding solutions for local businesses.',
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        {/* Site-wide structured data: who we are, and what this site is. */}
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        {children}
      </body>
    </html>
  );
}
