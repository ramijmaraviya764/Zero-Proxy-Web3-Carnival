/**
 * Web3 Carnival — My Carnival Experience
 * Persistent planner shell, dashboard renderer, recommendations, conflict detection,
 * event-day mode, calendar exports, and cross-page save controls.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof WEB3_CARNIVAL_DATA === 'undefined' || !window.Web3CarnivalCore) return;

    const data = WEB3_CARNIVAL_DATA;
    const core = window.Web3CarnivalCore;
    const storage = getStorage();
    let state = core.loadState(storage, data);

    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const speakers = Array.isArray(data.speakers) ? data.speakers : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const speakerById = Object.fromEntries(speakers.map(item => [item.id, item]));
    const trackById = Object.fromEntries(tracks.map(item => [item.id, item]));
    const sessionById = Object.fromEntries(sessions.map(item => [item.id, item]));
    const dayById = Object.fromEntries((data.eventDays || []).map(item => [item.id, item]));

    /**
     * Return browser storage without throwing in privacy-restricted contexts.
     * @returns {Storage|null} Available local storage or null.
     */
    function getStorage() {
      try {
        const candidate = window.localStorage;
        const key = '__w3c_storage_probe__';
        candidate.setItem(key, '1');
        candidate.removeItem(key);
        return candidate;
      } catch (error) {
        return null;
      }
    }

    /**
     * Escape HTML text.
     * @param {unknown} value Value to encode.
     * @returns {string} Encoded HTML.
     */
    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char]));
    }

    /**
     * Persist the current state and synchronize the legacy session list.
     * @returns {void}
     */
    function persistState() {
      core.saveState(storage, state);
      window.dispatchEvent(new CustomEvent('w3c:carnival-change', { detail: cloneState() }));
      updateNavBadge();
      syncSaveButtons();
      renderDrawer();
      renderDashboard();
    }

    /**
     * Clone the planner state before exposing it through events.
     * @returns {object} State snapshot.
     */
    function cloneState() {
      return {
        sessions: [...state.sessions],
        speakers: [...state.speakers],
        tracks: [...state.tracks],
        profile: { ...state.profile }
      };
    }

    /**
     * Synchronize old event-page journey changes into canonical planner state.
     * @param {string[]} ids Legacy journey IDs.
     * @returns {void}
     */
    function syncLegacySessions(ids) {
      const valid = new Set(sessions.map(session => session.id));
      state.sessions = core.normalizeIds(ids, valid);
      persistState();
    }

    /**
     * Toggle one planner item.
     * @param {'sessions'|'speakers'|'tracks'} type Collection name.
     * @param {string} id Item ID.
     * @returns {void}
     */
    function toggleSaved(type, id) {
      const maps = {
        sessions: new Set(sessions.map(item => item.id)),
        speakers: new Set(speakers.map(item => item.id)),
        tracks: new Set(tracks.map(item => item.id))
      };
      if (!maps[type] || !maps[type].has(id)) return;

      state[type] = core.toggleId(state[type], id);
      persistState();
    }

    /**
     * Format a saved count label.
     * @param {number} value Count.
     * @param {string} noun Noun.
     * @returns {string} Human-readable count.
     */
    function countLabel(value, noun) {
      return `${value} ${noun}${value === 1 ? '' : 's'}`;
    }

    /**
     * Get sorted saved sessions.
     * @returns {object[]} Saved session records.
     */
    function getSavedSessions() {
      return state.sessions
        .map(id => sessionById[id])
        .filter(Boolean)
        .sort((a, b) => {
          const day = String(a.dayId).localeCompare(String(b.dayId));
          if (day) return day;
          const aRange = core.parseTimeRange(a.time);
          const bRange = core.parseTimeRange(b.time);
          return (aRange ? aRange.start : 0) - (bRange ? bRange.start : 0);
        });
    }

    /**
     * Return saved items that make useful recommendation context.
     * @returns {object[]} Recommended session records.
     */
    function getRecommendations() {
      const ranked = core.rankSessions(sessions, state, {});
      return ranked.filter(session => !state.sessions.includes(session.id)).slice(0, 3);
    }

    /**
     * Determine which event experience mode is currently active.
     * @returns {{mode:'planning'|'event-day'|'post-event',label:string}}
     */
    function getEventMode() {
      const now = new Date();
      const start = new Date(2026, 10, 14, 0, 0, 0);
      const end = new Date(2026, 10, 16, 23, 59, 59);
      if (now >= start && now <= end) return { mode: 'event-day', label: 'Carnival Mode' };
      if (now > end) return { mode: 'post-event', label: 'Carnival Archive' };
      return { mode: 'planning', label: 'Plan Your Carnival' };
    }

    /**
     * Find the next saved session relative to today when possible.
     * @returns {object|null} Next saved session.
     */
    function getNextSession() {
      const mode = getEventMode();
      const saved = getSavedSessions();
      if (!saved.length) return null;
      if (mode.mode !== 'event-day') return saved[0];

      const now = new Date();
      const dayDates = { day1: 14, day2: 15, day3: 16 };
      return saved.find(session => {
        const day = new Date(2026, 10, dayDates[session.dayId], 0, 0, 0);
        const range = core.parseTimeRange(session.time);
        if (!range) return false;
        day.setHours(Math.floor(range.start / 60), range.start % 60, 0, 0);
        return day >= now;
      }) || saved[0];
    }

    /**
     * Build a session card used by the dashboard and drawer.
     * @param {object} session Session record.
     * @param {{compact?:boolean}} options Rendering options.
     * @returns {string} HTML.
     */
    function renderSessionCard(session, options = {}) {
      const compact = Boolean(options.compact);
      const track = trackById[session.trackId];
      const day = dayById[session.dayId];
      const saved = state.sessions.includes(session.id);
      return `
        <article class="mc-session-card${compact ? ' mc-session-card--compact' : ''}" data-session-id="${escapeHtml(session.id)}">
          <div class="mc-session-top">
            <span class="mc-meta-tag">${escapeHtml(day ? `${day.label} · ${day.dateLabel}` : session.dayId)}</span>
            <span class="mc-session-time">${escapeHtml(session.time)}</span>
          </div>
          <div class="mc-session-body">
            <p class="mc-session-track">${track ? escapeHtml(track.name) : 'Web3 Carnival'}</p>
            <h3>${escapeHtml(session.title)}</h3>
            ${compact ? '' : `<p class="mc-session-desc">${escapeHtml(session.description)}</p>`}
            <p class="mc-session-speaker">${escapeHtml(session.speaker)} · ${escapeHtml(session.speakerRole)}</p>
          </div>
          <div class="mc-session-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-carnival-save-session="${escapeHtml(session.id)}" aria-pressed="${saved ? 'true' : 'false'}">${saved ? '✓ Saved' : 'Save Session'}</button>
            <button type="button" class="btn btn-ghost btn-sm" data-carnival-calendar-session="${escapeHtml(session.id)}">Add to Calendar</button>
          </div>
        </article>
      `;
    }

    /**
     * Render the persistent side drawer.
     * @returns {void}
     */
    function renderDrawer() {
      const drawer = document.querySelector('[data-carnival-drawer]');
      if (!drawer) return;

      const savedSessions = getSavedSessions();
      const next = getNextSession();
      const conflicts = core.findConflicts(sessions, state.sessions);

      drawer.innerHTML = `
        <div class="mc-drawer-head">
          <div>
            <span class="section-kicker">Personal planner</span>
            <h2>My Carnival</h2>
          </div>
          <button type="button" class="mc-icon-btn" data-carnival-close aria-label="Close My Carnival">✕</button>
        </div>

        <div class="mc-drawer-stats">
          <div><strong>${state.sessions.length}</strong><span>Sessions</span></div>
          <div><strong>${state.speakers.length}</strong><span>Speakers</span></div>
          <div><strong>${state.tracks.length}</strong><span>Tracks</span></div>
        </div>

        ${conflicts.length ? `
          <div class="mc-drawer-alert">
            <strong>${conflicts.length} schedule conflict${conflicts.length === 1 ? '' : 's'}</strong>
            <span>Open the planner to resolve overlapping sessions.</span>
          </div>
        ` : ''}

        ${next ? `
          <div class="mc-drawer-next">
            <span class="mc-drawer-label">${getEventMode().mode === 'event-day' ? 'Now / Next' : 'Your next saved session'}</span>
            <strong>${escapeHtml(next.title)}</strong>
            <span>${escapeHtml(next.time)} · ${escapeHtml(next.speaker)}</span>
          </div>
        ` : `
          <div class="mc-drawer-empty">
            <span class="mc-drawer-empty-mark">01</span>
            <div>
              <strong>Start building your Carnival.</strong>
              <p>Save sessions, speakers and tracks from anywhere on the site.</p>
            </div>
          </div>
        `}

        ${savedSessions.slice(0, 3).map(session => renderSessionCard(session, { compact: true })).join('')}

        <div class="mc-drawer-footer">
          <a href="my-carnival.html" class="btn btn-primary btn-full">Open Full Planner</a>
        </div>
      `;
    }

    /**
     * Update the navigation badge with current planner count.
     * @returns {void}
     */
    function updateNavBadge() {
      document.querySelectorAll('[data-carnival-count]').forEach(badge => {
        const value = state.sessions.length + state.speakers.length + state.tracks.length;
        badge.textContent = value > 99 ? '99+' : String(value);
        badge.hidden = value === 0;
      });
    }

    /**
     * Synchronize save buttons with the canonical state.
     * @returns {void}
     */
    function syncSaveButtons() {
      document.querySelectorAll('[data-carnival-save-session]').forEach(button => {
        const id = button.getAttribute('data-carnival-save-session');
        const saved = state.sessions.includes(id);
        const label = saved ? '✓ Saved' : 'Save Session';
        if (button.textContent !== label) button.textContent = label;
        button.classList.toggle('is-saved', saved);
        button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      });

      document.querySelectorAll('[data-carnival-save-speaker]').forEach(button => {
        const id = button.getAttribute('data-carnival-save-speaker');
        const saved = state.speakers.includes(id);
        const label = saved ? '✓ Followed' : 'Follow Speaker';
        if (button.textContent !== label) button.textContent = label;
        button.classList.toggle('is-saved', saved);
        button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      });

      document.querySelectorAll('[data-carnival-save-track]').forEach(button => {
        const id = button.getAttribute('data-carnival-save-track');
        const saved = state.tracks.includes(id);
        const label = saved ? '✓ Following' : 'Follow Track';
        if (button.textContent !== label) button.textContent = label;
        button.classList.toggle('is-saved', saved);
        button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      });
    }

    /**
     * Render a builder recommendation set.
     * @param {HTMLElement} container Output container.
     * @returns {void}
     */
    function renderBuilderResults(container) {
      const root = container.closest('[data-builder]');
      if (!root) return;

      const priority = root.querySelector('[data-builder-priority].is-selected')?.dataset.value || 'learn';
      const level = root.querySelector('[data-builder-level].is-selected')?.dataset.value || 'all';
      const trackIds = Array.from(root.querySelectorAll('[data-builder-track].is-selected')).map(item => item.dataset.value);

      const recommendations = core.buildSchedule(sessions, state, { priority, level, trackIds });
      container.innerHTML = recommendations.length
        ? recommendations.map(session => renderSessionCard(session)).join('')
        : `<div class="mc-empty-block"><strong>No schedule found.</strong><span>Try a broader experience level or add another track.</span></div>`;

      syncSaveButtons();
    }

    /**
     * Render the dashboard page.
     * @returns {void}
     */
    function renderDashboard() {
      const root = document.querySelector('[data-my-carnival-page]');
      if (!root) return;

      const mode = getEventMode();
      const savedSessions = getSavedSessions();
      const savedSpeakers = state.speakers.map(id => speakerById[id]).filter(Boolean);
      const savedTracks = state.tracks.map(id => trackById[id]).filter(Boolean);
      const recommendations = getRecommendations();
      const conflicts = core.findConflicts(sessions, state.sessions);
      const next = getNextSession();

      const profileName = state.profile.name ? state.profile.name.split(' ')[0] : '';
      const greeting = profileName ? `Good to see you, ${escapeHtml(profileName)}.` : 'Build your own path through Web3 Carnival.';

      const agenda = savedSessions.length ? savedSessions.map(session => {
        const day = dayById[session.dayId];
        const track = trackById[session.trackId];
        return `
          <div class="mc-agenda-row${conflicts.some(group => group.sessions.some(item => item.id === session.id)) ? ' has-conflict' : ''}">
            <div class="mc-agenda-time">${escapeHtml(session.time)}</div>
            <div class="mc-agenda-main">
              <strong>${escapeHtml(session.title)}</strong>
              <span>${escapeHtml(day ? `${day.label} · ${day.dateLabel}` : session.dayId)} · ${escapeHtml(track ? track.name : '')}</span>
            </div>
            <button type="button" class="mc-remove-mini" data-carnival-remove-session="${escapeHtml(session.id)}" aria-label="Remove ${escapeHtml(session.title)}">Remove</button>
          </div>
        `;
      }).join('') : `
        <div class="mc-empty-block">
          <strong>Your agenda is empty.</strong>
          <span>Start from Event Discovery or use Build My Schedule below.</span>
          <a class="text-link" href="event.html#discovery">Browse sessions →</a>
        </div>
      `;

      root.innerHTML = `
        <section class="mc-hero">
          <div class="container">
            <div class="mc-hero-topline">
              <div class="mc-hero-kicker">
                <span class="section-kicker">${escapeHtml(mode.label)}</span>
                <span class="mc-kicker-divider"></span>
                <span>November 14–16, 2026 · Singapore · Hybrid + Virtual</span>
              </div>
            </div>
            <div class="mc-hero-layout">
              <div class="mc-hero-copy">
                <h1>My Carnival<span class="mc-title-mark">.</span></h1>
                <p class="mc-hero-lead">${greeting}</p>
              </div>
              <div class="mc-hero-summary" aria-label="Carnival planner summary">
                <div class="mc-summary-total">
                  <span>WC26</span>
                  <strong>${savedSessions.length + savedSpeakers.length + savedTracks.length}</strong>
                  <small>saved items</small>
                </div>
                <div class="mc-summary-stats">
                  <div><strong>${savedSessions.length}</strong><span>Sessions</span></div>
                  <div><strong>${savedSpeakers.length}</strong><span>Speakers</span></div>
                  <div><strong>${savedTracks.length}</strong><span>Tracks</span></div>
                </div>
              </div>
            </div>
            ${mode.mode === 'event-day' ? `
              <div class="mc-event-live">
                <span class="mc-live-dot"></span>
                <strong>Carnival Mode is live.</strong>
                <span>Your agenda is now your event-day control room.</span>
              </div>
            ` : ''}
          </div>
        </section>

        <section class="section mc-overview-section">
          <div class="container">
            <div class="mc-overview-grid">
              ${next ? `
                <article class="mc-next-panel">
                  <div class="mc-next-main">
                    <div class="mc-next-label-row">
                      <span class="section-kicker">${mode.mode === 'event-day' ? 'Now / next' : 'Next on your plan'}</span>
                      <span class="mc-next-index">01</span>
                    </div>
                    <div class="mc-next-time">${escapeHtml(next.time)}</div>
                    <h2>${escapeHtml(next.title)}</h2>
                    <p>${escapeHtml(next.speaker)} · ${escapeHtml(next.speakerRole)}</p>
                  </div>
                  <div class="mc-next-actions">
                    <a class="btn btn-primary" href="event.html?session=${encodeURIComponent(next.id)}#discovery">View Session</a>
                    <button type="button" class="btn btn-secondary" data-carnival-calendar-session="${escapeHtml(next.id)}">Add to Calendar</button>
                  </div>
                </article>
              ` : `
                <article class="mc-next-panel mc-next-panel--empty">
                  <div class="mc-next-main">
                    <div class="mc-next-label-row">
                      <span class="section-kicker">Start here</span>
                    </div>
                    <h2>Build your Carnival around what matters to you.</h2>
                    <p>Save sessions, speakers or tracks and this page becomes your personal event control room.</p>
                  </div>
                  <div class="mc-next-actions">
                    <a class="btn btn-primary" href="event.html#discovery">Browse Sessions</a>
                  </div>
                </article>
              `}

              <aside class="mc-overview-rail">
                <div class="mc-side-card mc-side-card--status">
                  <div class="mc-side-card-top">
                    <span>Schedule status</span>
                    ${conflicts.length ? `<span class="mc-status-badge mc-status-badge--warning">${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'}</span>` : '<span class="mc-status-badge">Clear</span>'}
                  </div>
                  <strong>${savedSessions.length ? `${savedSessions.length} session${savedSessions.length === 1 ? '' : 's'} planned` : 'No sessions planned'}</strong>
                  <p>${conflicts.length ? 'Resolve the overlap before you lock the day.' : savedSessions.length ? 'Your saved programme is ready to refine.' : 'Start with the programme and save what matters.'}</p>
                </div>
                <div class="mc-side-card">
                  <div class="mc-side-card-top">
                    <span>Your pass</span>
                    <span class="mc-side-code">${escapeHtml(state.profile.passId || 'PENDING')}</span>
                  </div>
                  <strong>${state.profile.passId ? 'Pass linked' : 'Registration not linked'}</strong>
                  <p>${state.profile.passId ? 'Your identity and itinerary are connected.' : 'Register once and your pass will appear here.'}</p>
                  <a class="text-link" href="${state.profile.passId ? 'register.html' : 'register.html'}">${state.profile.passId ? 'Open registration →' : 'Register now →'}</a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section class="section section-surface mc-agenda-section">
          <div class="container">
            <div class="mc-section-heading">
              <div>
                <span class="section-kicker">Agenda</span>
                <h2 class="section-title">Your itinerary</h2>
              </div>
              <div class="mc-section-heading-meta">
                <span>${countLabel(savedSessions.length, 'session')}</span>
                ${conflicts.length ? `<span class="mc-warning-chip">⚠ ${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'}</span>` : '<span class="mc-ok-chip">Schedule clear</span>'}
                ${savedSessions.length ? '<button type="button" class="btn btn-ghost btn-sm" data-carnival-full-calendar>Export .ics</button>' : ''}
              </div>
            </div>

            <div class="mc-agenda-layout">
              <div>
                <div class="mc-agenda">${agenda}</div>
                ${conflicts.length ? `
                  <div class="mc-conflict-panel">
                    <div class="mc-conflict-head">
                      <span class="section-kicker">Needs attention</span>
                      <h3>Overlapping sessions</h3>
                    </div>
                    ${conflicts.map(group => `
                      <div class="mc-conflict-row">
                        <strong>${escapeHtml(dayById[group.dayId]?.label || group.dayId)}</strong>
                        <span>${group.sessions.map(item => escapeHtml(item.title)).join(' · ')}</span>
                        <small>${group.minutes} min overlap</small>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <aside class="mc-agenda-side">
                <div class="mc-side-card mc-side-card--dark">
                  <span class="section-kicker">At a glance</span>
                  <div class="mc-agenda-stat"><strong>${savedSessions.length}</strong><span>saved sessions</span></div>
                  <div class="mc-agenda-stat"><strong>${new Set(savedSessions.map(item => item.dayId)).size}</strong><span>event days covered</span></div>
                  <div class="mc-agenda-stat"><strong>${conflicts.length}</strong><span>schedule conflicts</span></div>
                </div>
                <div class="mc-side-note">
                  <span class="mc-note-index">02</span>
                  <div>
                    <strong>Keep it usable.</strong>
                    <p>Three or four strong sessions per day usually beats a wall-to-wall schedule.</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section class="section mc-recommendation-section">
          <div class="container">
            <div class="mc-section-heading">
              <div>
                <span class="section-kicker">Personalized</span>
                <h2 class="section-title">Recommended for you</h2>
              </div>
              <a class="text-link" href="event.html#discovery">Open full programme →</a>
            </div>
            <div class="mc-session-grid">
              ${recommendations.length ? recommendations.map(session => renderSessionCard(session)).join('') : '<div class="mc-empty-block"><strong>Save a track or speaker to unlock stronger recommendations.</strong><span>We use your own saved context — no generic chatbot required.</span></div>'}
            </div>
          </div>
        </section>

        <section class="section section-surface mc-builder-section" data-builder>
          <div class="container">
            <div class="mc-builder-head">
              <div>
                <span class="section-kicker">Build My Schedule</span>
                <h2 class="section-title">Let the programme work around you.</h2>
              </div>
              <p class="mc-section-note">Choose what matters. The planner builds a conflict-free route from the existing programme.</p>
            </div>

            <div class="mc-builder-panel">
              <div class="mc-builder-control">
                <span class="mc-builder-label">Tracks</span>
                <div class="mc-choice-row">
                  ${tracks.map(track => `<button type="button" class="mc-choice" data-builder-track data-value="${escapeHtml(track.id)}">${escapeHtml(track.name)}</button>`).join('')}
                </div>
              </div>
              <div class="mc-builder-control">
                <span class="mc-builder-label">Experience</span>
                <div class="mc-choice-row">
                  <button type="button" class="mc-choice is-selected" data-builder-level data-value="all">Any</button>
                  ${(data.experienceLevels || []).map(level => `<button type="button" class="mc-choice" data-builder-level data-value="${escapeHtml(level.id)}">${escapeHtml(level.label)}</button>`).join('')}
                </div>
              </div>
              <div class="mc-builder-control">
                <span class="mc-builder-label">Priority</span>
                <div class="mc-choice-row">
                  ${[
                    ['learn', 'Learn'],
                    ['network', 'Network'],
                    ['invest', 'Invest'],
                    ['build', 'Build']
                  ].map(([value, label], index) => `<button type="button" class="mc-choice${index === 0 ? ' is-selected' : ''}" data-builder-priority data-value="${value}">${label}</button>`).join('')}
                </div>
              </div>
              <div class="mc-builder-actions">
                <button type="button" class="btn btn-primary" data-builder-generate>Generate My Schedule</button>
                <button type="button" class="btn btn-secondary" data-builder-save hidden>Save Generated Schedule</button>
              </div>
            </div>
            <div class="mc-builder-results" data-builder-results></div>
          </div>
        </section>

        <section class="section mc-bottom-section">
          <div class="container">
            <div class="mc-bottom-grid">
              <div class="mc-library-column">
                <div class="mc-library-block">
                  <div class="mc-library-header">
                    <div>
                      <span class="section-kicker">Saved people</span>
                      <h2>Speakers you're following</h2>
                    </div>
                    <span class="mc-library-count">${savedSpeakers.length}</span>
                  </div>
                  <div class="mc-library-list">
                    ${savedSpeakers.length ? savedSpeakers.map(speaker => `<div><strong>${escapeHtml(speaker.name)}</strong><span>${escapeHtml(speaker.role)}</span></div>`).join('') : '<span class="mc-empty-inline">Follow speakers from the directory.</span>'}
                  </div>
                </div>
                <div class="mc-library-block">
                  <div class="mc-library-header">
                    <div>
                      <span class="section-kicker">Saved themes</span>
                      <h2>Tracks on your radar</h2>
                    </div>
                    <span class="mc-library-count">${savedTracks.length}</span>
                  </div>
                  <div class="mc-library-list">
                    ${savedTracks.length ? savedTracks.map(track => `<div><strong>${escapeHtml(track.name)}</strong><span>${escapeHtml(track.description)}</span></div>`).join('') : '<span class="mc-empty-inline">Follow tracks from the explorer.</span>'}
                  </div>
                </div>
              </div>

              <div class="mc-pass-grid">
                <div class="mc-pass-copy">
                  <span class="section-kicker">Your pass</span>
                  <h2>One identity.<br>One itinerary.</h2>
                  <p>${state.profile.passId ? `Pass ${escapeHtml(state.profile.passId)} is linked to this planner.` : 'Registration will link your digital pass to this planner.'}</p>
                  <div class="mc-pass-actions">
                    ${state.profile.passId ? '<a class="btn btn-primary" href="register.html">Open Digital Pass</a>' : '<a class="btn btn-primary" href="register.html">Register & Link Pass</a>'}
                    <a class="btn btn-secondary" href="event.html">Event Details</a>
                  </div>
                </div>
                <div class="mc-pass-code">
                  <span>Web3 Carnival 2026</span>
                  <strong>${escapeHtml(state.profile.passId || 'W3C-2026-PENDING')}</strong>
                  <small>${savedSessions.length} sessions · ${savedTracks.length} tracks · ${savedSpeakers.length} speakers</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section final-cta-section mc-final-cta">
          <div class="container final-cta-inner">
            <div class="mc-final-index">03</div>
            <div>
              <h2 class="section-title">${mode.mode === 'event-day' ? 'You are inside the Carnival.' : 'Ready to finish your plan?'}</h2>
              <p class="section-desc">${mode.mode === 'event-day' ? 'Keep this page open for your next session, schedule and navigation context.' : 'Your planner keeps everything together as you move from discovery to registration.'}</p>
            </div>
            <div class="final-cta-actions">
              <a href="event.html#discovery" class="btn btn-secondary btn-lg">Browse Programme</a>
              <a href="register.html" class="btn btn-primary btn-lg">Continue to Registration</a>
            </div>
          </div>
        </section>
      `;

      initializeBuilder(root);
      syncSaveButtons();
    }

    /**
     * Initialize the schedule builder interactions.
     * @param {HTMLElement} pageRoot Dashboard root.
     * @returns {void}
     */
    function initializeBuilder(pageRoot) {
      const builder = pageRoot.querySelector('[data-builder]');
      if (!builder || builder.dataset.bound === 'true') return;
      builder.dataset.bound = 'true';

      const results = builder.querySelector('[data-builder-results]');
      const generate = builder.querySelector('[data-builder-generate]');
      const save = builder.querySelector('[data-builder-save]');
      let generatedIds = [];

      builder.addEventListener('click', event => {
        const choice = event.target.closest('[data-builder-track],[data-builder-level],[data-builder-priority]');
        if (!choice || !builder.contains(choice)) return;
        const type = choice.matches('[data-builder-track]') ? '[data-builder-track]' :
          choice.matches('[data-builder-level]') ? '[data-builder-level]' : '[data-builder-priority]';

        if (type === '[data-builder-track]') {
          choice.classList.toggle('is-selected');
        } else {
          builder.querySelectorAll(type).forEach(item => item.classList.remove('is-selected'));
          choice.classList.add('is-selected');
        }
      });

      if (generate) {
        generate.addEventListener('click', () => {
          renderBuilderResults(results);
          generatedIds = Array.from(results.querySelectorAll('[data-session-id]')).map(card => card.dataset.sessionId);
          save.hidden = generatedIds.length === 0;
          results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }

      if (save) {
        save.addEventListener('click', () => {
          generatedIds.forEach(id => {
            if (!state.sessions.includes(id)) state.sessions.push(id);
          });
          persistState();
        });
      }
    }

    /**
     * Open or close the drawer.
     * @param {boolean} open Whether to show the drawer.
     * @returns {void}
     */
    function setDrawer(open) {
      const overlay = document.querySelector('[data-carnival-drawer-overlay]');
      const drawer = document.querySelector('[data-carnival-drawer]');
      if (!overlay || !drawer) return;

      drawer.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('mc-drawer-open', open);
    }

    /**
     * Handle delegated planner controls.
     * @param {MouseEvent} event Click event.
     * @returns {void}
     */
    function handleDocumentClick(event) {
      const openTrigger = event.target.closest('[data-carnival-open]');
      if (openTrigger) {
        event.preventDefault();
        setDrawer(true);
        return;
      }

      if (event.target.closest('[data-carnival-close]') || event.target.closest('[data-carnival-drawer-overlay]')) {
        setDrawer(false);
        return;
      }

      const saveSession = event.target.closest('[data-carnival-save-session]');
      if (saveSession) {
        event.preventDefault();
        toggleSaved('sessions', saveSession.getAttribute('data-carnival-save-session'));
        return;
      }

      const saveSpeaker = event.target.closest('[data-carnival-save-speaker]');
      if (saveSpeaker) {
        event.preventDefault();
        toggleSaved('speakers', saveSpeaker.getAttribute('data-carnival-save-speaker'));
        return;
      }

      const saveTrack = event.target.closest('[data-carnival-save-track]');
      if (saveTrack) {
        event.preventDefault();
        toggleSaved('tracks', saveTrack.getAttribute('data-carnival-save-track'));
        return;
      }

      const removeSession = event.target.closest('[data-carnival-remove-session]');
      if (removeSession) {
        event.preventDefault();
        toggleSaved('sessions', removeSession.getAttribute('data-carnival-remove-session'));
        return;
      }

      const calendarButton = event.target.closest('[data-carnival-calendar-session]');
      if (calendarButton) {
        event.preventDefault();
        downloadCalendar(calendarButton.getAttribute('data-carnival-calendar-session'));
      }
    }

    /**
     * Download one session as an iCalendar file.
     * @param {string} sessionId Session ID.
     * @returns {void}
     */
    function downloadCalendar(sessionId) {
      const session = sessionById[sessionId];
      if (!session) return;
      const ics = core.buildIcs([session], dayById, { eventName: 'Web3 Carnival 2026', venue: data.venue });
      downloadText(`web3-carnival-${session.id}.ics`, ics, 'text/calendar;charset=utf-8');
    }

    /**
     * Download the complete saved schedule as an iCalendar file.
     * @returns {void}
     */
    function downloadFullCalendar() {
      const saved = getSavedSessions();
      if (!saved.length) return;
      const ics = core.buildIcs(saved, dayById, { eventName: 'Web3 Carnival 2026', venue: data.venue });
      downloadText('web3-carnival-my-schedule.ics', ics, 'text/calendar;charset=utf-8');
    }

    /**
     * Download a text/blob payload.
     * @param {string} filename File name.
     * @param {string} content File contents.
     * @param {string} mime MIME type.
     * @returns {void}
     */
    function downloadText(filename, content, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    /**
     * Mount the shared planner drawer.
     * @returns {void}
     */
    function mountDrawer() {
      if (document.querySelector('[data-carnival-drawer]')) return;
      document.body.insertAdjacentHTML('beforeend', `
        <div class="mc-drawer-overlay" data-carnival-drawer-overlay aria-hidden="true"></div>
        <aside class="mc-drawer" data-carnival-drawer aria-label="My Carnival planner" aria-hidden="true"></aside>
      `);
      renderDrawer();
    }

    /**
     * Add the full-calendar action to the dashboard when present.
     * @returns {void}
     */
    function bindDashboardExtras() {
      document.querySelectorAll('[data-carnival-full-calendar]').forEach(button => {
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';
        button.addEventListener('click', downloadFullCalendar);
      });
    }

    /**
     * Expose the planner API for existing modules.
     * @returns {void}
     */
    function exposeApi() {
      window.Web3Carnival = {
        getState: cloneState,
        isSaved: (type, id) => Array.isArray(state[type]) && state[type].includes(id),
        toggle: toggleSaved,
        syncLegacySessions,
        addToCalendar: downloadCalendar,
        downloadFullCalendar,
        open: () => setDrawer(true),
        close: () => setDrawer(false)
      };
    }

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('w3c:carnival-legacy-sync', event => {
      const ids = event.detail && Array.isArray(event.detail.ids) ? event.detail.ids : event.detail;
      if (Array.isArray(ids)) syncLegacySessions(ids);
    });
    window.addEventListener('storage', event => {
      if (event.key === core.STORAGE_KEY || event.key === core.LEGACY_JOURNEY_KEY) {
        state = core.loadState(storage, data);
        updateNavBadge();
        syncSaveButtons();
        renderDrawer();
        renderDashboard();
      }
    });

    mountDrawer();
    exposeApi();
    updateNavBadge();

    const observer = new MutationObserver(mutations => {
      const hasRelevantInsertion = mutations.some(mutation => {
        if (mutation.type !== 'childList' || !mutation.addedNodes.length) return false;
        return Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          const element = /** @type {Element} */ (node);
          return element.matches('[data-carnival-save-session],[data-carnival-save-speaker],[data-carnival-save-track],[data-carnival-full-calendar],[data-builder]')
            || Boolean(element.querySelector('[data-carnival-save-session],[data-carnival-save-speaker],[data-carnival-save-track],[data-carnival-full-calendar],[data-builder]'));
        });
      });

      if (!hasRelevantInsertion) return;
      syncSaveButtons();
      bindDashboardExtras();
      updateNavBadge();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    renderDashboard();
  });
})();
