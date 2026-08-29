/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // The mail routes read the logo, watermark and interview-guide PDF off disk;
  // without this they are not traced into the serverless bundle.
  outputFileTracingIncludes: {
    '/api/enroll': ['./public/email-logo.png', './public/email-watermark.png', './public/*.pdf'],
    '/api/admin/status': ['./public/email-logo.png', './public/email-watermark.png', './public/*.pdf'],
    '/guide': ['./public/*.pdf'],
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/legal.html', destination: '/legal', permanent: true },
      { source: '/dataprotection.html', destination: '/dataprotection', permanent: true },
    ];
  },
};

export default nextConfig;
