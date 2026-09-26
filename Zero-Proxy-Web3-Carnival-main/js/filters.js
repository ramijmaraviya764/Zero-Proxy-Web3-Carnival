/**
 * Web3 Carnival Design System - Event Page (Phase 2)
 * Smart Event Discovery: filters, session cards, accessible detail modal,
 * and localStorage-backed "My Journey".
 *
 * Scoped entirely to event.html — every entry point below bails out
 * immediately if the page's discovery markup isn't present.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'w3c_my_journey';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-discovery-root]');
    if (!root) return; // Not on event.html

    const data = (typeof WEB3_CARNIVAL_DATA !== 'undefined') ? WEB3_CARNIVAL_DATA : null;
    if (!data || !Array.isArray(data.sessions)) return;

    const sessions = data.sessions;
    const tracks = data.tracks || [];
    const days = data.eventDays || [];
    const interests = data.sessionInterests || [];
    const levels = data.experienceLevels || [];

    const trackById = Object.fromEntries(tracks.map(t => [t.id, t]));
    const dayById = Object.fromEntries(days.map(d => [d.id, d]));
    const interestById = Object.fromEntries(interests.map(i => [i.id, i]));
    const levelById = Object.fromEntries(levels.map(l => [l.id, l]));

    const filterState = { track: 'all', day: 'all', interest: 'all', level: 'all' };
    let showAllSessions = false;
    const INITIAL_SESSION_LIMIT = 6;

    const grid = root.querySelector('[data-sessions-grid]');
    const resultsCount = root.querySelector('[data-results-count]');
    const emptyState = root.querySelector('[data-empty-state]');
    const resetBtn = root.querySelector('[data-discovery-reset]');

    // ----------------------------------------------------------------------
    // Build filter bars from structured data (single source of truth)
    // ----------------------------------------------------------------------
    function buildFilterBar(groupKey, groupLabel, options, getLabel) {
      const container = root.querySelector(`[data-filter-group="${groupKey}"]`);
      if (!container) return;

      const allBtn = makeFilterBtn(groupKey, 'all', 'All', true);
      container.appendChild(allBtn);

      options.forEach(opt => {
        container.appendChild(makeFilterBtn(groupKey, opt.id, getLabel(opt), false));
      });

      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', `Filter sessions by ${groupLabel}`);
    }

    function makeFilterBtn(groupKey, value, label, isActive) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (isActive ? ' active' : '');
      btn.setAttribute('data-filter-value', value);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        filterState[groupKey] = value;
        const siblings = btn.parentElement.querySelectorAll('.filter-btn');
        siblings.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        renderSessions();
      });
      return btn;
    }

    buildFilterBar('track', 'track', tracks, t => t.name);
    buildFilterBar('day', 'day', days, d => `${d.label} · ${d.dateLabel}`);
    buildFilterBar('interest', 'interest', interests, i => i.label);
    buildFilterBar('level', 'experience level', levels, l => l.label);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.keys(filterState).forEach(k => (filterState[k] = 'all'));
        showAllSessions = false;
        root.querySelectorAll('.filter-bar').forEach(bar => {
          const buttons = bar.querySelectorAll('.filter-btn');
          buttons.forEach((b, idx) => {
            b.classList.toggle('active', idx === 0);
            b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
          });
        });
        renderSessions();
      });
    }

    // ----------------------------------------------------------------------
    // My Journey (localStorage)
    // ----------------------------------------------------------------------
    function getJourney() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveJourney(ids) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      } catch (e) {
        // localStorage disabled/restricted — journey just won't persist
      }
    }

    function isInJourney(id) {
      return getJourney().includes(id);
    }

    function toggleJourney(id) {
      const current = getJourney();
      const idx = current.indexOf(id);
      if (idx === -1) {
        current.push(id);
      } else {
        current.splice(idx, 1);
      }
      saveJourney(current);
      syncJourneyUI();
    }

    function removeFromJourney(id) {
      saveJourney(getJourney().filter(s => s !== id));
      syncJourneyUI();
    }

    function syncJourneyUI() {
      const ids = getJourney();

      // Sync every "Add to Journey" affordance on the page (cards + modal)
      document.querySelectorAll('[data-journey-toggle]').forEach(btn => {
        const id = btn.getAttribute('data-journey-toggle');
        const added = ids.includes(id);
        const session = sessions.find(s => s.id === id);
        btn.classList.toggle('added', added);
        btn.setAttribute('aria-pressed', added ? 'true' : 'false');
        btn.textContent = added ? '✓ In Journey' : '+ Add to Journey';
        if (session) {
          btn.setAttribute('aria-label', `${added ? 'Remove' : 'Add'} ${session.title} ${added ? 'from' : 'to'} My Journey`);
        }
      });

      renderJourneyPanel(ids);
      renderRegisterNote(ids);
    }

    function renderJourneyPanel(ids) {
      const countEl = document.querySelector('[data-journey-count]');
      const listEl = document.querySelector('[data-journey-list]');
      const emptyEl = document.querySelector('[data-journey-empty]');
      if (!listEl) return;

      if (countEl) countEl.textContent = String(ids.length);

      listEl.innerHTML = '';

      if (!ids.length) {
        if (emptyEl) emptyEl.style.display = 'block';
        listEl.style.display = 'none';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      listEl.style.display = 'flex';

      ids.forEach(id => {
        const session = sessions.find(s => s.id === id);
        if (!session) return;

        const day = dayById[session.dayId];
        const row = document.createElement('li');
        row.className = 'journey-item';
        row.innerHTML = `
          <div class="journey-item-info">
            <div class="journey-item-title">${escapeHtml(session.title)}</div>
            <div class="journey-item-meta">${day ? escapeHtml(day.label) : ''} · ${escapeHtml(session.time)}</div>
          </div>
          <button type="button" class="journey-remove-btn" data-remove-id="${session.id}" aria-label="Remove ${escapeHtml(session.title)} from My Journey">✕</button>
        `;
        listEl.appendChild(row);
      });

      listEl.querySelectorAll('[data-remove-id]').forEach(btn => {
        btn.addEventListener('click', () => removeFromJourney(btn.getAttribute('data-remove-id')));
      });
    }

    function renderRegisterNote(ids) {
      const note = document.querySelector('[data-register-note]');
      if (!note) return;
      note.innerHTML = ids.length
        ? `You've added <strong>${ids.length}</strong> session${ids.length === 1 ? '' : 's'} to your journey — carry it into registration.`
        : `Add sessions to your journey above, then bring them into registration.`;
    }

    // ----------------------------------------------------------------------
    // Session cards
    // ----------------------------------------------------------------------
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function getFilteredSessions() {
      return sessions.filter(s => {
        if (filterState.track !== 'all' && s.trackId !== filterState.track) return false;
        if (filterState.day !== 'all' && s.dayId !== filterState.day) return false;
        if (filterState.interest !== 'all' && s.interest !== filterState.interest) return false;
        if (filterState.level !== 'all' && s.level !== filterState.level) return false;
        return true;
      });
    }

    function renderSessions() {
      const filtered = getFilteredSessions();

      const visibleSessions = showAllSessions ? filtered : filtered.slice(0, INITIAL_SESSION_LIMIT);

      if (resultsCount) {
        const visibleCount = visibleSessions.length;
        resultsCount.innerHTML = `<strong>${visibleCount}</strong> of ${sessions.length} sessions`;
      }

      grid.innerHTML = '';

      if (!filtered.length) {
        if (emptyState) emptyState.hidden = false;
        grid.hidden = true;
        return;
      }

      if (emptyState) emptyState.hidden = true;
      grid.hidden = false;

      const journeyIds = getJourney();

      visibleSessions.forEach(session => {
        const track = trackById[session.trackId];
        const day = dayById[session.dayId];
        const level = levelById[session.level];
        const added = journeyIds.includes(session.id);

        const card = document.createElement('article');
        card.className = 'card card-session';
        card.setAttribute('data-session-id', session.id);
        card.innerHTML = `
          <div class="card-session-pills">
            ${track ? `<span class="pill pill-accent">${escapeHtml(track.icon)} ${escapeHtml(track.name)}</span>` : ''}
            ${level ? `<span class="pill">${escapeHtml(level.label)}</span>` : ''}
          </div>
          <h3 class="card-session-title">${escapeHtml(session.title)}</h3>
          <p class="card-session-speaker"><strong>${escapeHtml(session.speaker)}</strong> — ${escapeHtml(session.speakerRole)}</p>
          <div class="card-session-meta">
            <span>${day ? escapeHtml(day.label + ' · ' + day.dateLabel) : ''}</span>
            <span>${escapeHtml(session.time)}</span>
          </div>
          <p class="card-session-desc">${escapeHtml(session.description)}</p>
          <div class="card-session-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-open-session="${session.id}" aria-label="View details for ${escapeHtml(session.title)}">View Details</button>
            <button type="button" class="session-add-btn${added ? ' added' : ''}" data-journey-toggle="${session.id}" aria-pressed="${added ? 'true' : 'false'}" aria-label="${added ? 'Remove' : 'Add'} ${escapeHtml(session.title)} ${added ? 'from' : 'to'} My Journey">${added ? '✓ In Journey' : '+ Add to Journey'}</button>
          </div>
        `;
        grid.appendChild(card);
      });

      // Wire up this render's buttons
      grid.querySelectorAll('[data-open-session]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-session'), btn));
      });
      grid.querySelectorAll('[data-journey-toggle]').forEach(btn => {
        btn.addEventListener('click', () => toggleJourney(btn.getAttribute('data-journey-toggle')));
      });

      // Show only the first 6 sessions initially.
      // The remaining sessions are revealed by the More View button.
      const existingMoreButton = root.querySelector('[data-more-sessions]');
      if (existingMoreButton) existingMoreButton.remove();

      if (filtered.length > INITIAL_SESSION_LIMIT && !showAllSessions) {
        const moreButton = document.createElement('button');
        moreButton.type = 'button';
        moreButton.className = 'btn btn-secondary';
        moreButton.setAttribute('data-more-sessions', 'true');
        moreButton.textContent = 'More View';
        moreButton.style.display = 'block';
        moreButton.style.margin = 'var(--space-6) auto 0';
        moreButton.addEventListener('click', () => {
          showAllSessions = true;
          renderSessions();
        });
        grid.insertAdjacentElement('afterend', moreButton);
      }
    }

    // ----------------------------------------------------------------------
    // Accessible Session Detail Modal
    // ----------------------------------------------------------------------
    const modalOverlay = document.querySelector('[data-session-modal]');
    const modalDialog = modalOverlay ? modalOverlay.querySelector('.modal-dialog') : null;
    let lastFocusedEl = null;

    function getFocusableEls(container) {
      return Array.from(
        container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => el.offsetParent !== null);
    }

    function renderModalContent(session) {
      const track = trackById[session.trackId];
      const day = dayById[session.dayId];
      const level = levelById[session.level];
      const added = isInJourney(session.id);

      const related = sessions
        .filter(s => s.trackId === session.trackId && s.id !== session.id)
        .slice(0, 3);

      modalDialog.innerHTML = `
        <button type="button" class="modal-close-btn" data-modal-close aria-label="Close session details">✕</button>
        <div class="modal-pills">
          ${track ? `<span class="pill pill-accent">${escapeHtml(track.icon)} ${escapeHtml(track.name)}</span>` : ''}
          ${level ? `<span class="pill">${escapeHtml(level.label)}</span>` : ''}
          ${day ? `<span class="pill pill-cyan">${escapeHtml(day.label)} · ${escapeHtml(session.time)}</span>` : ''}
        </div>
        <h2 class="modal-title" id="session-modal-title">${escapeHtml(session.title)}</h2>
        <p class="modal-speaker"><strong>${escapeHtml(session.speaker)}</strong> — ${escapeHtml(session.speakerRole)}</p>
        <p class="modal-desc" id="session-modal-desc">${escapeHtml(session.description)}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-primary session-add-btn${added ? ' added' : ''}" data-journey-toggle="${session.id}" aria-pressed="${added ? 'true' : 'false'}" aria-label="${added ? 'Remove' : 'Add'} ${escapeHtml(session.title)} ${added ? 'from' : 'to'} My Journey" style="border-radius: var(--radius-sm);">${added ? '✓ In Journey' : '+ Add to My Journey'}</button>
        </div>
        ${related.length ? `
          <div class="modal-related-title">Related Sessions</div>
          <div class="modal-related-list">
            ${related.map(r => `
              <button type="button" class="modal-related-item" data-open-related="${r.id}">
                <div class="modal-related-item-title">${escapeHtml(r.title)}</div>
                <div class="modal-related-item-meta">${escapeHtml(r.speaker)} · ${dayById[r.dayId] ? escapeHtml(dayById[r.dayId].label) : ''} · ${escapeHtml(r.time)}</div>
              </button>
            `).join('')}
          </div>
        ` : ''}
      `;

      modalDialog.querySelector('[data-modal-close]').addEventListener('click', closeModal);
      modalDialog.querySelector('[data-journey-toggle]').addEventListener('click', (e) => {
        toggleJourney(session.id);
        renderModalContent(session); // refresh add-button state in place
        e.currentTarget.focus();
      });
      modalDialog.querySelectorAll('[data-open-related]').forEach(btn => {
        btn.addEventListener('click', () => {
          const nextSession = sessions.find(s => s.id === btn.getAttribute('data-open-related'));
          if (nextSession) {
            renderModalContent(nextSession);
            modalDialog.focus();
          }
        });
      });
    }

    function openModal(sessionId, triggerEl) {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || !modalOverlay) return;

      lastFocusedEl = triggerEl || document.activeElement;
      renderModalContent(session);

      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      modalDialog.setAttribute('tabindex', '-1');
      modalDialog.focus();

      document.addEventListener('keydown', onModalKeydown);
    }

    function closeModal() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onModalKeydown);

      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }

    function onModalKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusableEls(modalDialog);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // ----------------------------------------------------------------------
    // Experience Timeline (§3) — data-driven, editorial markup
    // ----------------------------------------------------------------------
    function renderTimeline() {
      const container = document.querySelector('[data-timeline]');
      if (!container || !Array.isArray(data.eventTimeline)) return;

      container.innerHTML = data.eventTimeline.map(stage => `
        <div class="timeline-stage">
          <div class="timeline-stage-marker" aria-hidden="true">${escapeHtml(stage.icon)}</div>
          <div class="timeline-stage-body">
            <div class="timeline-stage-kicker">${escapeHtml(stage.kicker)}</div>
            <h3 class="timeline-stage-name">${escapeHtml(stage.name)}</h3>
            <p class="timeline-stage-desc">${escapeHtml(stage.description)}</p>
          </div>
        </div>
      `).join('');
    }

    // ----------------------------------------------------------------------
    // Venue / Logistics (§8) — data-driven
    // ----------------------------------------------------------------------
    function renderVenue() {
      const nameEl = document.querySelector('[data-venue-name]');
      const cityEl = document.querySelector('[data-venue-city]');
      const addressEl = document.querySelector('[data-venue-address]');
      const hoursEl = document.querySelector('[data-venue-hours]');
      const logisticsEl = document.querySelector('[data-venue-logistics]');
      const venue = data.venue;
      if (!venue || !logisticsEl) return;

      if (nameEl) nameEl.textContent = venue.name;
      if (cityEl) cityEl.textContent = venue.city;
      if (addressEl) addressEl.textContent = venue.address;
      if (hoursEl) hoursEl.textContent = venue.hours;

      logisticsEl.innerHTML = venue.logistics.map(item => `
        <div class="event-fact-row">
          <div class="event-fact-icon" aria-hidden="true">✓</div>
          <div>
            <div class="event-fact-label">${escapeHtml(item.label)}</div>
            <div class="event-fact-value">${escapeHtml(item.value)}</div>
          </div>
        </div>
      `).join('');
    }

    // ----------------------------------------------------------------------
    // Init
    // ----------------------------------------------------------------------
    renderTimeline();
    renderVenue();
    renderSessions();
    syncJourneyUI();
  });
})();
