'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * Shared navbar. `variant="light"` keeps the exact same shape/spacing as the
 * original dark navbar but flips the palette for the white Course page.
 */
export default function Navbar({ variant = 'dark', active = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const containerRef = useRef(null);
  const menuOpenRef = useRef(false);

  menuOpenRef.current = menuOpen;

  const onHome = active === 'home';
  const href = (hash) => (onHome ? hash : `/${hash}`);

  useEffect(() => {
    const navbar = navbarRef.current;
    const container = containerRef.current;
    let lastScrollY = window.scrollY;
    navbar.style.transition = 'transform 0.4s ease';

    const onScroll = () => {
      if (menuOpenRef.current) setMenuOpen(false);

      if (window.scrollY > 100) container.classList.add('scrolled');
      else container.classList.remove('scrolled');

      navbar.style.transform =
        window.scrollY > lastScrollY ? 'translateY(-100%)' : 'translateY(0)';
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';

    const onDocClick = (e) => {
      if (!e.target.closest('.mobile-menu') && !e.target.closest('.menu-btn')) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const goContact = () => {
    setMenuOpen(false);
    if (onHome) {
      document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#kontakt';
    }
  };

  const links = (
    <>
      <li>
        <a href={href('#AboutUs')}>About Us</a>
      </li>
      <li>
        <a href={href('#Reference')}>Reference</a>
      </li>
      <li>
        <a href={href('#Services')}>Services</a>
      </li>
      <li>
        <Link href="/course" className={active === 'course' ? 'is-active' : ''}>
          Course
        </Link>
      </li>
    </>
  );

  return (
    <nav ref={navbarRef} className={`navbar${variant === 'light' ? ' navbar-light' : ''}`}>
      <div ref={containerRef} className="nav-container">
        <Link href="/" className="logo">
          Bano<span>Digital</span>
        </Link>

        <ul className="nav-links">{links}</ul>

        <button className="nav-btn" onClick={goContact}>
          Contact Us
        </button>

        <button
          className={`menu-btn${menuOpen ? ' active' : ''}`}
          aria-label="Menu"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-menu${menuOpen ? ' active' : ''}`}>
        <ul className="mobile-links" onClick={() => setMenuOpen(false)}>
          {links}
        </ul>
        <button className="mobile-btn" onClick={goContact}>
          Contact Us
        </button>
      </div>
    </nav>
  );
}
