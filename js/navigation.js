/**
 * Web3 Carnival Design System - Shared Navigation & Footer
 * Handles mobile menu toggle, active link detection, scroll header effects, and accessible keyboard navigation
 */

(function () {
  'use strict';

  // Navigation Links Definition
  const NAV_ITEMS = [
    { label: 'Home', href: 'index.html', id: 'home' },
    { label: 'Event', href: 'event.html', id: 'event' },
    { label: 'Tracks', href: 'tracks.html', id: 'tracks' },
    { label: 'Speakers', href: 'speakers.html', id: 'speakers' },
    { label: 'Past Events', href: 'past-events.html', id: 'past-events' },
    { label: 'Ecosystem', href: 'ecosystem.html', id: 'ecosystem' },
    { label: 'Partners', href: 'partners.html', id: 'partners' }
  ];

  /**
   * Determine current active page filename
   */
  function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('#')[0].split('?')[0];
    if (!filename || filename === '' || filename === 'index.html') {
      return 'index.html';
    }
    return filename;
  }

  /**
   * Render Standard Shared Header
   */
  function renderHeader(headerEl) {
    if (!headerEl || headerEl.children.length > 0) return;

    const currentPage = getCurrentPageName();

    const linksHtml = NAV_ITEMS.map(item => {
      const isActive = item.href === currentPage;
      return `<a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>${item.label}</a>`;
    }).join('');

    const mobileLinksHtml = NAV_ITEMS.map(item => {
      const isActive = item.href === currentPage;
      return `<a href="${item.href}" class="mobile-nav-link ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>
        <span>${item.label}</span>
        <span aria-hidden="true">&rarr;</span>
      </a>`;
    }).join('');

    headerEl.innerHTML = `
      <div class="container nav-container">
        <a href="index.html" class="nav-brand" aria-label="Web3 Carnival Home">
          <div class="nav-brand-logo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="nav-brand-text">
            <span class="nav-brand-title">Web3 Carnival</span>
            <span class="nav-brand-subtitle">World's Premier Event</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-menu" aria-label="Main Navigation">
          <div class="nav-links">
            ${linksHtml}
          </div>
        </nav>

        <!-- Nav Actions: Theme Toggle, Register CTA, Mobile Menu Button -->
        <div class="nav-actions">
          <button class="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
            <!-- Moon icon (for dark mode) -->
            <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <!-- Sun icon (for light mode) -->
            <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <a href="register.html" class="btn btn-primary" id="nav-register-btn">Register</a>

          <button class="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav-drawer">
            <span class="mobile-toggle-bar"></span>
            <span class="mobile-toggle-bar"></span>
            <span class="mobile-toggle-bar"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-nav-drawer" class="mobile-nav-drawer" aria-hidden="true">
        <nav class="mobile-nav-links" aria-label="Mobile Navigation">
          ${mobileLinksHtml}
        </nav>
        <div class="mobile-nav-cta">
          <a href="register.html" class="btn btn-primary btn-full">Register Now</a>
          <a href="contact.html" class="btn btn-secondary btn-full">Contact Team</a>
        </div>
      </div>
    `;
  }

  /**
   * Render Standard Shared Footer
   */
  function renderFooter(footerEl) {
    if (!footerEl || footerEl.children.length > 0) return;

    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <!-- Col 1: Web3 Carnival Brand -->
          <div class="footer-brand">
            <a href="index.html" class="nav-brand" aria-label="Web3 Carnival Home">
              <div class="nav-brand-logo" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div class="nav-brand-text">
                <span class="nav-brand-title">Web3 Carnival</span>
                <span class="nav-brand-subtitle">World's Premier Event</span>
              </div>
            </a>
            <p class="footer-brand-desc">
              World's premier Web3 & Blockchain gathering uniting developers, investors, enterprises, and founders shaping decentralized frontiers.
            </p>
            <div class="footer-socials" aria-label="Social media channels">
              <a href="https://twitter.com" class="social-icon-btn" aria-label="Follow us on X/Twitter" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" class="social-icon-btn" aria-label="Connect on LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://telegram.org" class="social-icon-btn" aria-label="Join our Telegram community" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.941z"/></svg>
              </a>
              <a href="https://discord.com" class="social-icon-btn" aria-label="Join Discord server" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
            </div>
          </div>

          <!-- Col 2: Get Involved -->
          <div class="footer-col">
            <h4 class="footer-col-title">Get Involved</h4>
            <ul class="footer-links-list">
              <li><a href="register.html?type=sponsor" class="footer-link">Sponsor</a></li>
              <li><a href="register.html?type=speaker" class="footer-link">Speaker</a></li>
              <li><a href="register.html?type=media" class="footer-link">Media</a></li>
              <li><a href="register.html?type=community" class="footer-link">Community Partner</a></li>
              <li><a href="register.html?type=volunteer" class="footer-link">Volunteer</a></li>
              <li><a href="register.html?type=super-demo" class="footer-link">Super Demo</a></li>
            </ul>
          </div>

          <!-- Col 3: More -->
          <div class="footer-col">
            <h4 class="footer-col-title">More</h4>
            <ul class="footer-links-list">
              <li><a href="event.html" class="footer-link">Event Schedule</a></li>
              <li><a href="tracks.html" class="footer-link">7 Tracks</a></li>
              <li><a href="speakers.html" class="footer-link">Speakers Directory</a></li>
              <li><a href="past-events.html" class="footer-link">Past Editions</a></li>
              <li><a href="ecosystem.html" class="footer-link">Ecosystem Map</a></li>
              <li><a href="partners.html" class="footer-link">Partners & Sponsors</a></li>
              <li><a href="contact.html" class="footer-link">Contact Us</a></li>
            </ul>
          </div>

          <!-- Col 4: Legal -->
          <div class="footer-col">
            <h4 class="footer-col-title">Legal</h4>
            <ul class="footer-links-list">
              <li><a href="#privacy" class="footer-link">Privacy Policy</a></li>
              <li><a href="#terms" class="footer-link">Terms of Service</a></li>
              <li><a href="#code-of-conduct" class="footer-link">Code of Conduct</a></li>
              <li><a href="#brand-kit" class="footer-link">Brand Guidelines</a></li>
            </ul>
          </div>

          <!-- Col 5: Newsletter -->
          <div class="footer-col">
            <h4 class="footer-col-title">Stay Connected</h4>
            <p class="footer-brand-desc" style="margin-bottom: var(--space-3);">
              Receive speaker announcements, track agendas, and early-bird ticket releases.
            </p>
            <form class="footer-newsletter-form" onsubmit="event.preventDefault(); alert('Thank you for subscribing to Web3 Carnival updates!'); this.reset();">
              <input type="email" class="form-input" placeholder="Enter your email" required aria-label="Email address for newsletter">
              <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
            </form>
          </div>
        </div>

        <!-- Footer Bottom Bar -->
        <div class="footer-bottom">
          <p>&copy; 2026 Web3 Carnival. All rights reserved. GDG KalaKriti Designathon FinTech Track.</p>
          <div class="footer-bottom-links">
            <a href="#privacy" class="footer-link">Privacy</a>
            <span aria-hidden="true">&bull;</span>
            <a href="#terms" class="footer-link">Terms</a>
            <span aria-hidden="true">&bull;</span>
            <a href="contact.html" class="footer-link">Help Desk</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Bind Mobile Toggle & Drawer Events
   */
  function setupMobileNavigation() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (!mobileToggle || !mobileDrawer) return;

    function openMobileMenu() {
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        mobileToggle.focus();
      }
    });

    // Close on click outside drawer
    document.addEventListener('click', (e) => {
      if (mobileToggle.getAttribute('aria-expanded') === 'true' &&
          !mobileDrawer.contains(e.target) &&
          !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close when clicking mobile nav links
    const mobileLinks = mobileDrawer.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /**
   * Sticky Nav Scroll Observer
   */
  function setupScrollHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('nav-scrolled');
      } else {
        header.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * Initialize on DOM Ready
   */
  document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
      renderHeader(headerEl);
    }

    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
      renderFooter(footerEl);
    }

    setupMobileNavigation();
    setupScrollHeader();
  });

  // Expose on window for programmatic calls if needed
  window.Web3CarnivalNav = {
    renderHeader,
    renderFooter,
    getCurrentPage: getCurrentPageName
  };
})();
