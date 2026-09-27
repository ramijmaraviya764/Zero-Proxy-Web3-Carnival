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

    // Ensure the 4 primary expertise tags specified by the user are first:
    const primaryExpertiseTags = [
      'Zero-Knowledge Proofs',
      'Protocol Security',
      'Applied Cryptography',
      'Cross-Chain Interoperability'
    ];
    const otherTags = [];
    speakers.forEach(s => (s.expertise || []).forEach(tag => {
      if (!primaryExpertiseTags.includes(tag) && !otherTags.includes(tag)) {
        otherTags.push(tag);
      }
    }));
    const expertiseTags = [...primaryExpertiseTags, ...otherTags];

    const state = {
      query: '',
      trackFilter: 'all',
      expertiseFilter: 'all',
      trackExpanded: false,
      expertiseExpanded: false
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

    /**
     * Determine whether a speaker image is a generic placeholder service.
     * @param {string} photo Source URL.
     * @returns {boolean} True when the source is not a supplied portrait.
     */
    function isPlaceholderPhoto(photo) {
      return !photo || /pravatar\.cc/i.test(String(photo));
    }

    /**
     * Render a consistent line icon for a track label.
     * @param {string} trackId Track identifier.
     * @returns {string} Inline SVG markup.
     */
    function renderTrackIcon(trackId) {
      const icons = {
        infra: '<path d="M8 4v5M16 15v5M4 8h5M15 16h5M9 9l6 6M15 9 9 15"/>',
        dao: '<path d="M12 3v5M12 16v5M4 8l4 4-4 4M20 8l-4 4 4 4M8 12h8"/>',
        metaverse: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/>',
        zk: '<path d="M12 3 19 6v5c0 4.4-2.7 7.7-7 10-4.3-2.3-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
        defi: '<path d="M6 18V8M12 18V5M18 18v-9"/><path d="m4 16 8-6 5 3 3-4"/>',
        enterprise: '<rect x="4" y="5" width="16" height="15" rx="2"/>',
        nft: '<path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"/>'
      };
      return `<svg class="w3c-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[trackId] || icons.infra}</svg>`;
    }

    /**
     * Render a compact location marker without relying on emoji glyphs.
     * @returns {string} Inline SVG location icon.
     */
    function renderLocationIcon() {
      return '<svg class="speaker-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
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
    // Professional Inline Expandable Filter System
    // ------------------------------------------------------------------
    function buildFilterBar(container, stateKey, expandedKey, options, getId, getLabel, limit) {
      if (!container) return;
      container.innerHTML = '';

      const primaryOptions = options.slice(0, limit);
      const remainingOptions = options.slice(limit);

      // If an option in the hidden set is active, auto-expand so the active filter is visible
      const isHiddenActive = remainingOptions.some(opt => getId(opt) === state[stateKey]);
      if (isHiddenActive) {
        state[expandedKey] = true;
      }

      const isExpanded = state[expandedKey];

      const makeBtn = (id, label, isExtra = false) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn' + (state[stateKey] === id ? ' active' : '') + (isExtra ? ' filter-pill-extra' : '');
        button.textContent = label;
        button.setAttribute('aria-pressed', state[stateKey] === id ? 'true' : 'false');
        button.addEventListener('click', function () {
          state[stateKey] = id;
          rebuildAllFilters();
          renderGrid();
        });
        container.appendChild(button);
        return button;
      };

      // 1. "All" button
      makeBtn('all', 'All');

      // 2. Primary visible options
      primaryOptions.forEach(opt => makeBtn(getId(opt), getLabel(opt)));

      // 3. If expanded, render remaining options in normal document flow
      if (isExpanded) {
        remainingOptions.forEach(opt => makeBtn(getId(opt), getLabel(opt), true));
      }

      // 4. Inline toggle button (+ More / − Show less) if remaining options exist
      if (remainingOptions.length > 0) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'filter-btn filter-toggle-btn' + (isExpanded ? ' is-expanded' : '');
        toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        toggleBtn.textContent = isExpanded ? '− Show less' : `+ More (${remainingOptions.length})`;
        toggleBtn.addEventListener('click', function () {
          state[expandedKey] = !state[expandedKey];
          rebuildAllFilters();
        });
        container.appendChild(toggleBtn);
      }
    }

    function rebuildAllFilters() {
      buildFilterBar(trackFilterBar, 'trackFilter', 'trackExpanded', tracks, t => t.id, t => t.name, 5);
      buildFilterBar(expertiseFilterBar, 'expertiseFilter', 'expertiseExpanded', expertiseTags, t => t, t => t, 4);
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
      return { twitter: '<span aria-hidden="true">𝕏</span>', linkedin: '<span aria-hidden="true">in</span>', website: '<span aria-hidden="true">↗</span>' }[kind] || '<span aria-hidden="true">↗</span>';
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
        const media = isPlaceholderPhoto(speaker.photo)
          ? `<span class="card-speaker-placeholder" aria-hidden="true">${escapeHtml(speaker.initials)}</span>`
          : `<img class="card-speaker-img" src="${escapeHtml(speaker.photo)}" alt="Portrait of ${escapeHtml(speaker.name)}" loading="lazy" data-fallback-image><span class="card-speaker-placeholder" hidden aria-hidden="true">${escapeHtml(speaker.initials)}</span>`;
        return `
          <article class="card-speaker" data-speaker-card="${escapeHtml(speaker.id)}">
            <button type="button" class="card-speaker-trigger" data-open-speaker="${escapeHtml(speaker.id)}" aria-haspopup="dialog" aria-label="View full profile for ${escapeHtml(speaker.name)}">
              <span class="card-speaker-media">
                ${media}
              </span>
              <span class="card-speaker-body">
                <span class="card-speaker-name">${escapeHtml(speaker.name)}</span>
                <span class="card-speaker-role">${escapeHtml(title)}</span>
                ${org ? `<span class="card-speaker-org">${escapeHtml(org)}</span>` : ''}
                <span class="card-speaker-location">${renderLocationIcon()} ${escapeHtml(speaker.location)}</span>
                <span class="card-speaker-tags">
                  ${speakerTracks.map(t => `<span class="pill pill-accent">${renderTrackIcon(t.id)} ${escapeHtml(t.name)}</span>`).join('')}
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
      state.trackExpanded = false;
      state.expertiseExpanded = false;
      if (searchInput) searchInput.value = '';
      rebuildAllFilters();
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

      const modalMedia = isPlaceholderPhoto(speaker.photo)
        ? `<span class="modal-speaker-initials">${escapeHtml(speaker.initials)}</span>`
        : `<img src="${escapeHtml(speaker.photo)}" alt="Portrait of ${escapeHtml(speaker.name)}" data-fallback-image><span class="modal-speaker-initials" hidden>${escapeHtml(speaker.initials)}</span>`;

      modalDialog.innerHTML = `
        <button type="button" class="modal-close-btn" data-modal-close aria-label="Close speaker profile">✕</button>
        <div class="modal-speaker-header">
          <span class="modal-speaker-photo-wrap">
            ${modalMedia}
          </span>
          <div>
            <h2 class="modal-title modal-title--speaker" id="speaker-modal-title">${escapeHtml(speaker.name)}</h2>
            <p class="modal-speaker modal-speaker--compact"><strong>${escapeHtml(title)}</strong>${org ? ` — ${escapeHtml(org)}` : ''}</p>
            <p class="modal-speaker modal-speaker--location">${escapeHtml(speaker.location)}</p>
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
                <span class="modal-related-item-title">${renderTrackIcon(t.id)} ${escapeHtml(t.name)}</span>
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

    rebuildAllFilters();

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
