/**
 * Web3 Carnival Design System - Theme Controller
 * Handles dark / light theme toggling and localStorage persistence.
 * Dark mode is the product default; the visitor OS color scheme is never
 * consulted or applied automatically.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'w3c_theme_preference';
  const THEME_ATTR = 'data-theme';

  /**
   * Determine preferred initial theme
   * Priority: 1. explicit localStorage preference -> 2. dark product default
   */
  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (e) {
      // localStorage disabled / restricted
    }

    // Dark-first product default. The visitor's OS color scheme must not
    // override the design system unless the visitor explicitly selected a
    // light theme through the site's own toggle.
    return 'dark';
  }

  /**
   * Apply theme to root <html> element
   */
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute(THEME_ATTR, 'light');
    } else {
      root.removeAttribute(THEME_ATTR); // default dark theme is root default
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'light' ? '#F7F7FB' : '#05060B');
    }

    // Update aria attributes and labels on all theme buttons
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    buttons.forEach(btn => {
      const isLight = theme === 'light';
      btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      btn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      btn.setAttribute('data-theme-target', isLight ? 'dark' : 'light');
    });

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Ignore write errors
    }
  }

  /**
   * Toggle between dark and light themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute(THEME_ATTR) === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  }

  // Apply immediately before body render to avoid flash of incorrect theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Delegate the click on `document` rather than binding to each button
  // directly. navigation.js injects the header (and its .theme-toggle-btn)
  // asynchronously on DOMContentLoaded, and script load order means this
  // file's own DOMContentLoaded handler can run before that injection
  // happens — a direct querySelectorAll + addEventListener here would find
  // zero buttons and silently never bind. Delegation works no matter when,
  // or how many times, the button is (re)rendered into the page.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle-btn');
    if (btn) toggleTheme();
  });


  // Expose toggle on window object for testing or manual triggers
  window.Web3CarnivalTheme = {
    get: () => document.documentElement.getAttribute(THEME_ATTR) || 'dark',
    set: applyTheme,
    toggle: toggleTheme
  };
})();
