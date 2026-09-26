/**
 * Web3 Carnival — Phase 4 Speakers Directory
 * Relationship model: Speaker ↔ Track ↔ Session, plus Speaker ↔ Speaker.
 * Reads exclusively from WEB3_CARNIVAL_DATA (js/data.js) — no local dataset.
 * Scoped entirely to speakers.html via [data-speakers-page].
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-speakers-page]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const speakers = Array.isArray(data.speakers) ? data.speakers : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    if (!speakers.length) return;

    const trackById = Object.fromEntries(tracks.map(t => [t.id, t]));
    const speakerById = Object.fromEntries(speakers.map(s => [s.id, s]));

    // Union of every speaker's expertise tags, in first-seen order.
    const expertiseTags = [];
    speakers.forEach(s => (s.expertise || []).forEach(tag => {
      if (!expertiseTags.includes(tag)) expertiseTags.push(tag);
    }));

    const state = {
      query: '',
      trackFilter: 'all',
      expertiseFilter: 'all'
    };

    const searchInput = root.querySelector('#speaker-search');
    const trackFilterBar = root.querySelector('[data-track-filter-bar]');
    const expertiseFilterBar = root.querySelector('[data-expertise-filter-bar]');
    const grid = root.querySelector('[data-speakers-grid]');
    const countNote = root.querySelector('[data-speakers-count]');
    const heroStats = root.querySelector('[data-speakers-hero-stats]');

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[char]));
    }

    function splitRoleOrg(roleString) {
      const raw = String(roleString || '');
      const idx = raw.indexOf(',');
      if (idx === -1) return { title: raw, org: '' };
      return { title: raw.slice(0, idx).trim(), org: raw.slice(idx + 1).trim() };
    }

    function sessionsForSpeaker(speakerId) {
      return sessions.filter(s => s.speakerId === speakerId);
    }

    function tracksForSpeaker(speaker) {
      const ids = new Set(speaker.trackIds || []);
      sessionsForSpeaker(speaker.id).forEach(s => ids.add(s.trackId));
      return tracks.filter(t => ids.has(t.id));
    }

    function relatedSpeakers(speaker) {
      const myTracks = new Set((speaker.trackIds || []));
      return speakers.filter(s => {
        if (s.id === speaker.id) return false;
        return (s.trackIds || []).some(id => myTracks.has(id));
      }).slice(0, 4);
    }

    // ------------------------------------------------------------------
    // Hero stats (static — no animation, keeps this a quick trust strip)
    // ------------------------------------------------------------------
    function renderHeroStats() {
      if (!heroStats) return;
      const trackCoverage = new Set();
      speakers.forEach(s => (s.trackIds || []).forEach(id => trackCoverage.add(id)));
      const items = [
        { value: speakers.length, label: 'Speakers' },
        { value: trackCoverage.size, label: 'Tracks represented' },
        { value: sessions.length, label: 'Sessions' }
      ];
      heroStats.innerHTML = items.map(item => `
        <div class="speakers-hero-stat"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>
      `).join('');
    }

    // ------------------------------------------------------------------
    // Filter bars (track + expertise) — same accessible pattern as Tracks
    // ------------------------------------------------------------------
    function buildFilterBar(container, stateKey, options, getId, getLabel) {
      if (!container) return;
      container.innerHTML = '';
      const make = (id, label) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn' + (state[stateKey] === id ? ' active' : '');
        button.textContent = label;
        button.setAttribute('aria-pressed', state[stateKey] === id ? 'true' : 'false');
        button.addEventListener('click', function () {
          state[stateKey] = id;
          buildFilterBar(container, stateKey, options, getId, getLabel);
          renderGrid();
        });
        container.appendChild(button);
      };
      make('all', 'All');
      options.forEach(opt => make(getId(opt), getLabel(opt)));
    }

    // ------------------------------------------------------------------
    // Filtering — search + track + expertise all combine
    // ------------------------------------------------------------------
    function filteredSpeakers() {
      const query = state.query.trim().toLowerCase();
      return speakers.filter(speaker => {
        if (state.trackFilter !== 'all' && !(speaker.trackIds || []).includes(state.trackFilter)) return false;
        if (state.expertiseFilter !== 'all' && !(speaker.expertise || []).includes(state.expertiseFilter)) return false;
        if (!query) return true;
        const haystack = [
          speaker.name, speaker.role, speaker.location,
          ...(speaker.expertise || []),
          ...tracksForSpeaker(speaker).map(t => t.name)
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    // ------------------------------------------------------------------
    // Speaker grid (cards)
    // ------------------------------------------------------------------
    function socialIcon(kind) {
      return { twitter: '𝕏', linkedin: 'in', website: '🔗' }[kind] || '🔗';
    }

    function renderSocials(speaker, size) {
      const socials = speaker.socials || {};
      const entries = Object.keys(socials).filter(key => socials[key]);
      if (!entries.length) return '';
      const cls = size === 'lg' ? 'btn btn-secondary btn-sm' : 'card-speaker-social';
      return entries.map(key => `
        <a class="${cls}" href="${escapeHtml(socials[key])}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(speaker.name)} on ${escapeHtml(key)}">${size === 'lg' ? escapeHtml(key.charAt(0).toUpperCase() + key.slice(1)) : socialIcon(key)}</a>
      `).join('');
    }

    function renderGrid() {
      const list = filteredSpeakers();
      countNote.textContent = `${list.length} of ${speakers.length} speaker${speakers.length === 1 ? '' : 's'}`;

      if (!list.length) {
        grid.innerHTML = `
          <div class="speakers-empty">
            <strong>No speakers match yet.</strong>
            <span>Try a different search term, or reset the track and expertise filters.</span>
            <button type="button" class="speakers-empty-reset" data-reset-filters>Reset filters</button>
          </div>`;
        const resetBtn = grid.querySelector('[data-reset-filters]');
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        return;
      }

      grid.innerHTML = list.map(speaker => {
        const { title, org } = splitRoleOrg(speaker.role);
        const speakerTracks = tracksForSpeaker(speaker).slice(0, 2);
        const tagChips = (speaker.expertise || []).slice(0, 2);
        return `
          <article class="card-speaker" data-speaker-card="${escapeHtml(speaker.id)}">
            <button type="button" class="card-speaker-trigger" data-open-speaker="${escapeHtml(speaker.id)}" aria-haspopup="dialog" aria-label="View full profile for ${escapeHtml(speaker.name)}">
              <span class="card-speaker-media">
                <img class="card-speaker-img" src="${escapeHtml(speaker.photo)}" alt="Portrait of ${escapeHtml(speaker.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.hidden=false;">
                <span class="card-speaker-placeholder" hidden>${escapeHtml(speaker.initials)}</span>
              </span>
              <span class="card-speaker-body">
                <span class="card-speaker-name">${escapeHtml(speaker.name)}</span>
                <span class="card-speaker-role">${escapeHtml(title)}</span>
                ${org ? `<span class="card-speaker-org">${escapeHtml(org)}</span>` : ''}
                <span class="card-speaker-location">📍 ${escapeHtml(speaker.location)}</span>
                <span class="card-speaker-tags">
                  ${speakerTracks.map(t => `<span class="pill pill-accent">${escapeHtml(t.icon)} ${escapeHtml(t.name)}</span>`).join('')}
                  ${tagChips.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}
                </span>
              </span>
            </button>
            <span class="card-speaker-socials">${renderSocials(speaker)}</span>
          </article>`;
      }).join('');

      grid.querySelectorAll('[data-open-speaker]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-speaker'), btn));
      });
    }

    function resetFilters() {
      state.query = '';
      state.trackFilter = 'all';
      state.expertiseFilter = 'all';
      if (searchInput) searchInput.value = '';
      buildFilterBar(trackFilterBar, 'trackFilter', tracks, t => t.id, t => t.name);
      buildFilterBar(expertiseFilterBar, 'expertiseFilter', expertiseTags, t => t, t => t);
      renderGrid();
    }

    // ------------------------------------------------------------------
    // Accessible Speaker Detail Modal
    // bio, expertise, related tracks, related sessions, related speakers
    // ------------------------------------------------------------------
    const modalOverlay = document.querySelector('[data-speaker-modal]');
    const modalDialog = modalOverlay ? modalOverlay.querySelector('.modal-dialog') : null;
    let lastFocusedEl = null;

    function getFocusableEls(container) {
      return Array.from(
        container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => el.offsetParent !== null);
    }

    function renderModalContent(speaker) {
      const { title, org } = splitRoleOrg(speaker.role);
      const speakerTracks = tracksForSpeaker(speaker);
      const speakerSessions = sessionsForSpeaker(speaker.id);
      const related = relatedSpeakers(speaker);
      const socials = renderSocials(speaker, 'lg');

      modalDialog.innerHTML = `
        <button type="button" class="modal-close-btn" data-modal-close aria-label="Close speaker profile">✕</button>
        <div class="modal-speaker-header">
          <span class="modal-speaker-photo-wrap">
            <img src="${escapeHtml(speaker.photo)}" alt="Portrait of ${escapeHtml(speaker.name)}" onerror="this.style.display='none'; this.nextElementSibling.hidden=false;">
            <span class="modal-speaker-initials" hidden>${escapeHtml(speaker.initials)}</span>
          </span>
          <div>
            <h2 class="modal-title" id="speaker-modal-title" style="padding-right:0;margin-bottom:4px;">${escapeHtml(speaker.name)}</h2>
            <p class="modal-speaker" style="margin:0;"><strong>${escapeHtml(title)}</strong>${org ? ` — ${escapeHtml(org)}` : ''}</p>
            <p class="modal-speaker" style="margin:0; font-size: var(--text-sm);">📍 ${escapeHtml(speaker.location)}</p>
          </div>
        </div>

        ${speaker.bio ? `<p class="modal-desc" id="speaker-modal-desc">${escapeHtml(speaker.bio)}</p>` : '<p class="modal-desc" id="speaker-modal-desc"></p>'}

        ${(speaker.expertise || []).length ? `
          <div class="modal-section-title">Expertise</div>
          <div class="modal-tag-list">${speaker.expertise.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}</div>
        ` : ''}

        ${socials ? `
          <div class="modal-section-title">Connect</div>
          <div class="modal-social-row">${socials}</div>
        ` : ''}

        ${speakerTracks.length ? `
          <div class="modal-section-title">Related Tracks</div>
          <div class="modal-related-list">
            ${speakerTracks.map(t => `
              <a class="modal-related-item" href="tracks.html#${encodeURIComponent(t.id)}">
                <span class="modal-related-item-title">${escapeHtml(t.icon)} ${escapeHtml(t.name)}</span>
                <span class="modal-related-item-meta">${escapeHtml(t.description)}</span>
              </a>
            `).join('')}
          </div>
        ` : ''}

        ${speakerSessions.length ? `
          <div class="modal-section-title">Related Sessions</div>
          <div class="modal-related-list">
            ${speakerSessions.map(s => `
              <a class="modal-related-item" href="event.html?session=${encodeURIComponent(s.id)}#discovery">
                <span class="modal-related-item-title">${escapeHtml(s.title)}</span>
                <span class="modal-related-item-meta">${escapeHtml(s.dayId.replace('day', 'Day '))} · ${escapeHtml(s.time)}</span>
              </a>
            `).join('')}
          </div>
        ` : ''}

        ${related.length ? `
          <div class="modal-section-title">Related Speakers</div>
          <div class="modal-related-list">
            ${related.map(r => `
              <button type="button" class="modal-related-item" data-open-related="${escapeHtml(r.id)}">
                <span class="modal-related-item-title">${escapeHtml(r.name)}</span>
                <span class="modal-related-item-meta">${escapeHtml(splitRoleOrg(r.role).title)} · ${escapeHtml(r.location)}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}
      `;

      modalDialog.querySelector('[data-modal-close]').addEventListener('click', closeModal);
      modalDialog.querySelectorAll('[data-open-related]').forEach(btn => {
        btn.addEventListener('click', () => {
          const nextSpeaker = speakerById[btn.getAttribute('data-open-related')];
          if (nextSpeaker) {
            renderModalContent(nextSpeaker);
            modalDialog.focus();
          }
        });
      });
    }

    function openModal(speakerId, triggerEl) {
      const speaker = speakerById[speakerId];
      if (!speaker || !modalOverlay || !modalDialog) return;

      lastFocusedEl = triggerEl || document.activeElement;
      renderModalContent(speaker);

      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      modalDialog.setAttribute('tabindex', '-1');
      modalDialog.focus();

      history.replaceState(null, '', `speakers.html#${encodeURIComponent(speakerId)}`);
      document.addEventListener('keydown', onModalKeydown);
    }

    function closeModal() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onModalKeydown);
      history.replaceState(null, '', 'speakers.html');

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

    // ------------------------------------------------------------------
    // Wire up search + init
    // ------------------------------------------------------------------
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = searchInput.value;
        renderGrid();
      });
    }

    buildFilterBar(trackFilterBar, 'trackFilter', tracks, t => t.id, t => t.name);
    buildFilterBar(expertiseFilterBar, 'expertiseFilter', expertiseTags, t => t, t => t);

    renderHeroStats();
    renderGrid();

    // Deep link: speakers.html#speaker-id opens that speaker's profile directly.
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && speakerById[initialHash]) {
      const card = grid.querySelector(`[data-open-speaker="${CSS.escape(initialHash)}"]`);
      openModal(initialHash, card);
    }
  });
})();
