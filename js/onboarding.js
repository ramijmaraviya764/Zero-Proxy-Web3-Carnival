/**
 * Web3 Carnival – Contextual Coachmark Tour (v3.4)
 *
 * Smooth Step Progression:
 *  - When clicking "Next", the onboarding card, spotlight, ring, and previous button highlight
 *    are IMMEDIATELY HIDDEN.
 *  - The page smoothly scrolls to the next target button.
 *  - ONLY after the page arrives and settles at that particular button:
 *      1. That button lights up with vivid color & glow.
 *      2. The full-screen scrim blurs & dims the page, with a clean cutout around that button.
 *      3. The onboarding menu card appears directly beside that button:
 *         - Step 1: on the RIGHT of "Explore the Event"
 *         - Step 2: on the RIGHT of "Explore the Ecosystem"
 *         - Step 3: on the LEFT of "#nav-register-btn"
 */

(function () {
  'use strict';

  /* =========================================================================
     Config
  ========================================================================= */

  const STORAGE_KEY = 'web3CarnivalOnboarding';
  const CARD_W      = 320;   // px
  const MARGIN      = 16;    // viewport / target clearance
  const RING_PAD    = 8;     // ring padding around target

  const STEPS = [
    {
      target:        null,
      isWelcome:     true,
      eyebrow:       '',
      title:         'Welcome to Web3 Carnival',
      desc:          'Take a quick 20-second tour to understand how the experience works.',
      nextLabel:     'Start tour',
      preferredSide: 'bottom-right'
    },
    {
      /* Step 1: "Explore the Event" button in hero */
      target:        '.hero-actions a[href="event.html"], a[href="event.html"].btn-secondary',
      fb:            '.hero-actions',
      eyebrow:       '1 / 3',
      title:         'Explore the event',
      desc:          'Start here to discover the event, tracks and speakers.',
      nextLabel:     'Next →',
      preferredSide: 'right'
    },
    {
      /* Step 2: "Explore the Ecosystem" button in final CTA */
      target:        '.final-cta-actions a[href="ecosystem.html"], a[href="ecosystem.html"].btn-secondary',
      fb:            '.final-cta-section',
      eyebrow:       '2 / 3',
      title:         'Discover the ecosystem',
      desc:          'Explore the people, organisations and opportunities connected to Web3 Carnival.',
      nextLabel:     'Next →',
      preferredSide: 'right' // strictly on the right side of the button
    },
    {
      /* Step 3: Register button in sticky nav */
      target:        '#nav-register-btn',
      fb:            'a[href="register.html"].btn-primary',
      eyebrow:       '3 / 3',
      title:         'Make it yours',
      desc:          'Personalise your interests and complete registration to get your Carnival Pass.',
      nextLabel:     'Finish',
      preferredSide: 'left' // strictly on the left side of the button
    }
  ];

  /* =========================================================================
     State
  ========================================================================= */

  let currentStep    = 0;
  let isOpen         = false;
  let previousFocus  = null;
  let activeTargetEl = null;

  let scrimEl        = null;
  let ringEl         = null;
  let cardEl         = null;

  let resizeTimer    = null;

  /* =========================================================================
     Storage
  ========================================================================= */

  function readState()   { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
  function writeState(v) { try { localStorage.setItem(STORAGE_KEY, v);     } catch { /* ignore */ } }
  function hasSeen()     { const s = readState(); return s === 'skipped' || s === 'completed'; }
  function reset()       { try { localStorage.removeItem(STORAGE_KEY);     } catch { /* ignore */ } }

  /* =========================================================================
     Utilities
  ========================================================================= */

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }

  function resolveTarget(step) {
    if (!step || !step.target) return null;
    return document.querySelector(step.target)
        || (step.fb ? document.querySelector(step.fb) : null)
        || null;
  }

  function isComfortablyVisible(el) {
    const navH = (document.querySelector('.site-header') || {}).offsetHeight || 72;
    const r    = el.getBoundingClientRect();
    return r.top >= navH + 10 && r.bottom <= window.innerHeight - 80
        && r.left >= 0        && r.right  <= window.innerWidth;
  }

  /* =========================================================================
     DOM construction
  ========================================================================= */

  function buildDOM() {
    /* Full-screen empty div overlay with cutout excluding target */
    scrimEl = document.createElement('div');
    scrimEl.className = 'onboarding-scrim';
    scrimEl.setAttribute('aria-hidden', 'true');
    scrimEl.hidden = true;
    document.body.appendChild(scrimEl);

    /* Glowing cyan/purple neon aura ring around the target */
    ringEl = document.createElement('div');
    ringEl.className = 'onboarding-ring';
    ringEl.setAttribute('aria-hidden', 'true');
    ringEl.hidden = true;
    document.body.appendChild(ringEl);

    /* Tooltip card */
    cardEl = document.createElement('div');
    cardEl.id        = 'onboarding-card';
    cardEl.className = 'onboarding-card';
    cardEl.setAttribute('role',             'dialog');
    cardEl.setAttribute('aria-modal',       'false');
    cardEl.setAttribute('aria-labelledby',  'ob-title');
    cardEl.setAttribute('aria-describedby', 'ob-desc');
    cardEl.hidden = true;

    cardEl.innerHTML = `
      <div class="ob-header">
        <span class="ob-eyebrow" aria-hidden="true"></span>
        <button type="button" class="ob-close" aria-label="Close tour">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <h3 id="ob-title" class="ob-title"></h3>
      <p  id="ob-desc"  class="ob-desc"></p>
      <div class="ob-actions">
        <button type="button" class="ob-skip">Skip</button>
        <button type="button" class="ob-next btn btn-primary btn-sm">Next</button>
      </div>
      <div class="ob-sr-progress" aria-live="polite" aria-atomic="true"></div>
    `;

    document.body.appendChild(cardEl);
  }

  /* =========================================================================
     Card content
  ========================================================================= */

  function renderCard(step) {
    cardEl.querySelector('.ob-eyebrow').textContent     = step.eyebrow   || '';
    cardEl.querySelector('.ob-title').textContent       = step.title     || '';
    cardEl.querySelector('.ob-desc').textContent        = step.desc      || '';
    cardEl.querySelector('.ob-next').textContent        = step.nextLabel || 'Next';
    cardEl.querySelector('.ob-sr-progress').textContent =
      step.isWelcome ? '' : `Step ${currentStep} of ${STEPS.length - 1}`;

    cardEl.classList.toggle('ob--welcome', !!step.isWelcome);
  }

  /* =========================================================================
     Cutout & Spotlight
  ========================================================================= */

  function updateCutout(r) {
    if (!r) {
      scrimEl.style.clipPath = '';
      scrimEl.style.webkitClipPath = '';
      return;
    }
    const pad = RING_PAD;
    const l   = Math.max(0, Math.round(r.left - pad));
    const t   = Math.max(0, Math.round(r.top - pad));
    const w   = Math.min(window.innerWidth,  Math.round(r.right + pad));
    const b   = Math.min(window.innerHeight, Math.round(r.bottom + pad));

    /* Hollow cutout polygon: outer screen clockwise, inner cutout counter-clockwise */
    const path = `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${l}px ${t}px, ${l}px ${b}px, ${w}px ${b}px, ${w}px ${t}px, ${l}px ${t}px)`;
    scrimEl.style.clipPath = path;
    scrimEl.style.webkitClipPath = path;
  }

  function placeRing(targetEl) {
    const r   = targetEl.getBoundingClientRect();
    const pad = RING_PAD;

    const top  = r.top  - pad;
    const left = r.left - pad;
    const w    = r.width  + pad * 2;
    const h    = r.height + pad * 2;

    ringEl.style.top    = `${top}px`;
    ringEl.style.left   = `${left}px`;
    ringEl.style.width  = `${w}px`;
    ringEl.style.height = `${h}px`;

    const raw  = parseFloat(window.getComputedStyle(targetEl).borderTopLeftRadius) || 8;
    const pill = raw > targetEl.offsetHeight / 2;
    const rad  = pill ? 9999 : Math.min(raw + pad, 24);
    ringEl.style.borderRadius = pill ? '9999px' : `${rad}px`;
  }

  function applySpotlight(targetEl) {
    scrimEl.hidden = false;

    if (activeTargetEl && activeTargetEl !== targetEl) {
      activeTargetEl.classList.remove('onboarding-target--active');
    }
    targetEl.classList.add('onboarding-target--active');
    activeTargetEl = targetEl;

    const r = targetEl.getBoundingClientRect();
    placeRing(targetEl);
    updateCutout(r);
    ringEl.hidden = false;
  }

  function clearSpotlight() {
    scrimEl.hidden = true;
    ringEl.hidden  = true;
    updateCutout(null);

    if (activeTargetEl) {
      activeTargetEl.classList.remove('onboarding-target--active');
      activeTargetEl = null;
    }
  }

  /* =========================================================================
     Card positioning
  ========================================================================= */

  function setCardInset(top, left, bottom, right) {
    cardEl.style.top    = top;
    cardEl.style.left   = left;
    cardEl.style.bottom = bottom;
    cardEl.style.right  = right;
  }

  function placeCard(targetEl, preferredSide) {
    const vw    = window.innerWidth;
    const vh    = window.innerHeight;
    const cardW = Math.min(320, vw - 24);
    const cardH = cardEl.offsetHeight || 180;
    const pad   = RING_PAD;

    /* Welcome step (step 0): floating card */
    if (!targetEl) {
      if (vw < 640) {
        const left = Math.round((vw - cardW) / 2);
        setCardInset('auto', `${left}px`, '20px', 'auto');
      } else {
        setCardInset('auto', 'auto', '24px', '24px');
      }
      return;
    }

    const r   = targetEl.getBoundingClientRect();
    const exT = r.top    - pad;
    const exB = r.bottom + pad;
    const exL = r.left   - pad;
    const exR = r.right  + pad;

    let top, left;

    // Check if side placement is viable on this screen width
    const canFitRight = (exR + MARGIN + cardW <= vw - MARGIN);
    const canFitLeft  = (exL - MARGIN - cardW >= MARGIN);

    if (preferredSide === 'right' && canFitRight) {
      // 1. Wide screens: strictly on the RIGHT side of the button
      left = exR + MARGIN;
      top  = r.top + (r.height / 2) - (cardH / 2);
    } else if (preferredSide === 'left' && canFitLeft) {
      // 2. Wide screens Step 3: strictly on the LEFT side of the Register button
      left = exL - MARGIN - cardW;
      top  = r.top - 4;
    } else if (canFitRight && preferredSide !== 'left') {
      left = exR + MARGIN;
      top  = r.top + (r.height / 2) - (cardH / 2);
    } else if (canFitLeft && preferredSide === 'left') {
      left = exL - MARGIN - cardW;
      top  = r.top - 4;
    } else {
      // 3. Side does not fit (Mobile & narrow screens) -> Position ABOVE or BELOW the button!
      const canFitBelow = (exB + MARGIN + cardH <= vh - MARGIN);
      const canFitAbove = (exT - MARGIN - cardH >= MARGIN);

      if (canFitBelow || !canFitAbove) {
        // Place neatly BELOW the button
        top = exB + MARGIN;
      } else {
        // Place neatly ABOVE the button
        top = exT - cardH - MARGIN;
      }

      // Horizontal position: center with the button, clamped to screen margins
      const targetCenter = r.left + r.width / 2;
      left = targetCenter - cardW / 2;

      // For Step 3 on mobile (button is in top-right), bias card toward the right edge
      if (preferredSide === 'left' && vw < 640) {
        left = vw - cardW - MARGIN;
      }
    }

    // Final boundary clamp
    left = clamp(left, MARGIN, vw - cardW - MARGIN);
    top  = clamp(top,  MARGIN, vh - cardH  - MARGIN);

    setCardInset(`${Math.round(top)}px`, `${Math.round(left)}px`, 'auto', 'auto');
  }

  /* =========================================================================
     Smooth scroll tracking
  ========================================================================= */

  function scrollIntoViewAndSettle(targetEl, callback) {
    if (prefersReducedMotion()) {
      targetEl.scrollIntoView({ block: 'center' });
      requestAnimationFrame(() => {
        if (isOpen) callback();
      });
      return;
    }

    let settleTimer = null;
    let maxTimer    = null;
    let didCall     = false;

    function cleanup() {
      clearTimeout(settleTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('scroll', onScrollTick);
    }

    function done() {
      if (didCall) return;
      didCall = true;
      cleanup();
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (isOpen) callback();
        }, 80);
      });
    }

    function onScrollTick() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(done, 140);
    }

    window.addEventListener('scroll', onScrollTick, { passive: true });

    targetEl.scrollIntoView({
      behavior: 'smooth',
      block:    'center'
    });

    /* Safe fallback timeout (allows long smooth scrolls across large pages to finish) */
    maxTimer = setTimeout(done, 2200);
  }

  function scrollToTopAndSettle(callback) {
    if (prefersReducedMotion() || window.scrollY < 40) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        if (isOpen) callback();
      });
      return;
    }

    let settleTimer = null;
    let maxTimer    = null;
    let didCall     = false;

    function cleanup() {
      clearTimeout(settleTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('scroll', onScrollTick);
    }

    function done() {
      if (didCall) return;
      didCall = true;
      cleanup();
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (isOpen) callback();
        }, 80);
      });
    }

    function onScrollTick() {
      clearTimeout(settleTimer);
      if (window.scrollY < 30) {
        settleTimer = setTimeout(done, 90);
      } else {
        settleTimer = setTimeout(done, 150);
      }
    }

    window.addEventListener('scroll', onScrollTick, { passive: true });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    maxTimer = setTimeout(done, 2200);
  }

  /* =========================================================================
     Step transitions — Hide card & button while moving, show only on arrival
  ========================================================================= */

  function goToStep(index) {
    const step = STEPS[index];
    if (!step) return;

    currentStep = index;

    /*
     * 1. HIDE the onboarding menu and clear the previous spotlight immediately.
     * Nothing is shown while the page scrolls to the new target.
     */
    cardEl.hidden = true;
    cardEl.style.opacity = '0';
    cardEl.style.pointerEvents = 'none';
    clearSpotlight();

    const targetEl = resolveTarget(step);

    /* Welcome step (step 0): no scroll needed, show welcome card immediately */
    if (!targetEl) {
      renderCard(step);
      cardEl.hidden = false;
      cardEl.style.opacity = '0';
      cardEl.style.pointerEvents = 'none';
      placeCard(null, step.preferredSide);
      requestAnimationFrame(() => {
        if (!isOpen || currentStep !== index) return;
        cardEl.style.opacity = '1';
        cardEl.style.pointerEvents = 'auto';
        focusPrimary();
      });
      return;
    }

    /* Helper: called ONLY when the viewport has settled at the target button */
    function showStepAtTarget() {
      if (!isOpen || currentStep !== index) return;

      renderCard(step);
      applySpotlight(targetEl);

      /* Unhide at opacity 0 first so card dimensions can be measured accurately in placeCard */
      cardEl.hidden = false;
      cardEl.style.opacity = '0';
      cardEl.style.pointerEvents = 'none';

      placeCard(targetEl, step.preferredSide);

      /* Reveal the card with smooth entrance now that it has reached the target */
      requestAnimationFrame(() => {
        if (!isOpen || currentStep !== index) return;
        cardEl.style.opacity = '1';
        cardEl.style.pointerEvents = 'auto';
        focusPrimary();
      });
    }

    /*
     * Step 3: Register button in sticky nav.
     * Scroll smoothly all the way back to the top of the page.
     */
    if (index === 3) {
      if (window.scrollY < 40) {
        showStepAtTarget();
      } else {
        scrollToTopAndSettle(() => {
          showStepAtTarget();
        });
      }
      return;
    }

    /*
     * Step 1 and Step 2:
     * If already comfortably visible, show immediately.
     * Otherwise, scroll smoothly to the target, and ONLY show upon arrival.
     */
    if (isComfortablyVisible(targetEl)) {
      showStepAtTarget();
    } else {
      scrollIntoViewAndSettle(targetEl, () => {
        showStepAtTarget();
      });
    }
  }

  function focusPrimary() {
    requestAnimationFrame(() => {
      const btn = cardEl && cardEl.querySelector('.ob-next');
      if (btn) btn.focus({ preventScroll: true });
    });
  }

  /* =========================================================================
     Reposition on resize / scroll
  ========================================================================= */

  function reposition() {
    if (!isOpen || currentStep === 0 || cardEl.hidden) return;
    const step = STEPS[currentStep];
    const targetEl = resolveTarget(step);
    if (!targetEl) return;

    const r = targetEl.getBoundingClientRect();
    placeRing(targetEl);
    updateCutout(r);
    placeCard(targetEl, step.preferredSide);
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reposition, 100);
  }

  function onWindowScroll() {
    if (!isOpen || currentStep === 0 || cardEl.hidden) return;
    requestAnimationFrame(reposition);
  }

  /* =========================================================================
     Open / Close
  ========================================================================= */

  function start() {
    if (!cardEl) {
      buildDOM();
      wireEvents();
    }
    if (isOpen) return;
    isOpen = true;

    previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : document.body;

    window.addEventListener('resize', onResize,       { passive: true });
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    goToStep(0);
  }

  function closeTour(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;

    clearSpotlight();
    clearTimeout(resizeTimer);

    cardEl.hidden = true;
    cardEl.style.opacity = '0';
    setCardInset('auto', 'auto', '24px', '24px');

    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onWindowScroll);
    document.removeEventListener('keydown', onKeyDown);

    if (restoreFocus !== false && previousFocus &&
        typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function skip()     { writeState('skipped');   closeTour(); }
  function complete() { writeState('completed'); closeTour(); }

  function onKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      skip();
      return;
    }
    if (e.key === 'Tab' && cardEl && !cardEl.hidden) {
      const focusables = Array.from(
        cardEl.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* =========================================================================
     Wiring
  ========================================================================= */

  function wireEvents() {
    cardEl.querySelector('.ob-close').addEventListener('click', skip);
    cardEl.querySelector('.ob-skip').addEventListener('click', skip);
    cardEl.querySelector('.ob-next').addEventListener('click', () => {
      if (currentStep === 0)                    goToStep(1);
      else if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
      else                                      complete();
    });
    scrimEl.addEventListener('click', skip);

    // If user clicks the active target button during the tour, record completion
    document.addEventListener('click', (e) => {
      if (isOpen && activeTargetEl && activeTargetEl.contains(e.target)) {
        writeState('completed');
        closeTour(false);
      }
    });

    // Listen for any elements with [data-tour-trigger] across the page
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-tour-trigger]');
      if (trigger) {
        e.preventDefault();
        reset();
        start();
      }
    });
  }

  /* =========================================================================
     Init
  ========================================================================= */

  function init() {
    buildDOM();
    wireEvents();

    const isHome = (() => {
      const f = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
      return f === '' || f === 'index.html';
    })();

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.has('tour') || urlParams.has('onboarding');

    if (isHome && (forceTour || !hasSeen())) {
      setTimeout(start, 650);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Web3CarnivalOnboarding = { hasSeen, start, skip, complete, reset };
})();
