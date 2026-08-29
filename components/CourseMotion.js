'use client';

import { useEffect } from 'react';

/**
 * Entrance motion for the course page.
 *
 * The hero animates once on load; everything below fades and rises as it comes
 * into view. Three deliberate safeguards, because motion must never be the
 * reason someone cannot read the page:
 *
 *  - `crs-anim` is added here, from JavaScript. The CSS only hides anything
 *    once that class exists, so a blocked or failed script leaves the page
 *    fully visible instead of a column of blank space.
 *  - Anything already on screen (a deep link to #enroll, a restored scroll
 *    position) is revealed straight away rather than waiting for a scroll.
 *  - Reduced motion, a missing IntersectionObserver, a tab that was hidden
 *    while the section scrolled past, or an observer that simply never fires
 *    all end with the content shown.
 */
export default function CourseMotion() {
  useEffect(() => {
    const page = document.querySelector('.crs-page');
    if (!page) return;

    const items = [...document.querySelectorAll('[data-reveal]')];
    const reveal = (el) => el.classList.add('is-in');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    page.classList.add('crs-anim');

    if (reduce || typeof IntersectionObserver === 'undefined') {
      items.forEach(reveal);
      return () => page.classList.remove('crs-anim');
    }

    /** Reveals whatever is on screen right now — the safety net for every
        case where the observer cannot deliver a callback. Cheap, and it stops
        costing anything at all once every element has been revealed. */
    let pending = items.length;
    const sweep = () => {
      // Deliberately not gated on document.hidden: a tab that reports itself
      // hidden still must not end up holding invisible text. Spending the
      // animation unseen is the cheaper mistake.
      if (pending === 0) return;
      pending = 0;
      items.forEach((el) => {
        if (el.classList.contains('is-in')) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0) reveal(el);
        else pending++;
      });
      if (pending === 0) window.removeEventListener('scroll', sweep);
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      // Starts a touch before the element is fully on screen, so the movement
      // finishes as the reader arrives rather than under their eyes.
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );

    items.forEach((el) => io.observe(el));

    sweep();
    const timer = setTimeout(sweep, 1500);
    document.addEventListener('visibilitychange', sweep);
    window.addEventListener('scroll', sweep, { passive: true });

    return () => {
      io.disconnect();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', sweep);
      window.removeEventListener('scroll', sweep);
      page.classList.remove('crs-anim');
    };
  }, []);

  return null;
}
