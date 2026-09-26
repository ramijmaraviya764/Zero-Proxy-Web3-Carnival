/**
 * Web3 Carnival Design System - Registration Flow (Phase 8)
 * 5-step registration stepper + digital pass generator.
 * Frontend-only: client-side validation, localStorage persistence for
 * in-progress state, no network requests, no real submission.
 *
 * Scoped entirely to register.html — bails out immediately if the page's
 * registration markup isn't present.
 */

(function () {
  'use strict';

  const STATE_KEY = 'w3c_registration_state';
  const JOURNEY_KEY = 'w3c_my_journey';       // shared with js/filters.js (event.html)
  const PERSONA_KEY = 'w3c_persona_choice';   // shared with js/main.js (index.html)
  const TOTAL_STEPS = 5;

  const STEP_LABELS = {
    1: 'Your Goal',
    2: 'Interests',
    3: 'Your Details',
    4: 'Event Plan',
    5: 'Your Pass'
  };

  // "Get Involved" footer/CTA links use these ids (see js/navigation.js /
  // js/data.js getInvolvedPaths) — map them onto the 5 goal options so a
  // visitor arriving from ?type=speaker etc. lands on the right pre-selection.
  const TYPE_PARAM_TO_GOAL = {
    speaker: 'speak',
    'super-demo': 'build',
    sponsor: 'partner',
    community: 'partner',
    media: 'partner',
    volunteer: 'attend'
  };

  // Prototype-only networking preference options (UI content, not brand data).
  const NETWORKING_OPTIONS = [
    { id: 'investor-meetings', label: '1:1 Investor Meetings' },
    { id: 'founder-meetups', label: 'Founder & Builder Meetups' },
    { id: 'recruiting', label: 'Recruiting & Hiring' },
    { id: 'press', label: 'Media & Press Introductions' },
    { id: 'casual', label: 'Casual Networking Only' }
  ];

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function defaultState() {
    return {
      step: 1,
      maxStepReached: 1,
      goal: null,
      interests: [],
      details: { name: '', email: '', role: '', organization: '' },
      plan: { sessionIds: [], sessionsInitialized: false, networking: [], eventInterests: [] },
      passId: null
    };
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // localStorage disabled/restricted — progress just won't persist
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[data-registration-form]');
    const passPanel = document.querySelector('[data-step-panel="5"]');
    if (!form || !passPanel) return; // Not on register.html

    const data = (typeof WEB3_CARNIVAL_DATA !== 'undefined') ? WEB3_CARNIVAL_DATA : null;
    const personas = (data && data.personas) || [];
    const tracks = (data && data.tracks) || [];
    const sessions = (data && data.sessions) || [];
    const sessionInterests = (data && data.sessionInterests) || [];
    const eventDetails = (data && data.eventDetails) || {};
    const brand = (data && data.brand) || {};

    const sessionById = Object.fromEntries(sessions.map(s => [s.id, s]));

    // ------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------
    let state = loadInitialState();

    function loadInitialState() {
      const raw = safeGet(STATE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return Object.assign(defaultState(), parsed, {
            details: Object.assign({ name: '', email: '', role: '', organization: '' }, parsed.details || {}),
            plan: Object.assign({ sessionIds: [], sessionsInitialized: false, networking: [], eventInterests: [] }, parsed.plan || {})
          });
        } catch (e) {
          // fall through to fresh state
        }
      }

      // Fresh session — try a soft pre-fill from the URL's ?type= param,
      // then from the homepage persona strip choice, if either is present.
      const fresh = defaultState();
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      if (typeParam && TYPE_PARAM_TO_GOAL[typeParam]) {
        fresh.goal = TYPE_PARAM_TO_GOAL[typeParam];
      } else {
        const personaChoice = safeGet(PERSONA_KEY);
        if (personaChoice && personas.some(p => p.id === personaChoice)) {
          fresh.goal = personaChoice;
        }
      }
      return fresh;
    }

    function saveState() {
      safeSet(STATE_KEY, JSON.stringify(state));
    }

    function clearState() {
      safeRemove(STATE_KEY);
      state = defaultState();
    }

    // ------------------------------------------------------------------
    // DOM references
    // ------------------------------------------------------------------
    const announcer = document.querySelector('[data-step-announcer]');
    const progressBtns = Array.from(document.querySelectorAll('[data-progress-btn]'));
    const progressItems = Array.from(document.querySelectorAll('[data-progress-item]'));
    const progressFill = document.querySelector('[data-reg-progress-fill]');
    const progressMobileLabel = document.querySelector('[data-reg-progress-mobile-label]');

    const stepPanels = Array.from(document.querySelectorAll('.reg-step[data-step-panel]'));
    const backBtn = document.querySelector('[data-reg-back]');
    const continueBtn = document.querySelector('[data-reg-continue]');

    const goalGrid = document.querySelector('[data-goal-grid]');
    const goalError = document.getElementById('goal-error');

    const trackGrid = document.querySelector('[data-track-grid]');
    const interestsError = document.getElementById('interests-error');

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const roleSelect = document.getElementById('reg-role');
    const orgInput = document.getElementById('reg-org');
    const nameError = document.getElementById('reg-name-error');
    const emailError = document.getElementById('reg-email-error');
    const roleError = document.getElementById('reg-role-error');

    const planSessionsWrap = document.querySelector('[data-plan-sessions]');
    const planNetworkingWrap = document.querySelector('[data-plan-networking]');
    const planInterestsWrap = document.querySelector('[data-plan-interests]');

    const passEl = document.querySelector('[data-digital-pass]');
    const downloadBtn = document.querySelector('[data-pass-download]');
    const restartBtn = document.querySelector('[data-pass-restart]');

    // ------------------------------------------------------------------
    // Step 1 — Your Goal
    // ------------------------------------------------------------------
    function renderGoalOptions() {
      if (!goalGrid) return;
      goalGrid.innerHTML = personas.map(p => `
        <label class="reg-option-card" for="goal-${p.id}" data-option-card>
          <input type="radio" class="reg-option-input" id="goal-${p.id}" name="goal" value="${p.id}"
            ${state.goal === p.id ? 'checked' : ''}>
          <span class="reg-option-indicator" aria-hidden="true"></span>
          <span class="reg-option-body">
            <span class="reg-option-title">${escapeHtml(p.label)}</span>
            <span class="reg-option-desc">${escapeHtml(p.recommend || '')}</span>
          </span>
        </label>
      `).join('');

      goalGrid.querySelectorAll('.reg-option-input').forEach(input => {
        input.addEventListener('change', () => {
          state.goal = input.value;
          setFieldValid(goalGrid, goalError);
          saveState();
        });
      });

      syncOptionCardStates(goalGrid);
    }

    // ------------------------------------------------------------------
    // Step 2 — Your Interests (tracks)
    // ------------------------------------------------------------------
    function renderTrackOptions() {
      if (!trackGrid) return;
      trackGrid.innerHTML = tracks.map(t => `
        <label class="reg-chip" for="track-${t.id}" data-option-card>
          <input type="checkbox" class="reg-option-input" id="track-${t.id}" name="interests" value="${t.id}"
            ${state.interests.includes(t.id) ? 'checked' : ''}>
          <span class="reg-chip-check" aria-hidden="true">✓</span>
          <span class="reg-chip-icon" aria-hidden="true">${t.icon || ''}</span>
          <span class="reg-chip-label">${escapeHtml(t.name)}</span>
        </label>
      `).join('');

      trackGrid.querySelectorAll('.reg-option-input').forEach(input => {
        input.addEventListener('change', () => {
          const set = new Set(state.interests);
          if (input.checked) set.add(input.value); else set.delete(input.value);
          state.interests = Array.from(set);
          if (state.interests.length) setFieldValid(trackGrid, interestsError);
          syncOptionCardStates(trackGrid);
          saveState();
        });
      });

      syncOptionCardStates(trackGrid);
    }

    // ------------------------------------------------------------------
    // Step 3 — Your Details
    // ------------------------------------------------------------------
    function hydrateDetailsFields() {
      if (nameInput) nameInput.value = state.details.name || '';
      if (emailInput) emailInput.value = state.details.email || '';
      if (roleSelect) roleSelect.value = state.details.role || '';
      if (orgInput) orgInput.value = state.details.organization || '';
    }

    function bindDetailsFields() {
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          state.details.name = nameInput.value;
          if (nameInput.value.trim().length >= 2) clearFieldError(nameInput, nameError);
          saveState();
        });
      }
      if (emailInput) {
        emailInput.addEventListener('input', () => {
          state.details.email = emailInput.value;
          if (EMAIL_PATTERN.test(emailInput.value.trim())) clearFieldError(emailInput, emailError);
          saveState();
        });
      }
      if (roleSelect) {
        roleSelect.addEventListener('change', () => {
          state.details.role = roleSelect.value;
          if (roleSelect.value) clearFieldError(roleSelect, roleError);
          saveState();
        });
      }
      if (orgInput) {
        orgInput.addEventListener('input', () => {
          state.details.organization = orgInput.value;
          saveState();
        });
      }
    }

    // ------------------------------------------------------------------
    // Step 4 — Your Event Plan
    // ------------------------------------------------------------------
    function getJourneySessions() {
      const raw = safeGet(JOURNEY_KEY);
      let ids = [];
      try {
        ids = raw ? JSON.parse(raw) : [];
      } catch (e) {
        ids = [];
      }
      return ids.map(id => sessionById[id]).filter(Boolean);
    }

    function renderPlanStep() {
      const journeySessions = getJourneySessions();

      // First time this step is built, default every saved session to "included".
      if (!state.plan.sessionsInitialized) {
        state.plan.sessionIds = journeySessions.map(s => s.id);
        state.plan.sessionsInitialized = true;
        saveState();
      }

      if (planSessionsWrap) {
        if (!journeySessions.length) {
          planSessionsWrap.innerHTML = `
            <p class="reg-plan-empty">You haven't saved any sessions yet. Browse the
              <a href="event.html">event schedule</a> and add sessions to "My Journey" —
              they'll show up here next time.</p>`;
        } else {
          planSessionsWrap.innerHTML = `
            <p class="reg-plan-hint">Include the sessions you want reflected on your pass.</p>
            <div class="reg-plan-session-list">
              ${journeySessions.map(s => `
                <label class="reg-plan-session-item" for="plan-session-${s.id}">
                  <input type="checkbox" class="reg-option-input" id="plan-session-${s.id}"
                    value="${s.id}" ${state.plan.sessionIds.includes(s.id) ? 'checked' : ''}>
                  <span class="reg-plan-session-check" aria-hidden="true">✓</span>
                  <span class="reg-plan-session-info">
                    <span class="reg-plan-session-title">${escapeHtml(s.title)}</span>
                    <span class="reg-plan-session-meta">${escapeHtml(s.time || '')}</span>
                  </span>
                </label>
              `).join('')}
            </div>`;

          planSessionsWrap.querySelectorAll('.reg-option-input').forEach(input => {
            input.addEventListener('change', () => {
              const set = new Set(state.plan.sessionIds);
              if (input.checked) set.add(input.value); else set.delete(input.value);
              state.plan.sessionIds = Array.from(set);
              saveState();
            });
          });
        }
      }

      if (planNetworkingWrap) {
        planNetworkingWrap.innerHTML = NETWORKING_OPTIONS.map(opt => `
          <label class="reg-chip reg-chip-compact" for="net-${opt.id}" data-option-card>
            <input type="checkbox" class="reg-option-input" id="net-${opt.id}" value="${opt.id}"
              ${state.plan.networking.includes(opt.id) ? 'checked' : ''}>
            <span class="reg-chip-check" aria-hidden="true">✓</span>
            <span class="reg-chip-label">${escapeHtml(opt.label)}</span>
          </label>
        `).join('');

        planNetworkingWrap.querySelectorAll('.reg-option-input').forEach(input => {
          input.addEventListener('change', () => {
            const set = new Set(state.plan.networking);
            if (input.checked) set.add(input.value); else set.delete(input.value);
            state.plan.networking = Array.from(set);
            syncOptionCardStates(planNetworkingWrap);
            saveState();
          });
        });
        syncOptionCardStates(planNetworkingWrap);
      }

      if (planInterestsWrap) {
        planInterestsWrap.innerHTML = sessionInterests.map(opt => `
          <label class="reg-chip reg-chip-compact" for="evint-${opt.id}" data-option-card>
            <input type="checkbox" class="reg-option-input" id="evint-${opt.id}" value="${opt.id}"
              ${state.plan.eventInterests.includes(opt.id) ? 'checked' : ''}>
            <span class="reg-chip-check" aria-hidden="true">✓</span>
            <span class="reg-chip-label">${escapeHtml(opt.label)}</span>
          </label>
        `).join('');

        planInterestsWrap.querySelectorAll('.reg-option-input').forEach(input => {
          input.addEventListener('change', () => {
            const set = new Set(state.plan.eventInterests);
            if (input.checked) set.add(input.value); else set.delete(input.value);
            state.plan.eventInterests = Array.from(set);
            syncOptionCardStates(planInterestsWrap);
            saveState();
          });
        });
        syncOptionCardStates(planInterestsWrap);
      }
    }

    // ------------------------------------------------------------------
    // Step 5 — Your Pass
    // ------------------------------------------------------------------
    function generatePassId() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return `WC26-${code}`;
    }

    function goalLabel(goalId) {
      const persona = personas.find(p => p.id === goalId);
      return persona ? persona.label : 'Attendee';
    }

    function renderPass() {
      if (!passEl) return;
      if (!state.passId) {
        state.passId = generatePassId();
        saveState();
      }

      const trackNames = state.interests
        .map(id => tracks.find(t => t.id === id))
        .filter(Boolean)
        .map(t => t.name);

      const networkingLabels = state.plan.networking
        .map(id => NETWORKING_OPTIONS.find(o => o.id === id))
        .filter(Boolean)
        .map(o => o.label);

      const eventInterestLabels = state.plan.eventInterests
        .map(id => sessionInterests.find(o => o.id === id))
        .filter(Boolean)
        .map(o => o.label);

      const includedSessions = state.plan.sessionIds
        .map(id => sessionById[id])
        .filter(Boolean);

      const initials = (state.details.name || '?')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || '?';

      const roleText = roleSelect ? (roleSelect.selectedOptions[0] ? roleSelect.selectedOptions[0].textContent : '') : '';

      passEl.innerHTML = `
        <div class="digital-pass-glow" aria-hidden="true"></div>
        <div class="digital-pass-inner">
          <div class="digital-pass-top">
            <div class="digital-pass-brand">
              <span class="digital-pass-brand-name">${escapeHtml(brand.name || 'Web3 Carnival')}</span>
              <span class="digital-pass-edition">${escapeHtml(eventDetails.edition || eventDetails.name || '')}</span>
            </div>
            <span class="digital-pass-goal-badge">${escapeHtml(goalLabel(state.goal))}</span>
          </div>

          <div class="digital-pass-identity">
            <div class="digital-pass-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
            <div class="digital-pass-identity-text">
              <span class="digital-pass-name">${escapeHtml(state.details.name || 'Guest Attendee')}</span>
              <span class="digital-pass-role">${escapeHtml([roleText, state.details.organization].filter(Boolean).join(' · '))}</span>
            </div>
          </div>

          ${trackNames.length ? `
            <div class="digital-pass-section">
              <span class="digital-pass-section-label">Tracks</span>
              <div class="digital-pass-pills">
                ${trackNames.map(n => `<span class="digital-pass-pill">${escapeHtml(n)}</span>`).join('')}
              </div>
            </div>` : ''}

          ${(networkingLabels.length || eventInterestLabels.length) ? `
            <div class="digital-pass-section">
              <span class="digital-pass-section-label">Event Plan</span>
              <div class="digital-pass-pills">
                ${networkingLabels.map(n => `<span class="digital-pass-pill digital-pass-pill-alt">${escapeHtml(n)}</span>`).join('')}
                ${eventInterestLabels.map(n => `<span class="digital-pass-pill digital-pass-pill-alt">${escapeHtml(n)}</span>`).join('')}
              </div>
            </div>` : ''}

          ${includedSessions.length ? `
            <div class="digital-pass-section">
              <span class="digital-pass-section-label">${includedSessions.length} Saved Session${includedSessions.length === 1 ? '' : 's'}</span>
              <ul class="digital-pass-session-list">
                ${includedSessions.slice(0, 4).map(s => `<li>${escapeHtml(s.title)}</li>`).join('')}
                ${includedSessions.length > 4 ? `<li class="digital-pass-session-more">+${includedSessions.length - 4} more</li>` : ''}
              </ul>
            </div>` : ''}

          <div class="digital-pass-footer">
            <div class="digital-pass-event-info">
              <span class="digital-pass-event-name">${escapeHtml(eventDetails.name || brand.name || 'Web3 Carnival 2026')}</span>
              <span class="digital-pass-event-date">${escapeHtml(eventDetails.dateLabel || brand.dates || '')}</span>
              <span class="digital-pass-id">Pass ID ${escapeHtml(state.passId)} · Prototype only</span>
            </div>
            <div class="digital-pass-qr" aria-hidden="true">
              <span>QR</span>
            </div>
          </div>
        </div>
      `;

      // Reveal animation — respects prefers-reduced-motion via the site-wide
      // base.css override, which collapses the transition duration to ~0.
      passEl.classList.remove('is-revealed');
      // Force reflow so the transition re-triggers even on repeat visits to Step 5.
      // eslint-disable-next-line no-unused-expressions
      passEl.offsetHeight;
      requestAnimationFrame(() => passEl.classList.add('is-revealed'));
    }

    // ------------------------------------------------------------------
    // Shared option-card active-state sync (checkbox/radio "chip" cards)
    // ------------------------------------------------------------------
    function syncOptionCardStates(container) {
      if (!container) return;
      container.querySelectorAll('[data-option-card]').forEach(card => {
        const input = card.querySelector('.reg-option-input');
        card.classList.toggle('is-checked', !!(input && input.checked));
      });
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------
    function showFieldError(input, errorEl, message) {
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
      if (input) input.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(input, errorEl) {
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
      if (input) input.removeAttribute('aria-invalid');
    }

    function setFieldValid(container, errorEl) {
      clearFieldError(null, errorEl);
      if (container) container.removeAttribute('aria-invalid');
    }

    function validateStep(step) {
      let firstInvalid = null;

      if (step === 1) {
        if (!state.goal) {
          showFieldError(null, goalError, 'Please select what brings you to Web3 Carnival.');
          if (goalGrid) goalGrid.setAttribute('aria-invalid', 'true');
          firstInvalid = goalGrid ? goalGrid.querySelector('.reg-option-input') : null;
        } else {
          setFieldValid(goalGrid, goalError);
        }
      }

      if (step === 2) {
        if (!state.interests.length) {
          showFieldError(null, interestsError, 'Please select at least one track you\'re interested in.');
          if (trackGrid) trackGrid.setAttribute('aria-invalid', 'true');
          firstInvalid = trackGrid ? trackGrid.querySelector('.reg-option-input') : null;
        } else {
          setFieldValid(trackGrid, interestsError);
        }
      }

      if (step === 3) {
        const nameVal = (state.details.name || '').trim();
        const emailVal = (state.details.email || '').trim();
        const roleVal = state.details.role || '';

        if (nameVal.length < 2) {
          showFieldError(nameInput, nameError, 'Please enter your full name.');
          firstInvalid = firstInvalid || nameInput;
        } else {
          clearFieldError(nameInput, nameError);
        }

        if (!emailVal) {
          showFieldError(emailInput, emailError, 'Please enter your email address.');
          firstInvalid = firstInvalid || emailInput;
        } else if (!EMAIL_PATTERN.test(emailVal)) {
          showFieldError(emailInput, emailError, 'Please enter a valid email address (e.g. name@example.com).');
          firstInvalid = firstInvalid || emailInput;
        } else {
          clearFieldError(emailInput, emailError);
        }

        if (!roleVal) {
          showFieldError(roleSelect, roleError, 'Please select your role.');
          firstInvalid = firstInvalid || roleSelect;
        } else {
          clearFieldError(roleSelect, roleError);
        }
      }

      // Step 4 has no required fields — it's explicitly optional refinement.

      return firstInvalid;
    }

    // ------------------------------------------------------------------
    // Step navigation
    // ------------------------------------------------------------------
    function updateProgress() {
      progressBtns.forEach(btn => {
        const n = Number(btn.getAttribute('data-progress-btn'));
        const item = progressItems.find(li => Number(li.getAttribute('data-progress-item')) === n);
        const isCurrent = n === state.step;
        const isComplete = n < state.step;
        const isReachable = n <= state.maxStepReached;

        btn.disabled = !isReachable;
        if (isCurrent) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
        if (item) {
          item.classList.toggle('is-current', isCurrent);
          item.classList.toggle('is-complete', isComplete);
        }
      });

      const pct = Math.round(((state.step - 1) / (TOTAL_STEPS - 1)) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (progressMobileLabel) progressMobileLabel.textContent = `Step ${state.step} of ${TOTAL_STEPS} — ${STEP_LABELS[state.step]}`;
    }

    function showStep(step, opts) {
      const options = Object.assign({ focus: true, announce: true }, opts || {});
      state.step = step;
      if (step > state.maxStepReached) state.maxStepReached = step;

      stepPanels.forEach(panel => {
        const n = Number(panel.getAttribute('data-step-panel'));
        panel.hidden = n !== step;
      });

      if (backBtn) backBtn.hidden = step === 1 || step === 5;
      if (continueBtn) continueBtn.hidden = step === 5;
      const navRow = document.querySelector('[data-reg-nav]');
      if (navRow) navRow.hidden = step === 5;

      if (step === 4) renderPlanStep();
      if (step === 5) renderPass();

      updateProgress();
      saveState();

      if (options.announce && announcer) {
        announcer.textContent = `Step ${step} of ${TOTAL_STEPS}: ${STEP_LABELS[step]}`;
      }

      if (options.focus) {
        const activePanel = stepPanels.find(panel => Number(panel.getAttribute('data-step-panel')) === step);
        const heading = activePanel ? activePanel.querySelector('.reg-step-title') : null;
        if (heading) heading.focus({ preventScroll: false });
      }
    }

    function goNext() {
      const firstInvalid = validateStep(state.step);
      if (firstInvalid) {
        if (typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return;
      }
      if (state.step < TOTAL_STEPS) showStep(state.step + 1);
    }

    function goBack() {
      if (state.step > 1) showStep(state.step - 1);
    }

    function jumpToStep(step) {
      if (step > state.maxStepReached) return;
      if (step === state.step) return;
      // Jumping forward through already-visited steps still deserves a
      // validation pass on the step being left, so partially-filled data
      // isn't silently carried forward as "valid".
      if (step > state.step) {
        const firstInvalid = validateStep(state.step);
        if (firstInvalid) {
          if (typeof firstInvalid.focus === 'function') firstInvalid.focus();
          return;
        }
      }
      showStep(step);
    }

    // ------------------------------------------------------------------
    // Restart / download
    // ------------------------------------------------------------------
    function restart() {
      clearState();
      hydrateDetailsFields();
      renderGoalOptions();
      renderTrackOptions();
      showStep(1, { announce: true });
    }

    // ------------------------------------------------------------------
    // Wire up events
    // ------------------------------------------------------------------
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      goNext();
    });

    if (backBtn) backBtn.addEventListener('click', goBack);

    progressBtns.forEach(btn => {
      btn.addEventListener('click', () => jumpToStep(Number(btn.getAttribute('data-progress-btn'))));
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => window.print());
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', restart);
    }

    // ------------------------------------------------------------------
    // Init
    // ------------------------------------------------------------------
    renderGoalOptions();
    renderTrackOptions();
    hydrateDetailsFields();
    bindDetailsFields();
    showStep(state.step, { focus: false, announce: false });
  });
})();
