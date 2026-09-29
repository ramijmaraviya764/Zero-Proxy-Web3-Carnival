/**
 * Web3 Carnival — Phase 8 Registration Flow & Digital Event Pass
 * Handles 5-step sequential registration, state management, form validation,
 * saved journey integration, and rich digital pass generation.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('.register-shell');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const getInvolvedPaths = Array.isArray(data.getInvolvedPaths) ? data.getInvolvedPaths : [];

    // All available paths: Standard Attendee + the 6 real paths from design.md
    const allGoals = [
      { id: 'attendee', title: 'Attendee', description: 'Access keynotes, exhibition floors, tracks, and public side events.', icon: 'ticket' },
      ...getInvolvedPaths.map(p => {
        const icons = {
          sponsor: 'handshake', speaker: 'mic', media: 'news',
          community: 'globe', volunteer: 'users', 'super-demo': 'rocket'
        };
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          icon: icons[p.id] || 'default'
        };
      })
    ];

    const state = {
      step: 1,
      goal: '',
      tracks: [],
      name: '',
      email: '',
      role: '',
      organization: '',
      networking: [],
      interests: [],
      passId: 'W3C-2026-' + Math.floor(1000 + Math.random() * 9000)
    };

    // DOM Elements
    const form = root.querySelector('[data-registration-form]');
    const panels = root.querySelectorAll('[data-step-panel]');
    const progressItems = root.querySelectorAll('[data-progress-item]');
    const progressBtns = root.querySelectorAll('[data-progress-btn]');
    const mobileLabel = root.querySelector('[data-reg-progress-mobile-label]');
    const mobileFill = root.querySelector('[data-reg-progress-fill]');
    const announcer = root.querySelector('[data-step-announcer]');
    const backBtn = root.querySelector('[data-reg-back]');
    const continueBtn = root.querySelector('[data-reg-continue]');
    const goalGrid = root.querySelector('[data-goal-grid]');
    const trackGrid = root.querySelector('[data-track-grid]');
    const planSessionsWrap = root.querySelector('[data-plan-sessions]');
    const planNetworkingWrap = root.querySelector('[data-plan-networking]');
    const planInterestsWrap = root.querySelector('[data-plan-interests]');
    const digitalPassEl = root.querySelector('[data-digital-pass]');
    const passDownloadBtn = root.querySelector('[data-pass-download]');
    const passRestartBtn = root.querySelector('[data-pass-restart]');

    function escapeHtml(val) {
      return String(val ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[char]));
    }

    /**
     * Render a compact registration-path icon without emoji-dependent UI.
     * @param {string} name Semantic icon name.
     * @returns {string} Inline SVG markup.
     */
    function renderRegistrationIcon(name) {
      const paths = {
        ticket: '<path d="M4 7a3 3 0 0 0 0 6 3 3 0 0 0 0 6h16V7H4Z"/><path d="M9 7v12"/>',
        handshake: '<path d="m8 12 2.5 2.5a2.1 2.1 0 0 0 3 0l2-2"/><path d="M4 10 8 6l4 4"/><path d="m20 10-4-4-4 4"/><path d="M4 10v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>',
        mic: '<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
        news: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
        users: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20c.7-3 2.5-5 6-5s5.3 2 6 5M14 16c2.5-.5 4.5.7 5 4"/>',
        rocket: '<path d="M14.5 3.5c2.8-.3 4.6.5 6 1.9.1 1.4-.5 3.2-1.9 6l-5.1 5.1-5-5 6-8Z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
        default: '<path d="M12 4v16M4 12h16"/>'
      };
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.default}</svg>`;
    }

    // Step 1: Render Goal Grid
    function renderGoals() {
      if (!goalGrid) return;
      goalGrid.innerHTML = allGoals.map(g => `
        <label class="reg-goal-card${state.goal === g.id ? ' is-selected' : ''}" id="goal-card-${g.id}">
          <input type="radio" name="goal" value="${escapeHtml(g.id)}" ${state.goal === g.id ? 'checked' : ''}>
          <span class="reg-goal-icon" aria-hidden="true">${renderRegistrationIcon(g.icon)}</span>
          <span class="reg-goal-name">${escapeHtml(g.title)}</span>
          <span class="reg-goal-desc">${escapeHtml(g.description)}</span>
        </label>
      `).join('');

      goalGrid.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          state.goal = radio.value;
          goalGrid.querySelectorAll('.reg-goal-card').forEach(c => c.classList.remove('is-selected'));
          radio.closest('.reg-goal-card').classList.add('is-selected');
          clearError('goal-error');
        });
      });
    }

    // Step 2: Render Tracks Grid
    function renderTracks() {
      if (!trackGrid) return;
      trackGrid.innerHTML = tracks.map(t => {
        const isChecked = state.tracks.includes(t.id);
        return `
          <label class="reg-track-card${isChecked ? ' is-selected' : ''}" id="track-card-${t.id}">
            <input type="checkbox" name="track" value="${escapeHtml(t.id)}" ${isChecked ? 'checked' : ''}>
            <span class="reg-track-icon" aria-hidden="true">${renderRegistrationIcon(t.id)}</span>
            <span class="reg-track-name">${escapeHtml(t.name)}</span>
          </label>
        `;
      }).join('');

      trackGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            if (!state.tracks.includes(cb.value)) state.tracks.push(cb.value);
            cb.closest('.reg-track-card').classList.add('is-selected');
          } else {
            state.tracks = state.tracks.filter(tid => tid !== cb.value);
            cb.closest('.reg-track-card').classList.remove('is-selected');
          }
          if (state.tracks.length > 0) clearError('interests-error');
        });
      });
    }

    // Step 4: Render Plan Options (Saved Sessions + Checkboxes)
    function renderPlan() {
      // Saved Sessions
      if (planSessionsWrap) {
        let savedSessionIds = [];
        try {
          savedSessionIds = JSON.parse(localStorage.getItem('w3c_my_journey') || '[]');
        } catch (e) {
          savedSessionIds = [];
        }

        const allSessions = Array.isArray(data.sessions) ? data.sessions : [];
        const saved = allSessions.filter(s => savedSessionIds.includes(s.id));

        if (saved.length === 0) {
          planSessionsWrap.innerHTML = `
            <p class="journey-empty-note">
              No saved sessions yet. You can bookmark sessions anytime on the <a href="event.html#discovery" class="text-accent">Event page</a>.
            </p>
          `;
        } else {
          planSessionsWrap.innerHTML = `
            <div class="registration-saved-session-list">
              ${saved.map(s => `
                <div class="registration-saved-session-row">
                  <span><strong>${escapeHtml(s.time)}</strong> · ${escapeHtml(s.title)}</span>
                  <span class="pill pill-cyan">${escapeHtml(s.dayId.replace('day', 'Day '))}</span>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      // Networking
      if (planNetworkingWrap) {
        const networkingOpts = [
          'Venture Capital & Allocators', 'Protocol Founders & CxOs', 'Smart Contract Engineers',
          'DAO Core Contributors', 'Enterprise Executives', 'Academic Researchers'
        ];
        planNetworkingWrap.innerHTML = networkingOpts.map((opt, i) => `
          <label class="reg-check-label">
            <input type="checkbox" name="networking" value="${escapeHtml(opt)}">
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('');
      }

      // Interests
      if (planInterestsWrap) {
        const interestOpts = [
          'Zero-Knowledge Proofs', 'Cross-Chain Settlement', 'Institutional Liquidity',
          'On-Chain Governance', 'GameFi Tokenomics', 'RWA Tokenization'
        ];
        planInterestsWrap.innerHTML = interestOpts.map((opt, i) => `
          <label class="reg-check-label">
            <input type="checkbox" name="interest" value="${escapeHtml(opt)}">
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('');
      }
    }

    /**
     * Persist registration identity so My Carnival can reconnect the digital pass
     * and selected interests on later pages.
     * @returns {void}
     */
    function persistRegistrationProfile() {
      if (!window.Web3Carnival || !window.Web3Carnival.getState || !window.Web3CarnivalCore) return;
      const current = window.Web3Carnival.getState();
      const next = {
        ...current,
        tracks: Array.from(new Set([...(current.tracks || []), ...state.tracks])),
        profile: {
          ...current.profile,
          name: state.name,
          email: state.email,
          role: state.role,
          organization: state.organization,
          goal: state.goal,
          passId: state.passId
        }
      };

      try {
        localStorage.setItem(window.Web3CarnivalCore.STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(window.Web3CarnivalCore.LEGACY_JOURNEY_KEY, JSON.stringify(next.sessions || []));
        window.dispatchEvent(new CustomEvent('w3c:carnival-change', { detail: next }));
      } catch (error) {
        // Registration remains usable even if browser storage is restricted.
      }
    }

    // Step 5: Render Digital Event Pass (Signature Moment)
    function renderDigitalPass() {
      if (!digitalPassEl) return;

      persistRegistrationProfile();

      const selectedTracks = tracks.filter(t => state.tracks.includes(t.id));
      const goalObj = allGoals.find(g => g.id === state.goal) || { title: 'Attendee', icon: 'ticket' };
      const roleText = state.organization ? `${state.role} · ${state.organization}` : state.role || 'Web3 Pioneer';

      digitalPassEl.innerHTML = `
        <div class="digital-pass-header">
          <div class="digital-pass-brand">
            <div class="nav-brand-logo digital-pass-brand-logo" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <strong class="digital-pass-brand-title">Web3 Carnival 2026</strong>
              <span class="digital-pass-brand-subtitle">Official Digital Pass</span>
            </div>
          </div>
          <span class="digital-pass-type">${renderRegistrationIcon(goalObj.icon)} ${escapeHtml(goalObj.title)}</span>
        </div>

        <div class="digital-pass-body">
          <div>
            <h3 class="digital-pass-name">${escapeHtml(state.name || 'Valued Participant')}</h3>
            <p class="digital-pass-role">${escapeHtml(roleText)}</p>
          </div>

          <div class="digital-pass-meta-grid">
            <div class="digital-pass-meta-item">
              <span class="digital-pass-meta-label">Dates</span>
              <span class="digital-pass-meta-val">Nov 14–16, 2026</span>
            </div>
            <div class="digital-pass-meta-item">
              <span class="digital-pass-meta-label">Venue</span>
              <span class="digital-pass-meta-val">Singapore · Hybrid</span>
            </div>
            <div class="digital-pass-meta-item">
              <span class="digital-pass-meta-label">Access Level</span>
              <span class="digital-pass-meta-val">All Stages &amp; Floor</span>
            </div>
            <div class="digital-pass-meta-item">
              <span class="digital-pass-meta-label">Pass ID</span>
              <span class="digital-pass-meta-val digital-pass-meta-val--accent">${escapeHtml(state.passId)}</span>
            </div>
          </div>

          <div>
            <span class="digital-pass-meta-label digital-pass-meta-label--followed">Followed Tracks</span>
            <div class="digital-pass-tracks">
              ${selectedTracks.length ? selectedTracks.map(t => `<span class="pill pill-accent">${renderRegistrationIcon(t.id)} ${escapeHtml(t.name.split(' ')[0])}</span>`).join('') : '<span class="pill pill-accent">All 7 Tracks</span>'}
            </div>
          </div>

          <div class="digital-pass-footer">
            <div class="digital-pass-qr" aria-label="Digital pass QR verification placeholder">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="#0D1120">
                <rect x="0" y="0" width="30" height="30" rx="4"/>
                <rect x="70" y="0" width="30" height="30" rx="4"/>
                <rect x="0" y="70" width="30" height="30" rx="4"/>
                <rect x="10" y="10" width="10" height="10" fill="#FFFFFF"/>
                <rect x="80" y="10" width="10" height="10" fill="#FFFFFF"/>
                <rect x="10" y="80" width="10" height="10" fill="#FFFFFF"/>
                <rect x="40" y="10" width="20" height="10"/>
                <rect x="10" y="40" width="10" height="20"/>
                <rect x="40" y="40" width="20" height="20"/>
                <rect x="70" y="40" width="20" height="10"/>
                <rect x="40" y="70" width="10" height="20"/>
                <rect x="60" y="70" width="30" height="20"/>
              </svg>
            </div>
            <div class="digital-pass-barcode-wrap">
              <div class="digital-pass-code">${escapeHtml(state.passId)}</div>
              <svg class="digital-pass-barcode" width="140" height="26" viewBox="0 0 140 26" fill="currentColor">
                <rect x="2" y="0" width="3" height="26"/>
                <rect x="8" y="0" width="2" height="26"/>
                <rect x="14" y="0" width="4" height="26"/>
                <rect x="22" y="0" width="1" height="26"/>
                <rect x="26" y="0" width="5" height="26"/>
                <rect x="35" y="0" width="2" height="26"/>
                <rect x="41" y="0" width="4" height="26"/>
                <rect x="49" y="0" width="2" height="26"/>
                <rect x="55" y="0" width="6" height="26"/>
                <rect x="65" y="0" width="1" height="26"/>
                <rect x="70" y="0" width="3" height="26"/>
                <rect x="76" y="0" width="5" height="26"/>
                <rect x="85" y="0" width="2" height="26"/>
                <rect x="91" y="0" width="4" height="26"/>
                <rect x="99" y="0" width="1" height="26"/>
                <rect x="104" y="0" width="5" height="26"/>
                <rect x="113" y="0" width="3" height="26"/>
                <rect x="120" y="0" width="2" height="26"/>
                <rect x="126" y="0" width="5" height="26"/>
                <rect x="135" y="0" width="3" height="26"/>
              </svg>
              <span class="digital-pass-verified">Decentralized Pass Verified</span>
            </div>
          </div>
        </div>
      `;
    }

    function updateStepperUI() {
      progressItems.forEach(item => {
        const itemStep = parseInt(item.getAttribute('data-progress-item'), 10);
        item.classList.toggle('active', itemStep === state.step);
        item.classList.toggle('completed', itemStep < state.step);
      });

      progressBtns.forEach(btn => {
        const btnStep = parseInt(btn.getAttribute('data-progress-btn'), 10);
        if (btnStep === state.step) {
          btn.setAttribute('aria-current', 'step');
          btn.disabled = false;
        } else if (btnStep < state.step) {
          btn.removeAttribute('aria-current');
          btn.disabled = false;
        } else {
          btn.removeAttribute('aria-current');
          btn.disabled = true;
        }
      });

      const stepTitles = ['', 'Your Goal', 'Your Interests', 'Your Details', 'Event Plan', 'Your Pass'];
      if (mobileLabel) {
        mobileLabel.textContent = `Step ${state.step} of 5 — ${stepTitles[state.step] || ''}`;
      }
      if (mobileFill) {
        mobileFill.style.width = `${(state.step / 5) * 100}%`;
      }

      if (announcer) {
        announcer.textContent = `Now on step ${state.step} of 5: ${stepTitles[state.step] || ''}`;
      }

      // Show/Hide Panels
      panels.forEach(panel => {
        const pStep = parseInt(panel.getAttribute('data-step-panel'), 10);
        panel.hidden = pStep !== state.step;
      });

      // Update Nav Buttons
      if (backBtn) {
        backBtn.hidden = state.step <= 1 || state.step === 5;
      }
      if (continueBtn) {
        continueBtn.hidden = state.step === 5;
        continueBtn.textContent = state.step === 4 ? 'Generate My Pass' : 'Continue';
      }

      // Focus panel heading for a11y
      const activePanel = root.querySelector(`[data-step-panel="${state.step}"]`);
      if (activePanel) {
        const heading = activePanel.querySelector('.reg-step-title');
        if (heading) heading.focus();
      }

      // Special handling for Step 5
      if (state.step === 5) {
        renderDigitalPass();
      }
    }

    function showError(id, message) {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = message;
        el.hidden = false;
      }
    }

    function clearError(id) {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
        el.hidden = true;
      }
    }

    function validateCurrentStep() {
      if (state.step === 1) {
        if (!state.goal) {
          showError('goal-error', 'Please choose what brings you to Web3 Carnival to continue.');
          return false;
        }
        clearError('goal-error');
      } else if (state.step === 2) {
        if (!state.tracks.length) {
          showError('interests-error', 'Please select at least one thematic track to tailor your pass.');
          return false;
        }
        clearError('interests-error');
      } else if (state.step === 3) {
        let valid = true;
        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const roleSelect = document.getElementById('reg-role');
        const orgInput = document.getElementById('reg-org');

        if (!nameInput.value.trim()) {
          showError('reg-name-error', 'Please enter your full name.');
          valid = false;
        } else {
          clearError('reg-name-error');
          state.name = nameInput.value.trim();
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          showError('reg-email-error', 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError('reg-email-error');
          state.email = emailInput.value.trim();
        }

        if (!roleSelect.value) {
          showError('reg-role-error', 'Please select your role in the Web3 space.');
          valid = false;
        } else {
          clearError('reg-role-error');
          state.role = roleSelect.options[roleSelect.selectedIndex].text;
        }

        state.organization = orgInput ? orgInput.value.trim() : '';

        return valid;
      }

      return true;
    }

    // Event Listeners
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
          state.step = Math.min(5, state.step + 1);
          updateStepperUI();
          window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' });
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.step > 1) {
          state.step--;
          updateStepperUI();
          window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' });
        }
      });
    }

    // Direct Progress Click
    progressBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.getAttribute('data-progress-btn'), 10);
        if (targetStep < state.step) {
          state.step = targetStep;
          updateStepperUI();
          window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' });
        }
      });
    });

    if (passDownloadBtn) {
      passDownloadBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (passRestartBtn) {
      passRestartBtn.addEventListener('click', () => {
        state.step = 1;
        state.goal = '';
        state.tracks = [];
        state.name = '';
        state.email = '';
        state.role = '';
        state.organization = '';
        try {
          const current = window.Web3Carnival && window.Web3Carnival.getState ? window.Web3Carnival.getState() : null;
          if (current && window.Web3CarnivalCore) {
            current.profile = {
              name: '',
              email: '',
              role: '',
              organization: '',
              goal: '',
              passId: ''
            };
            localStorage.setItem(window.Web3CarnivalCore.STORAGE_KEY, JSON.stringify(current));
          }
        } catch (error) {
          // Keep restart functional when storage is restricted.
        }
        renderGoals();
        renderTracks();
        if (form) form.reset();
        updateStepperUI();
        window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' });
      });
    }

    // URL Query Parameter Pre-selection (e.g., ?type=speaker, ?goal=sponsor, ?track=infra)
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type') || urlParams.get('goal');
    if (typeParam) {
      const match = allGoals.find(g => g.id.toLowerCase() === typeParam.toLowerCase());
      if (match) state.goal = match.id;
    } else {
      state.goal = 'attendee';
    }

    const trackParam = urlParams.get('track');
    if (trackParam && tracks.some(t => t.id === trackParam)) {
      state.tracks = [trackParam];
    }

    renderGoals();
    renderTracks();
    renderPlan();
    updateStepperUI();
  });
})();
