/**
 * Web3 Carnival Design System - Main Entry Point
 * Handles animated stat count-up, countdown timer, filter interactions, and accessibility checks
 */

(function () {
  'use strict';

  /**
   * Check if reduced motion is preferred
   */
  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Countdown Timer to Web3 Carnival Flagship Event (Nov 14, 2026)
   */
  function initCountdownTimer() {
    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    // Target date lives in js/data.js (WEB3_CARNIVAL_DATA.eventDetails.countdownTarget)
    // so it is never hardcoded into page markup or logic.
    const targetIso = (typeof WEB3_CARNIVAL_DATA !== 'undefined' && WEB3_CARNIVAL_DATA.eventDetails)
      ? WEB3_CARNIVAL_DATA.eventDetails.countdownTarget
      : '2026-11-14T09:00:00Z';
    const targetDate = new Date(targetIso).getTime();

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /**
   * Animated Stat Counters with IntersectionObserver
   * Respects prefers-reduced-motion
   */
  function initStatCounters() {
    const statElements = document.querySelectorAll('[data-counter-target]');
    if (!statElements.length) return;

    if (isReducedMotion() || !('IntersectionObserver' in window)) {
      // Immediately set final values
      statElements.forEach(el => {
        const target = el.getAttribute('data-counter-target');
        const suffix = el.getAttribute('data-counter-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          obs.unobserve(el);

          const target = parseInt(el.getAttribute('data-counter-target'), 10);
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const duration = 1200; // ms
          const start = 0;
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeProgress);

            el.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = target.toLocaleString() + suffix;
            }
          }

          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.2 });

    statElements.forEach(el => observer.observe(el));
  }

  /**
   * Section-entry scroll reveals via IntersectionObserver.
   * Respects prefers-reduced-motion by showing the static end-state directly.
   */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (isReducedMotion() || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /**
   * Homepage Personalized Entry strip ("What brings you to Web3 Carnival?")
   * Lightweight, skippable personalization — never blocks the rest of the page.
   * Selection is stored in localStorage and drives a recommended next-step CTA.
   */
  function initPersonaStrip() {
    const wrap = document.querySelector('[data-persona-strip]');
    if (!wrap) return;

    const STORAGE_KEY = 'w3c_persona_choice';
    const buttons = wrap.querySelectorAll('.persona-btn');
    const recommendPanel = wrap.querySelector('[data-persona-recommend]');
    const recommendText = wrap.querySelector('[data-persona-recommend-text]');
    const recommendCta = wrap.querySelector('[data-persona-recommend-cta]');

    const personas = (typeof WEB3_CARNIVAL_DATA !== 'undefined' && WEB3_CARNIVAL_DATA.personas)
      ? WEB3_CARNIVAL_DATA.personas
      : [];

    function applySelection(id, persist) {
      const persona = personas.find(p => p.id === id);
      if (!persona) return;

      buttons.forEach(btn => {
        const isMatch = btn.getAttribute('data-persona-id') === id;
        btn.classList.toggle('selected', isMatch);
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      if (recommendText) recommendText.textContent = persona.recommend;
      if (recommendCta) {
        recommendCta.textContent = persona.ctaLabel;
        recommendCta.setAttribute('href', persona.ctaHref);
      }
      if (recommendPanel) recommendPanel.classList.add('show');

      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch (e) {
          // localStorage disabled / restricted — selection just won't persist
        }
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        applySelection(btn.getAttribute('data-persona-id'), true);
      });
    });

    // Restore prior selection on load, if any
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) applySelection(stored, false);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Interactive Filter Buttons (Reusable UI Component Handler)
   */
  function initFilterBars() {
    const filterBars = document.querySelectorAll('.filter-bar');
    filterBars.forEach(bar => {
      const buttons = bar.querySelectorAll('.filter-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filterValue = btn.getAttribute('data-filter') || 'all';
          // Dispatch custom event for page listeners
          bar.dispatchEvent(new CustomEvent('filter-changed', {
            detail: { filter: filterValue },
            bubbles: true
          }));
        });
      });
    });
  }

  /**
   * Initialize Global Behaviors
   */
  document.addEventListener('DOMContentLoaded', () => {
    initCountdownTimer();
    initStatCounters();
    initFilterBars();
    initScrollReveal();
    initPersonaStrip();

    // Log Designathon System Verification
    console.info(
      "%c🎪 Web3 Carnival Design System Ready\n%cGDG KalaKriti Designathon · FinTech Track · Scenario 1\nTheme: " +
      (document.documentElement.getAttribute('data-theme') || 'dark'),
      "color: #5B5FEF; font-size: 14px; font-weight: bold;",
      "color: #22D3EE; font-size: 11px;"
    );
  });
})();
