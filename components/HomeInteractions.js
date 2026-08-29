'use client';

import { useEffect } from 'react';

/**
 * Ports the original inline <script> behaviour of index.html:
 * customer marquee, project carousel (buttons / dots / swipe / arrow keys),
 * slide-in reveals, smooth anchor scrolling, counters and the service tabs.
 * Navbar + cookie banner logic live in their own components.
 */
export default function HomeInteractions() {
  useEffect(() => {
    const cleanups = [];
    const on = (target, evt, fn, opts) => {
      target.addEventListener(evt, fn, opts);
      cleanups.push(() => target.removeEventListener(evt, fn, opts));
    };

    // ---------- customers scroll loop ----------
    const track = document.querySelector('.customers-scroll .customers-track');
    let rafId;
    if (track) {
      track.style.animation = 'none';
      let x = 0;
      const pxPerSecond = 40;
      let lastTs = null;
      let thirdWidth = track.scrollWidth / 3;

      const recalc = () => {
        thirdWidth = track.scrollWidth / 3;
      };
      on(window, 'resize', recalc);

      const tick = (ts) => {
        if (lastTs == null) lastTs = ts;
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;
        x -= pxPerSecond * dt;
        if (-x >= thirdWidth) x += thirdWidth;
        track.style.transform = `translateX(${x}px)`;
        rafId = requestAnimationFrame(tick);
      };
      recalc();
      rafId = requestAnimationFrame(tick);
    }

    // ---------- project carousel ----------
    const carousel = document.querySelector('.carousel');
    const projectCards = document.querySelectorAll('.project-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;
    const cardWidth = (projectCards[0]?.offsetWidth || 0) + 30;

    const updateCarousel = () => {
      if (!carousel) return;
      carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };
    const next = () => {
      if (currentIndex < projectCards.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    };
    const prev = () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    };

    if (nextBtn) on(nextBtn, 'click', next);
    if (prevBtn) on(prevBtn, 'click', prev);
    dots.forEach((dot, i) =>
      on(dot, 'click', () => {
        currentIndex = i;
        updateCarousel();
      })
    );

    let touchStartX = 0;
    if (carousel) {
      on(carousel, 'touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });
      on(carousel, 'touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) next();
        if (touchEndX > touchStartX + threshold) prev();
      });
    }

    on(document, 'keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    // ---------- slide-in reveal ----------
    const animatedElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
    const checkScroll = () => {
      animatedElements.forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight - 100 && bottom > 0) el.classList.add('visible');
      });
    };
    checkScroll();
    on(window, 'scroll', checkScroll);

    // ---------- smooth scroll for in-page anchors ----------
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      on(anchor, 'click', function (e) {
        const hash = this.getAttribute('href');
        if (hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
      });
    });

    // ---------- counters ----------
    // Time-based, not frame-based. The old version added a fixed step per
    // animation frame, so the result depended on the refresh rate and, worse,
    // stalled at whatever number it had reached whenever the browser stopped
    // producing frames — a background tab, a low-power phone, a throttled
    // laptop. Driving it from the clock means the count always takes the same
    // 1.6s and always lands exactly on the target.
    const DURATION = 1600;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const counters = document.querySelectorAll('.counter-value');
    const counterFrames = new Set();

    const animateCounter = (counter) => {
      const target = Number(counter.dataset.target) || 0;

      // No animation possible or wanted — show the real number straight away
      // rather than leaving a 0 on screen.
      if (reduceMotion || document.hidden) {
        counter.textContent = String(target);
        return;
      }

      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / DURATION, 1);
        // easeOutCubic: quick off the mark, settles gently on the number.
        const eased = 1 - Math.pow(1 - t, 3);
        counter.textContent = String(Math.round(target * eased));
        if (t < 1) {
          const id = requestAnimationFrame(step);
          counterFrames.add(id);
        }
      };
      const id = requestAnimationFrame(step);
      counterFrames.add(id);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      // A little rootMargin so the count is already running by the time the
      // card is properly on screen, instead of starting under the fold.
      { threshold: 0, rootMargin: '0px 0px -12% 0px' }
    );
    counters.forEach((c) => observer.observe(c));
    cleanups.push(() => {
      observer.disconnect();
      counterFrames.forEach((id) => cancelAnimationFrame(id));
    });

    // If the tab was hidden while the section scrolled past, the numbers would
    // sit at 0 forever. Fill in anything still unfinished once we are back.
    const settleCounters = () => {
      if (document.hidden) return;
      counters.forEach((c) => {
        const target = Number(c.dataset.target) || 0;
        if (c.textContent.trim() === '0' && target !== 0) {
          const { top, bottom } = c.getBoundingClientRect();
          if (top < window.innerHeight && bottom > 0) animateCounter(c);
        }
      });
    };
    on(document, 'visibilitychange', settleCounters);

    // ---------- service tabs ----------
    const tabButtons = document.querySelectorAll('.tab-trigger');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach((button) => {
      on(button, 'click', () => {
        tabButtons.forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        tabPanels.forEach((panel) => panel.classList.remove('active'));
        document.getElementById(button.getAttribute('data-target'))?.classList.add('active');
      });
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
