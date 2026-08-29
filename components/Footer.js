import Link from 'next/link';

const TIKTOK =
  'https://www.tiktok.com/@banodigitalhub?_r=1&_d=eig4ilcgaa20d9&sec_uid=MS4wLjABAAAAgkVD7s4--fuIuhv8Djx7M9zjnFeyCWFdhp9VtGe4WKPGj8M0GQ2u0cphj-2p0HdM&share_author_id=7321071346116297734&sharer_language=en&source=h5_m&u_code=ec1f6me6cglbhh&timestamp=1756296581&user_id=7321071346116297734&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android';

export default function Footer({ onHome = false }) {
  const href = (hash) => (onHome ? hash : `/${hash}`);

  return (
    <footer className="footer">
      <div className="container">
        <Link href="/" className="footer-logo">
          <div>
            <img
              style={{ width: '60px', borderRadius: '3px', height: '60px' }}
              src="/logo.png"
              alt="Bano Digital Hub"
            />
          </div>
        </Link>

        <div className="footer-links">
          <a href={href('#AboutUs')}>About Us</a>
          <a href={href('#Reference')}>References</a>
          <a href={href('#Services')}>Services</a>
          <Link href="/course">Course</Link>
          <a href={href('#kontakt')}>Contact</a>
        </div>

        <div className="social-links">
          <a
            href="https://www.linkedin.com/in/bano-digital-hub-33170537b"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://www.instagram.com/banodigitalhubpk/" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href={TIKTOK} aria-label="TikTok">
            <i className="fab fa-tiktok"></i>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61575323543149&mibextid=ZbWKwL"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
        </div>

        <div className="footer-bottom">
          <span>© 2025 Bano Digital Hub, All rights reserved</span>
          <div className="legal-links">
            <Link href="/legal">Legal Notice</Link>
            <Link href="/dataprotection">Data Protection</Link>
          </div>
        </div>

        <div className="footer-credit">Made with ❤️ by Bano Digital Hub</div>
      </div>
    </footer>
  );
}
