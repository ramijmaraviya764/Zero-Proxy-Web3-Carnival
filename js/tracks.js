/**
 * Web3 Carnival — Phase 3 Tracks + Speaker × Track Explorer
 * Relationship model: Track ↔ Speaker ↔ Session
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-tracks-explorer]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const speakers = Array.isArray(data.speakers) ? data.speakers : [];
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const speakerById = Object.fromEntries(speakers.map(s => [s.id, s]));
    const trackById = Object.fromEntries(tracks.map(t => [t.id, t]));

    // Backward-compatible speaker resolution for any older session records.
    const speakerByName = Object.fromEntries(speakers.map(s => [s.name, s]));
    sessions.forEach(session => {
      if (!session.speakerId && speakerByName[session.speaker]) session.speakerId = speakerByName[session.speaker].id;
    });

    const state = {
      selectedTrackId: tracks[0]?.id || null,
      selectedSpeakerId: null,
      query: '',
      filter: 'all'
    };

    const trackGrid = root.querySelector('[data-track-grid]');
    const speakerGrid = root.querySelector('[data-speakers-grid]');
    const sessionGrid = root.querySelector('[data-track-sessions]');
    const detail = root.querySelector('[data-track-detail]');
    const filterBar = root.querySelector('.track-filter-bar');
    const search = root.querySelector('#track-search');
    const speakerCount = root.querySelector('[data-speaker-count]');

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));

    /**
     * Determine whether a speaker image is a generic placeholder service.
     * @param {string} photo Source URL.
     * @returns {boolean} True when the source is not a supplied portrait.
     */
    function isPlaceholderPhoto(photo) {
      return !photo || /pravatar\.cc/i.test(String(photo));
    }

    /**
     * Render the track glyph using the site's monochrome SVG icon language.
     * @param {string} trackId Track identifier.
     * @returns {string} Accessible inline SVG markup.
     */
    function renderTrackIcon(trackId) {
      const icons = {
        infra: '<path d="M8 4v5M16 15v5M4 8h5M15 16h5M9 9l6 6M15 9 9 15"/>',
        dao: '<path d="M12 3v5M12 16v5M4 8l4 4-4 4M20 8l-4 4 4 4M8 12h8"/>',
        metaverse: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
        zk: '<path d="M12 3 19 6v5c0 4.4-2.7 7.7-7 10-4.3-2.3-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
        defi: '<path d="M6 18V8M12 18V5M18 18v-9"/><path d="m4 16 8-6 5 3 3-4"/>',
        enterprise: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M8 17h8"/>',
        nft: '<path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"/><path d="m9 12 2 2 4-4"/>'
      };
      const pathMarkup = icons[trackId] || icons.infra;
      return `<svg class="w3c-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pathMarkup}</svg>`;
    }

    function sessionsForTrack(trackId) {
      return sessions.filter(session => session.trackId === trackId);
    }

    function speakersForTrack(trackId) {
      const ids = new Set(sessionsForTrack(trackId).map(s => s.speakerId).filter(Boolean));
      return speakers.filter(s => ids.has(s.id) || (s.trackIds || []).includes(trackId));
    }

    function sessionsForSpeaker(speakerId, trackId) {
      return sessions.filter(session => session.speakerId === speakerId && (!trackId || session.trackId === trackId));
    }

    function filteredTracks() {
      const query = state.query.trim().toLowerCase();
      return tracks.filter(track => {
        if (state.filter !== 'all' && track.id !== state.filter) return false;
        if (!query) return true;
        const trackSpeakers = speakersForTrack(track.id);
        const trackSessions = sessionsForTrack(track.id);
        const haystack = [
          track.name, track.description,
          ...trackSpeakers.flatMap(s => [s.name, s.role, s.location]),
          ...trackSessions.flatMap(s => [s.title, s.description, s.speaker])
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    function buildFilterBar() {
      filterBar.innerHTML = '';
      const make = (id, label) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn' + (state.filter === id ? ' active' : '');
        button.textContent = label;
        button.setAttribute('aria-pressed', state.filter === id ? 'true' : 'false');
        button.addEventListener('click', function () {
          state.filter = id;
          state.selectedTrackId = id === 'all' ? state.selectedTrackId : id;
          if (id !== 'all') state.selectedSpeakerId = null;
          buildFilterBar();
          render();
          if (id !== 'all') selectTrack(id, false);
        });
        filterBar.appendChild(button);
      };
      make('all', 'All tracks');
      tracks.forEach(track => make(track.id, track.name));
    }

    function renderTrackCards() {
      const visible = filteredTracks();
      if (!visible.length) {
        trackGrid.innerHTML = '<div class="explorer-empty"><strong>No matches.</strong><span>Try another track, speaker, or session name.</span></div>';
        return;
      }

      trackGrid.innerHTML = visible.map((track, index) => {
        const trackSpeakers = speakersForTrack(track.id);
        const trackSessions = sessionsForTrack(track.id);
        const selected = state.selectedTrackId === track.id;
        return `
          <button type="button" class="track-explorer-card${selected ? ' is-selected' : ''}" data-track-id="${escapeHtml(track.id)}" aria-pressed="${selected ? 'true' : 'false'}">
            <span class="track-explorer-card-top">
              <span class="track-explorer-icon" aria-hidden="true">${renderTrackIcon(track.id)}</span>
              <span class="track-explorer-number">0${index + 1}</span>
            </span>
            <span class="track-explorer-title">${escapeHtml(track.name)}</span>
            <span class="track-explorer-description">${escapeHtml(track.description)}</span>
            <span class="track-explorer-meta"><span>${trackSpeakers.length} speakers</span><span>${trackSessions.length} sessions</span><span>Explore ↗</span></span>
          </button>`;
      }).join('');

      trackGrid.querySelectorAll('[data-track-id]').forEach(button => {
        button.addEventListener('click', () => selectTrack(button.dataset.trackId, true));
      });
    }

    function renderDetail() {
      if (!state.selectedTrackId) {
        detail.innerHTML = `
          <div class="track-detail-empty">
            <span class="track-detail-empty-mark" aria-hidden="true">↗</span>
            <div><p class="section-kicker">Start with a track</p><h2>Select a track to open its programme.</h2><p>Each track connects directly to its speakers and sessions, so you can move from a theme to the people behind it and then into the event schedule.</p></div>
          </div>`;
        return;
      }
      const track = trackById[state.selectedTrackId];
      const trackSpeakers = speakersForTrack(track.id);
      const trackSessions = sessionsForTrack(track.id);
      detail.innerHTML = `
        <div class="track-detail-copy">
          <div class="track-detail-icon" aria-hidden="true">${renderTrackIcon(track.id)}</div>
          <div>
            <p class="section-kicker">Selected track</p>
            <h2 id="track-detail-title">${escapeHtml(track.name)}</h2>
            <p>${escapeHtml(track.description)}</p>
          </div>
        </div>
        <div class="track-detail-stats" aria-label="Track summary">
          <div><strong>${trackSpeakers.length}</strong><span>speakers</span></div>
          <div><strong>${trackSessions.length}</strong><span>sessions</span></div>
          <a href="event.html?track=${encodeURIComponent(track.id)}#discovery">Full schedule ↗</a>
        </div>`;
    }

    function renderSpeakers() {
      if (!state.selectedTrackId) {
        speakerGrid.innerHTML = '<div class="explorer-empty"><strong>Choose a track above.</strong><span>Its connected speakers will appear here.</span></div>';
        speakerCount.textContent = '';
        return;
      }
      let list = speakersForTrack(state.selectedTrackId);
      if (state.selectedSpeakerId) {
        const selected = speakerById[state.selectedSpeakerId];
        list = selected ? [selected] : list;
      }
      speakerCount.textContent = `${list.length} connected speaker${list.length === 1 ? '' : 's'}`;
      speakerGrid.innerHTML = list.map(speaker => {
        const selected = state.selectedSpeakerId === speaker.id;
        const count = sessionsForSpeaker(speaker.id, state.selectedTrackId).length;
        return `
          <button type="button" class="explorer-speaker-card${selected ? ' is-selected' : ''}" data-speaker-id="${escapeHtml(speaker.id)}" aria-pressed="${selected ? 'true' : 'false'}">
            <span class="explorer-speaker-photo-wrap">
              ${isPlaceholderPhoto(speaker.photo) ? `<span class="explorer-speaker-initials">${escapeHtml(speaker.initials)}</span>` : `<img class="explorer-speaker-photo" src="${escapeHtml(speaker.photo)}" alt="${escapeHtml(speaker.name)}" loading="lazy" data-fallback-image><span class="explorer-speaker-initials" hidden>${escapeHtml(speaker.initials)}</span>`}
            </span>
            <span class="explorer-speaker-copy">
              <strong>${escapeHtml(speaker.name)}</strong>
              <span>${escapeHtml(speaker.role)}</span>
              <small>${escapeHtml(speaker.location)} · ${count} session${count === 1 ? '' : 's'}</small>
            </span>
            <span class="explorer-speaker-arrow" aria-hidden="true">↗</span>
          </button>`;
      }).join('');

      speakerGrid.querySelectorAll('[data-speaker-id]').forEach(button => {
        button.addEventListener('click', () => selectSpeaker(button.dataset.speakerId));
      });
    }

    function renderSessions() {
      if (!state.selectedTrackId) {
        sessionGrid.innerHTML = '<div class="explorer-empty"><strong>Your session trail starts here.</strong><span>Select a track, then a speaker to narrow the programme.</span></div>';
        return;
      }
      let list = sessionsForTrack(state.selectedTrackId);
      if (state.selectedSpeakerId) list = sessionsForSpeaker(state.selectedSpeakerId, state.selectedTrackId);
      sessionGrid.innerHTML = list.map(session => {
        const speaker = speakerById[session.speakerId];
        return `
          <article class="explorer-session-card" id="session-${escapeHtml(session.id)}">
            <div class="explorer-session-top"><span class="pill pill-cyan">${escapeHtml(session.time)}</span><span>${escapeHtml(session.dayId.replace('day', 'Day '))}</span></div>
            <h3>${escapeHtml(session.title)}</h3>
            <p>${escapeHtml(session.description)}</p>
            <div class="explorer-session-footer">
              <span>${escapeHtml(speaker ? speaker.name : session.speaker)}</span>
              <a href="event.html?session=${encodeURIComponent(session.id)}#discovery">View in Event ↗</a>
            </div>
          </article>`;
      }).join('');
    }

    function render() {
      renderTrackCards();
      renderDetail();
      renderSpeakers();
      renderSessions();
    }

    function selectTrack(trackId, scroll) {
      if (!trackById[trackId]) return;
      state.selectedTrackId = trackId;
      state.selectedSpeakerId = null;
      render();
      if (scroll) document.querySelector('#track-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `tracks.html#${encodeURIComponent(trackId)}`);
    }

    function selectSpeaker(speakerId) {
      if (!speakerById[speakerId]) return;
      state.selectedSpeakerId = state.selectedSpeakerId === speakerId ? null : speakerId;
      renderSpeakers();
      renderSessions();
      document.querySelector('.explorer-sessions-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    search.addEventListener('input', function () {
      state.query = search.value;
      renderTrackCards();
    });

    buildFilterBar();

    const initialHash = window.location.hash.replace('#', '');
    if (trackById[initialHash]) state.selectedTrackId = initialHash;
    else if (tracks[0]) state.selectedTrackId = tracks[0].id;

    render();
  });
})();
