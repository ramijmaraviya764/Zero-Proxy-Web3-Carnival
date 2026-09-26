/**
 * Web3 Carnival — Phase 5 Past Events / Archive
 * Reads exclusively from WEB3_CARNIVAL_DATA (js/data.js) — the 3 documented
 * editions plus the real upcoming eventDetails/partnerTiers records.
 * No per-edition speaker/partner attribution and no photography exist in the
 * supplied content, so those sections render clearly-labeled placeholders
 * rather than invented specifics (per the brief).
 * Scoped entirely to past-events.html via [data-past-events-page].
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-past-events-page]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const editions = Array.isArray(data.pastEvents) ? data.pastEvents.slice() : [];
    if (!editions.length) return;

    const eventDetails = data.eventDetails || {};
    const partnerTiers = Array.isArray(data.partnerTiers) ? data.partnerTiers : [];
    const editionById = Object.fromEntries(editions.map(e => [e.id, e]));

    const metaRow = root.querySelector('[data-editions-meta-row]');
    const timelineWrap = root.querySelector('[data-editions-timeline]');
    const filterBar = root.querySelector('[data-editions-filter-bar]');
    const cardsGrid = root.querySelector('[data-editions-grid]');
    const cardsCount = root.querySelector('[data-editions-count]');
    const detailShell = root.querySelector('[data-edition-detail]');
    const statsGrid = root.querySelector('[data-edition-stats]');
    const compareWrap = root.querySelector('[data-edition-compare]');
    const galleryHeading = root.querySelector('[data-gallery-heading]');
    const galleryGrid = root.querySelector('[data-archive-gallery]');
    const rosterHeading = root.querySelector('[data-roster-heading]');
    const rosterChips = root.querySelector('[data-archive-roster-chips]');

    const state = {
      selectedId: editions[0].id,
      filterYear: 'all'
    };

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));

    const isReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const maxAttendees = Math.max(...editions.map(e => e.attendeesValue || 0));
    const totalAttendees = editions.reduce((sum, e) => sum + (e.attendeesValue || 0), 0);
    const countries = Array.from(new Set(editions.map(e => e.country).filter(Boolean)));
    const years = editions.map(e => parseInt(e.year, 10)).filter(n => !isNaN(n));
    const yearSpanLabel = years.length ? `${Math.min(...years)}\u2013${Math.max(...years)}` : '\u2014';

    /* ---------- 1. Intro meta row ---------- */
    function renderMetaRow() {
      if (!metaRow) return;
      const items = [
        { value: String(editions.length), label: 'Documented editions' },
        { value: yearSpanLabel, label: 'Years spanned' },
        { value: String(countries.length), label: 'Countries hosted' },
        { value: totalAttendees.toLocaleString() + '+', label: 'Combined attendees on record' }
      ];
      metaRow.innerHTML = items.map(item => `
        <div class="editions-meta-item">
          <span class="editions-meta-value">${escapeHtml(item.value)}</span>
          <span class="editions-meta-label">${escapeHtml(item.label)}</span>
        </div>`).join('');
    }

    /* ---------- 2. Timeline ---------- */
    function renderTimeline() {
      if (!timelineWrap) return;
      const chronological = editions.slice().sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

      const nodes = chronological.map(edition => {
        const selected = state.selectedId === edition.id;
        const dimmed = state.filterYear !== 'all' && state.filterYear !== edition.year;
        return `
          <button type="button" class="editions-timeline-node${selected ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}"
            data-timeline-id="${escapeHtml(edition.id)}" aria-pressed="${selected ? 'true' : 'false'}">
            <span class="editions-timeline-node-dot" aria-hidden="true"></span>
            <span class="editions-timeline-node-year">${escapeHtml(edition.year)}</span>
            <span class="editions-timeline-node-label">${escapeHtml(edition.location)}</span>
          </button>`;
      }).join('');

      const upcomingYear = (eventDetails.dateLabel || '').match(/\d{4}/);
      const upcomingNode = `
        <a class="editions-timeline-node is-upcoming" href="event.html">
          <span class="editions-timeline-node-dot" aria-hidden="true"></span>
          <span class="editions-timeline-node-year">${escapeHtml(upcomingYear ? upcomingYear[0] : 'Next')}</span>
          <span class="editions-timeline-node-label">Next edition &middot; ${escapeHtml(eventDetails.location || 'TBA')}</span>
        </a>`;

      timelineWrap.innerHTML = nodes + upcomingNode;

      timelineWrap.querySelectorAll('[data-timeline-id]').forEach(button => {
        button.addEventListener('click', () => selectEdition(button.dataset.timelineId, true));
      });
    }

    /* ---------- 3. Filterable edition cards ---------- */
    function filteredEditions() {
      if (state.filterYear === 'all') return editions;
      return editions.filter(e => e.year === state.filterYear);
    }

    function renderCards() {
      if (!cardsGrid) return;
      const visible = filteredEditions();

      if (cardsCount) {
        cardsCount.textContent = `${visible.length} of ${editions.length} edition${editions.length === 1 ? '' : 's'}`;
      }

      if (!visible.length) {
        cardsGrid.innerHTML = '<div class="explorer-empty"><strong>No edition for that year.</strong><span>Choose a different year, or select "All editions".</span></div>';
        return;
      }

      cardsGrid.innerHTML = visible.map(edition => {
        const selected = state.selectedId === edition.id;
        return `
          <button type="button" class="edition-card${selected ? ' is-selected' : ''}" data-edition-id="${escapeHtml(edition.id)}" aria-pressed="${selected ? 'true' : 'false'}">
            <span class="edition-card-banner" aria-hidden="true">${escapeHtml(edition.icon)}</span>
            <span class="edition-card-body">
              <span class="edition-card-top">
                <span class="edition-card-name">${escapeHtml(edition.edition)}</span>
                <span class="pill pill-cyan">${escapeHtml(edition.year)}</span>
              </span>
              <span class="edition-card-meta">
                <span>${escapeHtml(edition.location)}</span>
                <span>${escapeHtml(edition.attendees)}</span>
              </span>
              <span class="edition-card-cta">${selected ? 'Currently selected' : 'View edition \u2197'}</span>
            </span>
          </button>`;
      }).join('');

      cardsGrid.querySelectorAll('[data-edition-id]').forEach(button => {
        button.addEventListener('click', () => selectEdition(button.dataset.editionId, false));
      });
    }

    /* ---------- 4. Selected edition highlight ---------- */
    function renderDetail() {
      if (!detailShell) return;
      const edition = editionById[state.selectedId];
      if (!edition) return;

      const isLargest = edition.attendeesValue === maxAttendees;

      detailShell.innerHTML = `
        <div class="edition-detail-visual" aria-hidden="true">
          <span class="edition-detail-visual-tag pill pill-accent">Archived Edition</span>
          ${escapeHtml(edition.icon)}
        </div>
        <div class="edition-detail-copy">
          <h3 id="edition-detail-title">${escapeHtml(edition.edition)}</h3>
          <div class="edition-detail-meta-row">
            <span class="pill">${escapeHtml(edition.location)}</span>
            <span class="pill">${escapeHtml(edition.year)}</span>
            ${isLargest ? '<span class="pill pill-cyan">Largest on record</span>' : ''}
          </div>
          <p class="edition-detail-summary">${escapeHtml(edition.summary)}</p>
          <div class="edition-detail-stat">
            <strong>${escapeHtml(edition.attendees.replace(' Attendees', ''))}</strong>
            <span>documented attendees</span>
          </div>
        </div>`;
    }

    /* ---------- 5. Statistics + attendance comparison ---------- */
    function initCounters(container) {
      const els = container.querySelectorAll('[data-edition-counter-target]');
      if (!els.length) return;

      if (isReducedMotion() || !('IntersectionObserver' in window)) {
        els.forEach(el => {
          const target = el.getAttribute('data-edition-counter-target');
          const suffix = el.getAttribute('data-edition-counter-suffix') || '';
          el.textContent = target + suffix;
        });
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          obs.unobserve(el);
          const target = parseInt(el.getAttribute('data-edition-counter-target'), 10);
          const suffix = el.getAttribute('data-edition-counter-suffix') || '';
          const duration = 1000;
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString() + suffix;
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.3 });

      els.forEach(el => observer.observe(el));
    }

    function renderStats() {
      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="stat-block">
            <span class="stat-numeral" data-edition-counter-target="${editions.length}">0</span>
            <span class="stat-label">Documented editions</span>
          </div>
          <div class="stat-block">
            <span class="stat-numeral" data-edition-counter-target="${countries.length}">0</span>
            <span class="stat-label">Countries hosted</span>
          </div>
          <div class="stat-block">
            <span class="stat-numeral" data-edition-counter-target="${totalAttendees}" data-edition-counter-suffix="+">0</span>
            <span class="stat-label">Combined attendees on record</span>
          </div>
          <div class="stat-block">
            <span class="stat-numeral">${escapeHtml(yearSpanLabel)}</span>
            <span class="stat-label">Years spanned</span>
          </div>`;
        initCounters(statsGrid);
      }

      if (compareWrap) {
        const chronological = editions.slice().sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
        compareWrap.innerHTML = chronological.map(edition => {
          const pct = maxAttendees ? Math.round((edition.attendeesValue / maxAttendees) * 100) : 0;
          const selected = state.selectedId === edition.id;
          return `
            <div class="edition-compare-row">
              <span class="edition-compare-label"${selected ? ' style="color:var(--accent-cyan)"' : ''}>${escapeHtml(edition.year)}</span>
              <span class="edition-compare-track"><span class="edition-compare-fill" data-fill="${pct}" style="width:0"></span></span>
              <span class="edition-compare-value">${escapeHtml(edition.attendees)}</span>
            </div>`;
        }).join('');

        // Animate bar widths in on next frame (keeps the 0 -> value transition, reduced-motion safe).
        requestAnimationFrame(() => {
          compareWrap.querySelectorAll('[data-fill]').forEach(fill => {
            fill.style.width = isReducedMotion() ? fill.dataset.fill + '%' : fill.dataset.fill + '%';
          });
        });
      }
    }

    /* ---------- 6. Photography / highlights gallery ---------- */
    function renderGallery() {
      const edition = editionById[state.selectedId];
      if (!edition) return;

      if (galleryHeading) galleryHeading.textContent = `${edition.edition} gallery`;
      if (!galleryGrid) return;

      const angles = [135, 200, 60, 320];
      galleryGrid.innerHTML = angles.map((angle, i) => `
        <figure class="archive-gallery-tile" style="background: linear-gradient(${angle}deg, rgba(139,92,246,.22), rgba(91,95,239,.14) 45%, rgba(34,211,238,.12)), var(--bg-raised);">
          <span class="archive-gallery-badge pill pill-accent">Placeholder</span>
          <span class="archive-gallery-tile-icon" aria-hidden="true">${escapeHtml(edition.icon)}</span>
          <figcaption>${escapeHtml(edition.edition)} \u2014 ${escapeHtml(edition.location)} &middot; photo ${i + 1} of ${angles.length}, archive pending</figcaption>
        </figure>`).join('');
    }

    /* ---------- 7. Speaker / partner archive note ---------- */
    function renderRoster() {
      const edition = editionById[state.selectedId];
      if (rosterHeading && edition) rosterHeading.textContent = `Speakers & partners \u2014 ${edition.edition}`;
      if (!rosterChips) return;

      const names = [];
      partnerTiers.forEach(tier => (tier.partners || []).forEach(name => {
        if (!names.includes(name)) names.push(name);
      }));

      rosterChips.innerHTML = names.slice(0, 10).map(name =>
        `<span class="pill">${escapeHtml(name)}</span>`
      ).join('');
    }

    /* ---------- Orchestration ---------- */
    function render() {
      renderTimeline();
      renderCards();
      renderDetail();
      renderStats();
      renderGallery();
      renderRoster();
    }

    function selectEdition(id, scroll) {
      if (!editionById[id] || state.selectedId === id) {
        if (scroll) document.getElementById('edition-detail').scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      state.selectedId = id;
      render();
      if (scroll) document.getElementById('edition-detail').scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `past-events.html#${encodeURIComponent(id)}`);
    }

    if (filterBar) {
      filterBar.addEventListener('filter-changed', function (event) {
        state.filterYear = (event.detail && event.detail.filter) || 'all';
        renderTimeline();
        renderCards();
      });
    }

    renderMetaRow();

    const initialHash = window.location.hash.replace('#', '');
    if (editionById[initialHash]) state.selectedId = initialHash;

    render();
  });
})();
