/**
 * Web3 Carnival — Phase 7 Sponsors & Partners
 * Reads exclusively from WEB3_CARNIVAL_DATA (js/data.js): the real
 * partnerTiers names, the new partnerCategories/partnerSpotlights/
 * partnerValueProps records, the real `stats`, and the real
 * getInvolvedPaths. Ticketing and Community have no confirmed named
 * partner in the supplied foundation, so those two tiers render as
 * clearly labeled placeholder slots rather than invented company names.
 * Scoped entirely to partners.html via [data-partners-page].
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-partners-page]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const tiers = Array.isArray(data.partnerTiers) ? data.partnerTiers : [];
    const categoriesRaw = Array.isArray(data.partnerCategories) ? data.partnerCategories : [];
    const spotlights = Array.isArray(data.partnerSpotlights) ? data.partnerSpotlights : [];
    const valueProps = Array.isArray(data.partnerValueProps) ? data.partnerValueProps : [];
    const stats = Array.isArray(data.stats) ? data.stats : [];
    const involvePaths = Array.isArray(data.getInvolvedPaths) ? data.getInvolvedPaths : [];

    if (!categoriesRaw.length) return;

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));


    /**
     * Render a consistent monochrome SVG icon for partner categories.
     * @param {string} id Partner category identifier.
     * @returns {string} Inline SVG markup.
     */
    function renderPartnerIcon(id) {
      const paths = {
        sponsor: '<path d="M12 3v18M7 6h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"/>',
        payment: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
        ticketing: '<path d="M5 5h14v14H5z"/><path d="M9 5v14M15 5v14"/>',
        community: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20c.7-3 2.5-5 5-5s4.3 2 5 5M11 20c.7-3 2.5-5 5-5s4.3 2 5 5"/>',
        media: '<path d="M4 5h16v14H4z"/><path d="m10 9 5 3-5 3V9Z"/>',
        speaker: '<path d="M12 14a4 4 0 1 0-4-4v5a4 4 0 0 0 8 0v-5"/><path d="M5 13v1a7 7 0 0 0 14 0v-1"/><path d="M12 21v-3"/>',
        volunteer: '<path d="M8 12a4 4 0 1 0-4-4"/><path d="M16 12a4 4 0 1 1 4-4"/><path d="M4 20c0-3 2-5 5-5h6c3 0 5 2 5 5"/>',
        demo: '<path d="M7 4h10v16H7z"/><path d="m10 9 5 3-5 3V9Z"/>',
        global: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
      };
      const key = /payment/i.test(id) ? 'payment' : /ticket/i.test(id) ? 'ticketing' : /community/i.test(id) ? 'community' : /media/i.test(id) ? 'media' : /speaker/i.test(id) ? 'speaker' : /volunteer/i.test(id) ? 'volunteer' : /demo/i.test(id) ? 'demo' : /global/i.test(id) ? 'global' : 'sponsor';
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key]}</svg>`;
    }

    // Resolve each category's real partner list from partnerTiers by index
    // (single source of truth — names are never retyped here), or mark it
    // as a placeholder-only category when no tierIndex is supplied.
    const categories = categoriesRaw.map(cat => {
      const sourceTier = (cat.tierIndex !== null && cat.tierIndex !== undefined) ? tiers[cat.tierIndex] : null;
      const partners = sourceTier && Array.isArray(sourceTier.partners) ? sourceTier.partners : [];
      const placeholderCount = partners.length ? 0 : (cat.placeholderCount || 0);
      return Object.assign({}, cat, { partners, placeholderCount });
    });

    const totalRealPartners = categories.reduce((sum, cat) => sum + cat.partners.length, 0);

    const els = {
      heroStats: root.querySelector('[data-partners-hero-stats]'),
      categoryNav: root.querySelector('[data-partner-category-nav]'),
      wall: root.querySelector('[data-partner-wall]'),
      wallCount: root.querySelector('[data-partner-count]'),
      spotlights: root.querySelector('[data-partner-spotlights]'),
      valueProps: root.querySelector('[data-partner-value-props]'),
      involveGrid: root.querySelector('[data-involve-grid]')
    };

    /* ---------- 1. Hero trust stats (real numbers from data.stats) ---------- */
    function renderHeroStats() {
      if (!els.heroStats || !stats.length) return;
      els.heroStats.innerHTML = stats.map(stat => `
        <div class="speakers-hero-stat">
          <strong data-counter-target="${escapeHtml(stat.value)}" data-counter-suffix="${escapeHtml(stat.suffix || '')}">0</strong>
          <span>${escapeHtml(stat.label)}</span>
        </div>
      `).join('');
    }

    /* ---------- 2. Category navigation (anchor pills + scrollspy) ---------- */
    function renderCategoryNav() {
      if (!els.categoryNav) return;
      els.categoryNav.innerHTML = categories.map((cat, i) => {
        const count = cat.partners.length || cat.placeholderCount;
        return `
          <a href="#partner-tier-${cat.id}" class="partner-category-link${i === 0 ? ' is-active' : ''}" data-category-link="${cat.id}">
            <span aria-hidden="true">${renderPartnerIcon(cat.id)}</span>
            <span>${escapeHtml(cat.label)}</span>
            <span class="partner-category-count">${count}</span>
          </a>
        `;
      }).join('');
    }

    function initScrollSpy() {
      const links = Array.from(root.querySelectorAll('[data-category-link]'));
      const sections = categories
        .map(cat => root.querySelector(`#partner-tier-${cat.id}`))
        .filter(Boolean);
      if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

      const linkById = Object.fromEntries(links.map(a => [a.getAttribute('data-category-link'), a]));

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('data-tier-id');
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('data-category-link') === id));
        });
      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

      sections.forEach(section => observer.observe(section));
    }

    /* ---------- 3. Logo wall, grouped by tier ---------- */
    function renderWall() {
      if (!els.wall) return;

      els.wall.innerHTML = categories.map(cat => {
        const realTiles = cat.partners.map(name => `<div class="partner-tile">${escapeHtml(name)}</div>`).join('');
        const placeholderTiles = Array.from({ length: cat.placeholderCount }).map((_, i) => `
          <div class="partner-tile is-placeholder">
            <span class="partner-tile-label">${escapeHtml(cat.tierLabel)}</span>
            <span class="partner-placeholder-tag">Open partnership</span>
          </div>
        `).join('');

        const note = cat.placeholderCount
          ? `<p class="archive-gallery-note">${escapeHtml(cat.tierLabel)} is currently an open partnership opportunity in the supplied foundation.</p>`
          : '';

        return `
          <div class="partner-tier-block" id="partner-tier-${cat.id}" data-tier-id="${cat.id}">
            <div class="partner-tier-header">
              <div class="partner-tier-icon" aria-hidden="true">${renderPartnerIcon(cat.id)}</div>
              <div>
                <h3 class="partner-tier-name">${escapeHtml(cat.label)}</h3>
                <p class="partner-tier-desc">${escapeHtml(cat.description)}</p>
              </div>
            </div>
            <div class="partner-grid">${realTiles}${placeholderTiles}</div>
            ${note}
          </div>
        `;
      }).join('');

      if (els.wallCount) {
        els.wallCount.textContent = `${totalRealPartners}+ named partners across ${categories.length} tiers`;
      }
    }

    /* ---------- 4. Selected partner story / feature ---------- */
    function renderSpotlights() {
      if (!els.spotlights || !spotlights.length) return;
      els.spotlights.innerHTML = spotlights.map(s => `
        <article class="card partner-spotlight-card">
          <div class="partner-spotlight-top">
            <span class="partner-spotlight-name">${escapeHtml(s.partner)}</span>
            <span class="partner-spotlight-tier">${escapeHtml(s.tierLabel)}</span>
          </div>
          <p class="partner-spotlight-blurb">${escapeHtml(s.blurb)}</p>
          <div class="partner-spotlight-footer">
            <span>${escapeHtml(s.focus)}</span>
            <a href="#partner-tier-${escapeHtml(s.categoryId)}">View tier &rarr;</a>
          </div>
        </article>
      `).join('');
    }

    /* ---------- 5. Partnership value proposition ---------- */
    function renderValueProps() {
      if (!els.valueProps || !valueProps.length) return;
      els.valueProps.innerHTML = valueProps.map(v => `
        <div class="card value-prop-card">
          <div class="value-prop-icon" aria-hidden="true">${renderPartnerIcon((v.id || v.title || 'sponsor').toLowerCase())}</div>
          <h3>${escapeHtml(v.title)}</h3>
          <p>${escapeHtml(v.desc)}</p>
        </div>
      `).join('');
    }

    /* ---------- 7. Get Involved paths (real 6 application types) ---------- */
    function renderInvolve() {
      if (!els.involveGrid || !involvePaths.length) return;
      els.involveGrid.innerHTML = involvePaths.map(path => `
        <div class="card involve-card">
          <div class="value-prop-icon" aria-hidden="true">${renderPartnerIcon(path.id)}</div>
          <h3>${escapeHtml(path.title)}</h3>
          <p>${escapeHtml(path.description)}</p>
          <a href="register.html?type=${encodeURIComponent(path.id)}" class="btn btn-secondary btn-sm">Apply as ${escapeHtml(path.title)}</a>
        </div>
      `).join('');
    }

    function init() {
      renderHeroStats();
      renderCategoryNav();
      renderWall();
      renderSpotlights();
      renderValueProps();
      renderInvolve();
      initScrollSpy();
    }

    init();
  });
})();
