/**
 * Web3 Carnival — Phase 6 Ecosystem Map (Signature Feature #1)
 * Relationship model: Ecosystem Segment ↔ Track ↔ Speaker → Session → Registration
 *
 * One shared data-driven render powers two presentations of the same
 * relationships, switched purely by CSS (see responsive.css @1024px):
 *  - Desktop: a hub-and-spoke node-link diagram (Web3 Carnival at the
 *    center, the 8 segments around it, SVG lines showing the connection).
 *  - Mobile: the same 8 segments as a selectable list/grid — no attempt to
 *    cram the desktop graph into a phone viewport.
 * Selecting a segment (desktop or mobile) reveals its real connections:
 * the tracks it shows up in, the speakers active in those tracks, the
 * ways to get involved, and a CTA — pulled entirely from js/data.js.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-ecosystem-root]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const segments = Array.isArray(data.ecosystemSegments) ? data.ecosystemSegments : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const speakers = Array.isArray(data.speakers) ? data.speakers : [];
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const opportunities = Array.isArray(data.getInvolvedPaths) ? data.getInvolvedPaths : [];
    if (!segments.length) return;

    const trackById = Object.fromEntries(tracks.map(t => [t.id, t]));
    const opportunityById = Object.fromEntries(opportunities.map(o => [o.id, o]));

    const CTA_LABELS = {
      sponsor: 'Become a Sponsor',
      speaker: 'Apply to Speak',
      media: 'Apply as Media',
      community: 'Become a Community Partner',
      volunteer: 'Apply to Volunteer',
      'super-demo': 'Apply for Super Demo'
    };

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));

    const isReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------ */
    /* Derived relationships — computed once from the real dataset        */
    /* ------------------------------------------------------------------ */
    function tracksForSegment(segment) {
      return (segment.trackIds || []).map(id => trackById[id]).filter(Boolean);
    }

    function sessionCountForTrack(trackId) {
      return sessions.filter(s => s.trackId === trackId).length;
    }

    function speakersForSegment(segment) {
      const ids = new Set(segment.trackIds || []);
      return speakers
        .filter(s => (s.trackIds || []).some(id => ids.has(id)))
        .sort((a, b) => {
          const matchesA = (a.trackIds || []).filter(id => ids.has(id)).length;
          const matchesB = (b.trackIds || []).filter(id => ids.has(id)).length;
          return matchesB - matchesA;
        })
        .slice(0, 4);
    }

    function opportunitiesForSegment(segment) {
      return (segment.opportunityIds || []).map(id => opportunityById[id]).filter(Boolean);
    }

    /* ------------------------------------------------------------------ */
    /* Node geometry — 8 segments evenly spaced around the hub (desktop)  */
    /* ------------------------------------------------------------------ */
    const CENTER = 50;
    const RADIUS = 37;
    const positions = segments.map((segment, i) => {
      const angle = (-90 + i * (360 / segments.length)) * (Math.PI / 180);
      return {
        id: segment.id,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle)
      };
    });
    const positionById = Object.fromEntries(positions.map(p => [p.id, p]));

    /* ------------------------------------------------------------------ */
    /* DOM refs                                                            */
    /* ------------------------------------------------------------------ */
    const nodesWrap = root.querySelector('[data-ecosystem-nodes]');
    const linesSvg = root.querySelector('[data-ecosystem-lines]');
    const hubBtn = root.querySelector('[data-ecosystem-hub]');
    const detail = root.querySelector('[data-ecosystem-detail]');

    const state = { selectedId: null };

    /* ------------------------------------------------------------------ */
    /* Render: nodes + connecting lines                                    */
    /* ------------------------------------------------------------------ */
    function renderNodes() {
      nodesWrap.innerHTML = segments.map(segment => {
        const pos = positionById[segment.id];
        const selected = state.selectedId === segment.id;
        const dimmed = state.selectedId && !selected;
        return `
          <button type="button"
            class="ecosystem-node-btn${selected ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}"
            data-segment-id="${escapeHtml(segment.id)}"
            style="--nx:${pos.x}%;--ny:${pos.y}%"
            aria-pressed="${selected ? 'true' : 'false'}">
            <span class="ecosystem-node-icon" aria-hidden="true">${escapeHtml(segment.icon)}</span>
            <span class="ecosystem-node-label">${escapeHtml(segment.name)}</span>
          </button>`;
      }).join('');

      nodesWrap.querySelectorAll('[data-segment-id]').forEach(btn => {
        btn.addEventListener('click', () => selectSegment(btn.dataset.segmentId, true));
        btn.addEventListener('keydown', onNodeKeydown);
      });
    }

    function renderLines() {
      if (!linesSvg) return;
      linesSvg.innerHTML = positions.map(pos => {
        const selected = state.selectedId === pos.id;
        const dimmed = state.selectedId && !selected;
        return `<line x1="${CENTER}" y1="${CENTER}" x2="${pos.x}" y2="${pos.y}"
          class="${selected ? 'is-active' : ''}${dimmed ? ' is-dimmed' : ''}"></line>`;
      }).join('');
    }

    function renderHub() {
      if (!hubBtn) return;
      hubBtn.classList.toggle('is-active', Boolean(state.selectedId));
      hubBtn.setAttribute('aria-pressed', state.selectedId ? 'true' : 'false');
    }

    /* ------------------------------------------------------------------ */
    /* Render: detail panel                                                */
    /* ------------------------------------------------------------------ */
    function renderDetail() {
      if (!detail) return;

      if (!state.selectedId) {
        const speakerCount = new Set(speakers.map(s => s.id)).size;
        detail.innerHTML = `
          <div class="ecosystem-detail-empty">
            <span class="ecosystem-detail-empty-mark" aria-hidden="true">◈</span>
            <p class="section-kicker">Start with a segment</p>
            <h3>Select a segment to see how it connects.</h3>
            <p>Web3 Carnival links ${segments.length} stakeholder segments across ${tracks.length} tracks and ${speakerCount} speakers — pick one to open its part of the map.</p>
          </div>`;
        return;
      }

      const segment = segments.find(s => s.id === state.selectedId);
      if (!segment) return;

      const segTracks = tracksForSegment(segment);
      const segSpeakers = speakersForSegment(segment);
      const segOpportunities = opportunitiesForSegment(segment);
      const primaryOpportunity = segOpportunities[0];

      const tracksHtml = segTracks.length
        ? segTracks.map(track => `
            <a class="ecosystem-chip" href="tracks.html#${escapeHtml(track.id)}">
              <span aria-hidden="true">${escapeHtml(track.icon)}</span>
              <span>${escapeHtml(track.name)}</span>
              <small>${sessionCountForTrack(track.id)} sessions</small>
            </a>`).join('')
        : '<p class="ecosystem-detail-empty-note">No tracks linked yet.</p>';

      const speakersHtml = segSpeakers.length
        ? segSpeakers.map(speaker => `
            <a class="ecosystem-speaker-chip" href="speakers.html#${escapeHtml(speaker.id)}">
              <span class="ecosystem-speaker-chip-photo">
                <img src="${escapeHtml(speaker.photo)}" alt="" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.hidden=false;">
                <span hidden aria-hidden="true">${escapeHtml(speaker.initials)}</span>
              </span>
              <span class="ecosystem-speaker-chip-copy">
                <strong>${escapeHtml(speaker.name)}</strong>
                <small>${escapeHtml(speaker.role)}</small>
              </span>
            </a>`).join('')
        : '<p class="ecosystem-detail-empty-note">No speakers linked yet.</p>';

      const opportunitiesHtml = segOpportunities.length
        ? segOpportunities.map(o => `
            <a class="ecosystem-chip ecosystem-chip-outline" href="register.html?type=${encodeURIComponent(o.id)}">
              <span>${escapeHtml(o.title)}</span>
            </a>`).join('')
        : '<p class="ecosystem-detail-empty-note">No paths linked yet.</p>';

      detail.innerHTML = `
        <div class="ecosystem-detail-head">
          <span class="ecosystem-detail-icon" aria-hidden="true">${escapeHtml(segment.icon)}</span>
          <div>
            <p class="section-kicker">Selected segment</p>
            <h3 id="ecosystem-detail-title">${escapeHtml(segment.name)}</h3>
          </div>
        </div>
        <p class="ecosystem-detail-desc">${escapeHtml(segment.description)}</p>

        <div class="ecosystem-detail-section">
          <h4>Related tracks</h4>
          <div class="ecosystem-chip-row">${tracksHtml}</div>
        </div>

        <div class="ecosystem-detail-section">
          <h4>Speakers in this space</h4>
          <div class="ecosystem-speaker-row">${speakersHtml}</div>
        </div>

        <div class="ecosystem-detail-section">
          <h4>Ways to get involved</h4>
          <div class="ecosystem-chip-row">${opportunitiesHtml}</div>
        </div>

        <div class="ecosystem-detail-cta">
          ${primaryOpportunity
            ? `<a class="btn btn-primary" href="register.html?type=${encodeURIComponent(primaryOpportunity.id)}">${escapeHtml(CTA_LABELS[primaryOpportunity.id] || 'Get Involved')}</a>`
            : `<a class="btn btn-primary" href="register.html">Register</a>`}
          ${segTracks[0] ? `<a class="btn btn-secondary" href="tracks.html#${escapeHtml(segTracks[0].id)}">Explore ${escapeHtml(segTracks[0].name)} ↗</a>` : ''}
        </div>`;
    }

    function render() {
      renderNodes();
      renderLines();
      renderHub();
      renderDetail();
    }

    /* ------------------------------------------------------------------ */
    /* Selection                                                            */
    /* ------------------------------------------------------------------ */
    function selectSegment(id, updateHash) {
      const exists = segments.some(s => s.id === id);
      if (!exists) return;
      // Re-render replaces the node buttons, which would otherwise drop
      // keyboard focus off the ring entirely — remember it, then restore.
      const hadFocus = nodesWrap.contains(document.activeElement);

      state.selectedId = id;
      render();
      if (updateHash) history.replaceState(null, '', `ecosystem.html#${encodeURIComponent(id)}`);

      if (hadFocus) {
        const reselected = nodesWrap.querySelector(`[data-segment-id="${CSS.escape(id)}"]`);
        if (reselected) reselected.focus({ preventScroll: true });
      }

      // On mobile, the detail panel sits right after the grid — bring it
      // into view without yanking desktop users, whose panel is already
      // visible alongside the graph.
      if (window.matchMedia('(max-width: 1023px)').matches) {
        detail.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }
    }

    function clearSelection() {
      state.selectedId = null;
      render();
      history.replaceState(null, '', 'ecosystem.html');
    }

    if (hubBtn) {
      hubBtn.addEventListener('click', clearSelection);
    }

    /* ------------------------------------------------------------------ */
    /* Keyboard: arrow keys move focus around the ring (desktop graph);   */
    /* Tab order alone already covers list/grid navigation on mobile.     */
    /* ------------------------------------------------------------------ */
    function onNodeKeydown(e) {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();

      const buttons = Array.from(nodesWrap.querySelectorAll('[data-segment-id]'));
      const currentIndex = buttons.indexOf(e.currentTarget);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % buttons.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') nextIndex = 0;
      else if (e.key === 'End') nextIndex = buttons.length - 1;

      buttons[nextIndex].focus();
    }

    /* ------------------------------------------------------------------ */
    /* Init — deep link via ecosystem.html#segment-id, else overview      */
    /* ------------------------------------------------------------------ */
    const initialHash = window.location.hash.replace('#', '');
    if (segments.some(s => s.id === initialHash)) state.selectedId = initialHash;

    render();

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (segments.some(s => s.id === hash)) selectSegment(hash, false);
      else if (!hash) clearSelection();
    });
  });
})();
