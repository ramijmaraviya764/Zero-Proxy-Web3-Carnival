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

    // Target: November 14, 2026 09:00:00 UTC
    const targetDate = new Date('2026-11-14T09:00:00Z').getTime();

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

    // Log Designathon System Verification
    console.info(
      "%c🎪 Web3 Carnival Design System Ready\n%cGDG KalaKriti Designathon · FinTech Track · Scenario 1\nTheme: " +
      (document.documentElement.getAttribute('data-theme') || 'dark'),
      "color: #5B5FEF; font-size: 14px; font-weight: bold;",
      "color: #22D3EE; font-size: 11px;"
    );
  });
})();
