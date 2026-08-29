'use client';

import { useEffect } from 'react';

/**
 * Restores the two inline behaviours the static legal pages shipped with:
 * smooth in-page anchor scrolling and the back-to-top button.
 */
export default function LegalScripts() {
  useEffect(() => {
    const cleanups = [];

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      const onClick = (e) => {
        const hash = anchor.getAttribute('href');
        if (hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      };
      anchor.addEventListener('click', onClick);
      cleanups.push(() => anchor.removeEventListener('click', onClick));
    });

    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      const onScroll = () => {
        backToTop.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
      };
      const onClick = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      onScroll();
      window.addEventListener('scroll', onScroll);
      backToTop.addEventListener('click', onClick);
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
      cleanups.push(() => backToTop.removeEventListener('click', onClick));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
