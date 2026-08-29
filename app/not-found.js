import Link from 'next/link';

export const metadata = { title: 'Page not found | Bano Digital Hub' };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        background: '#000',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: 'clamp(3rem, 12vw, 7rem)', fontWeight: 800, lineHeight: 1 }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,.7)', margin: '18px 0 30px', fontSize: '1.05rem' }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          background: 'linear-gradient(90deg,#03f,#4361ee)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          padding: '15px 32px',
          borderRadius: '50px',
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
