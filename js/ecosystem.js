/**
 * Web3 Carnival — Phase 6 Ecosystem & Relationship Map
 * Interactive node-link explorer connecting the 8 real stakeholder segments
 * to their respective tracks, speakers, and sessions.
 * Keyboard operable and screen-reader accessible.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-ecosystem-page]');
    if (!root || typeof WEB3_CARNIVAL_DATA === 'undefined') return;

    const data = WEB3_CARNIVAL_DATA;
    const segments = Array.isArray(data.ecosystemSegments) ? data.ecosystemSegments : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const speakers = Array.isArray(data.speakers) ? data.speakers : [];
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    if (!segments.length) return;

    // Segment connection mappings to tracks and audience icons
    const segmentMeta = {
      startups: {
        icon: 'rocket',
        badge: 'Builders & Disruptors',
        tracks: ['defi', 'nft', 'infra'],
        roleGoal: 'super-demo',
        focusText: 'Founders and early-stage protocol teams looking to showcase breakthrough architectures, hire high-throughput developers, and secure capital from top Web3 venture funds.',
        opportunities: ['Pitch on Super Demo Stage', '1-on-1 Investor Matchmaking', 'Grant & Ecosystem Sourcing']
      },
      enthusiasts: {
        icon: 'bolt',
        badge: 'Community & Culture',
        tracks: ['metaverse', 'nft', 'dao'],
        roleGoal: 'attend',
        focusText: 'Active on-chain users, DAO voters, and decentralization advocates exploring sovereign identity, immersive digital economies, and culture drops.',
        opportunities: ['Exclusive Side Events & Parties', 'Hands-on Web3 Workshops', 'Digital Event Pass & Phygital Merch']
      },
      developers: {
        icon: 'code',
        badge: 'Protocol Engineers',
        tracks: ['infra', 'zk', 'defi'],
        roleGoal: 'attend',
        focusText: 'Engineers deploying smart contracts, rollup proofs, and cross-chain message relays. Looking for deep technical teardowns rather than sales pitches.',
        opportunities: ['ZK Cryptography Deep-Dives', 'Hands-on Hack Rooms', 'Direct Core Protocol Architect Access']
      },
      investors: {
        icon: 'briefcase',
        badge: 'Capital Allocators',
        tracks: ['defi', 'enterprise', 'infra'],
        roleGoal: 'attend',
        focusText: 'Venture funds, angel syndicates, and family offices tracking institutional capital deployment, treasury stability, and early-stage deal flow.',
        opportunities: ['Closed-Door Allocator Lounges', '1,500+ Vetted Startup Pipeline', 'Ecosystem Growth Panels']
      },
      policymakers: {
        icon: 'scale',
        badge: 'Legal & Governance',
        tracks: ['dao', 'enterprise', 'zk'],
        roleGoal: 'attend',
        focusText: 'Regulators, policy advisors, and legal minds bridging compliance, sovereign governance, and real-world asset tokenization across international borders.',
        opportunities: ['Cross-Border Regulatory Roundtables', 'Compliance Framework Case Studies', 'Institutional Privacy Workshops']
      },
      enterprises: {
        icon: 'building',
        badge: 'Fortune 500 & Institutional',
        tracks: ['enterprise', 'zk', 'defi'],
        roleGoal: 'sponsor',
        focusText: 'Corporate leaders deploying permissioned-to-public bridges, supply chain provenance, dynamic asset tokenization, and institutional staking.',
        opportunities: ['Enterprise Consortium Case Studies', 'RWA Tokenization Playbooks', 'Strategic Brand Integrations']
      },
      academia: {
        icon: 'academic',
        badge: 'Research & Labs',
        tracks: ['zk', 'infra', 'dao'],
        roleGoal: 'attend',
        focusText: 'University blockchain societies, cryptography PhDs, and research labs translating groundbreaking academic whitepapers into production protocols.',
        opportunities: ['Applied Cryptography Research Stages', 'Academic Society Meetups', 'Student & Researcher Grants']
      },
      incubators: {
        icon: 'seed',
        badge: 'Accelerators & Hubs',
        tracks: ['defi', 'nft', 'enterprise'],
        roleGoal: 'community',
        focusText: 'Global growth hubs, developer guilds, and venture studios scaling Web3 talent from ideation to initial cohort funding.',
        opportunities: ['Cohort Stage Demo Slots', 'Community Partner Pavilion', 'Global Hub Alliance Meetings']
      }
    };

    let activeSegmentId = segments[0].id;

    // Check URL hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && segments.some(s => s.id === initialHash)) {
      activeSegmentId = initialHash;
    }

    const els = {
      nodesGrid: root.querySelector('[data-ecosystem-nodes]'),
      detailsPanel: root.querySelector('[data-ecosystem-details]'),
      filterBar: root.querySelector('[data-ecosystem-filter-bar]')
    };

    function escapeHtml(val) {
      return String(val ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[char]));
    }


    /**
     * Render a compact monochrome SVG icon for a stakeholder segment.
     * @param {string} name Semantic icon name.
     * @returns {string} Sanitized inline SVG markup.
     */
    /**
     * Determine whether a speaker image is a generic placeholder service.
     * @param {string} photo Source URL.
     * @returns {boolean} True when the source is not a supplied portrait.
     */
    function isPlaceholderPhoto(photo) {
      return !photo || /pravatar\.cc/i.test(String(photo));
    }

    function renderIcon(name) {
      const paths = {
        rocket: '<path d="M14.5 3.5c2.8-.3 4.6.5 6 1.9.1 1.4-.5 3.2-1.9 6l-5.1 5.1-5-5 6-8Z"/><path d="m8.5 11.5-3 1-2 4 4-2 1-3Z"/><path d="m12.5 15.5-1 3-4 2 2-4 3-1Z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
        bolt: '<path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z"/>',
        code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
        briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
        scale: '<path d="M12 3v18M6 5h12M5 7l-3 5a4 4 0 0 0 6 0L5 7ZM19 7l-3 5a4 4 0 0 0 6 0l-3-5ZM8 21h8"/>',
        building: '<path d="M4 21V5l8-3 8 3v16M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/>',
        academic: '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11v5c2.8 2.1 7.2 2.1 10 0v-5M21 9v7"/>',
        seed: '<path d="M12 21c0-7 2-11 8-14-1 7-4 11-8 11M12 21c0-5-2-8-7-11 0 6 2 9 7 11Z"/><path d="M12 21V10"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>'
      };
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.globe}</svg>`;
    }

    function renderNodes() {
      if (!els.nodesGrid) return;

      els.nodesGrid.innerHTML = segments.map((seg, idx) => {
        const meta = segmentMeta[seg.id] || { icon: 'globe', badge: 'Segment', tracks: [] };
        const isActive = seg.id === activeSegmentId;
        const connectedTracks = tracks.filter(t => meta.tracks.includes(t.id));

        return `
          <button type="button"
                  class="ecosystem-card ecosystem-map-node ecosystem-map-node--${idx + 1}${isActive ? ' is-active' : ''}"
                  data-segment-id="${seg.id}"
                  id="eco-node-${seg.id}"
                  role="tab"
                  aria-selected="${isActive ? 'true' : 'false'}"
                  aria-controls="eco-details-panel"
                  tabindex="${isActive ? '0' : '-1'}">
            <div class="ecosystem-card-top">
              <div class="ecosystem-card-icon" aria-hidden="true">${renderIcon(meta.icon)}</div>
              <span class="ecosystem-card-badge">${escapeHtml(meta.badge)}</span>
            </div>
            <h3 class="ecosystem-card-name">${escapeHtml(seg.name)}</h3>
            <p class="ecosystem-card-desc">${escapeHtml(seg.description)}</p>
            <div class="ecosystem-card-tags">
              ${connectedTracks.map(t => `<span class="pill pill-accent">${escapeHtml(t.name.split(' ')[0])}</span>`).join('')}
            </div>
          </button>
        `;
      }).join('');

      const buttons = els.nodesGrid.querySelectorAll('[data-segment-id]');
      buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          setActiveSegment(btn.dataset.segmentId, true);
        });

        btn.addEventListener('keydown', (e) => {
          let targetIndex = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            targetIndex = (index + 1) % buttons.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            targetIndex = (index - 1 + buttons.length) % buttons.length;
          } else if (e.key === 'Home') {
            targetIndex = 0;
          } else if (e.key === 'End') {
            targetIndex = buttons.length - 1;
          }

          if (targetIndex !== null) {
            e.preventDefault();
            buttons[targetIndex].focus();
            setActiveSegment(buttons[targetIndex].dataset.segmentId, false);
          }
        });
      });
    }

    function renderDetails() {
      if (!els.detailsPanel) return;

      const seg = segments.find(s => s.id === activeSegmentId) || segments[0];
      const meta = segmentMeta[seg.id] || { icon: 'globe', badge: 'Segment', tracks: [], focusText: '', opportunities: [] };
      const activeNodeId = `eco-node-${seg.id}`;
      els.detailsPanel.setAttribute('aria-labelledby', activeNodeId);
      const connectedTracks = tracks.filter(t => meta.tracks.includes(t.id));
      const connectedSpeakers = speakers.filter(s => (s.trackIds || []).some(tid => meta.tracks.includes(tid))).slice(0, 3);

      els.detailsPanel.innerHTML = `
        <div class="ecosystem-details-header">
          <div class="ecosystem-details-icon" aria-hidden="true">${renderIcon(meta.icon)}</div>
          <div>
            <span class="section-eyebrow">${escapeHtml(meta.badge)}</span>
            <h2 class="ecosystem-details-title">${escapeHtml(seg.name)}</h2>
            <p class="ecosystem-details-lead">${escapeHtml(seg.description)}</p>
          </div>
        </div>

        <div class="ecosystem-conn-section">
          <p class="section-desc ecosystem-details-focus">${escapeHtml(meta.focusText)}</p>
          <p class="ecosystem-conn-title">Key On-Site Opportunities</p>
          <ul class="ecosystem-opportunity-list">
            ${(meta.opportunities || []).map(op => `
              <li class="ecosystem-opportunity-item">
                <span class="ecosystem-opportunity-mark" aria-hidden="true">✦</span>
                <span>${escapeHtml(op)}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="ecosystem-conn-section">
          <p class="ecosystem-conn-title">Connected Thematic Tracks</p>
          <div class="ecosystem-conn-list">
            ${connectedTracks.map(t => `
              <a href="tracks.html#${t.id}" class="ecosystem-conn-item">
                <span>${escapeHtml(t.name)}</span>
                <span>Explore Track &rarr;</span>
              </a>
            `).join('')}
          </div>
        </div>

        <div class="ecosystem-conn-section">
          <p class="ecosystem-conn-title">Key Speakers In This Sphere</p>
          <div class="ecosystem-speaker-list">
            ${connectedSpeakers.map(sp => `
              <div class="ecosystem-speaker-row">
                <span class="ecosystem-speaker-avatar" aria-hidden="true">
                  ${isPlaceholderPhoto(sp.photo) ? `<span class="ecosystem-speaker-initials">${escapeHtml(sp.initials || '')}</span>` : `<img src="${escapeHtml(sp.photo)}" alt="Portrait of ${escapeHtml(sp.name)}" loading="lazy" data-fallback-image><span class="ecosystem-speaker-initials" hidden>${escapeHtml(sp.initials || '')}</span>`}
                </span>
                <div class="ecosystem-speaker-copy">
                  <strong>${escapeHtml(sp.name)}</strong>
                  <span>${escapeHtml(sp.role)}</span>
                </div>
                <a href="speakers.html#${encodeURIComponent(sp.id)}" class="ecosystem-speaker-link">View &rarr;</a>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="ecosystem-details-actions">
          <a href="register.html?goal=${encodeURIComponent(meta.roleGoal || 'attend')}" class="btn btn-primary btn-sm">Register as ${escapeHtml(seg.name)}</a>
          <a href="tracks.html" class="btn btn-secondary btn-sm">Explore Tracks</a>
        </div>
      `;
    }

    function setActiveSegment(id, updateHash) {
      activeSegmentId = id;
      renderNodes();
      renderDetails();

      if (updateHash) {
        history.replaceState(null, '', `ecosystem.html#${encodeURIComponent(id)}`);
      }

      // Below the two-column breakpoint (css/pages.css .ecosystem-layout,
      // min-width: 1024px) the details panel renders below all 8 stakeholder
      // cards, so a selection needs to bring it into view instead of
      // leaving the user looking at the card grid they just tapped.
      if (els.detailsPanel && window.matchMedia('(max-width: 1023px)').matches) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        els.detailsPanel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function init() {
      renderNodes();
      renderDetails();
    }

    init();
  });
})();
