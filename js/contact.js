/**
 * Web3 Carnival — Phase 9 Contact Integration
 * Handles role-specific contact paths, dynamic form fields, frontend-only
 * mock submissions, FAQ state, local persistence, and shareable deep links.
 */
(function () {
  'use strict';

  const ROLE_STORAGE_KEY = 'w3c_contact_role';
  const DRAFT_STORAGE_PREFIX = 'w3c_contact_draft_';

  const ROLE_CONFIG = {
    attendee: {
      title: 'Attendee Support',
      eyebrow: 'Attendee Support',
      description: 'We will route your message to the attendee operations team for registration, venue, accessibility, and pass support.',
      email: 'attendees@web3carnival.world',
      registrationHref: 'register.html?type=attendee',
      fields: [
        { name: 'supportType', label: 'What do you need help with?', type: 'select', required: true, options: [
          ['ticketing', 'Registration or ticketing'],
          ['pass', 'Digital pass or badge'],
          ['accessibility', 'Accessibility or venue support'],
          ['visa', 'Visa or invitation letter'],
          ['journey', 'My Journey / event schedule']
        ] },
        { name: 'passId', label: 'Pass / Registration ID', type: 'text', required: false, placeholder: 'Optional — e.g. W3C-2026-4821' },
        { name: 'attendanceMode', label: 'Attendance mode', type: 'select', required: true, options: [
          ['in-person', 'In person — Singapore'],
          ['virtual', 'Virtual stage'],
          ['not-decided', 'Not decided yet']
        ] }
      ]
    },
    sponsor: {
      title: 'Sponsorships & Partnerships',
      eyebrow: 'Partnerships Desk',
      description: 'Tell the partnerships team what you want to achieve and they can route you to the relevant activation or sponsorship path.',
      email: 'sponsors@web3carnival.world',
      registrationHref: 'register.html?type=sponsor',
      fields: [
        { name: 'company', label: 'Company / Organization', type: 'text', required: true, placeholder: 'Company name' },
        { name: 'jobTitle', label: 'Your role', type: 'text', required: true, placeholder: 'e.g. Head of Partnerships' },
        { name: 'partnershipFocus', label: 'Primary partnership focus', type: 'select', required: true, options: [
          ['sponsorship', 'Sponsorship package'],
          ['activation', 'Custom activation / stage'],
          ['booth', 'Booth / exhibition'],
          ['enterprise', 'Enterprise partnership'],
          ['community', 'Community partnership']
        ] },
        { name: 'website', label: 'Company website', type: 'url', required: false, placeholder: 'https://example.com' }
      ]
    },
    speaker: {
      title: 'Speakers Bureau',
      eyebrow: 'Program & Speakers',
      description: 'Use this path for session proposals, panel ideas, workshops, track fit, or speaker operations.',
      email: 'program@web3carnival.world',
      registrationHref: 'register.html?type=speaker',
      fields: [
        { name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Protocol, company, university, or independent' },
        { name: 'speakerRole', label: 'Role / title', type: 'text', required: true, placeholder: 'e.g. Protocol Research Lead' },
        { name: 'track', label: 'Preferred track', type: 'select', required: true, optionsFromData: 'tracks' },
        { name: 'proposalType', label: 'Proposal type', type: 'select', required: true, options: [
          ['talk', 'Talk / keynote'],
          ['panel', 'Panel'],
          ['workshop', 'Workshop'],
          ['demo', 'Super Demo'],
          ['other', 'Other program request']
        ] },
        { name: 'profileUrl', label: 'Profile / work link', type: 'url', required: false, placeholder: 'LinkedIn, personal site, GitHub, or publication' }
      ]
    },
    media: {
      title: 'Media & Press Relations',
      eyebrow: 'Media Desk',
      description: 'Send the outlet, coverage plan, and timing so the press team can route accreditation and interview requests correctly.',
      email: 'media@web3carnival.world',
      registrationHref: 'register.html?type=media',
      fields: [
        { name: 'outlet', label: 'Media outlet', type: 'text', required: true, placeholder: 'Publication / channel name' },
        { name: 'mediaRole', label: 'Your role', type: 'text', required: true, placeholder: 'e.g. Reporter / Producer / Editor' },
        { name: 'coverageType', label: 'Coverage type', type: 'select', required: true, options: [
          ['news', 'News / editorial'],
          ['interview', 'Speaker / executive interview'],
          ['video', 'Video / livestream'],
          ['podcast', 'Podcast / audio'],
          ['research', 'Research / industry report']
        ] },
        { name: 'deadline', label: 'Publishing deadline', type: 'date', required: false },
        { name: 'workUrl', label: 'Work / outlet URL', type: 'url', required: false, placeholder: 'Link to your outlet or recent work' }
      ]
    }
  };

  /**
   * Escape a value before inserting it into generated HTML.
   *
   * @param {unknown} value Value to escape.
   * @returns {string} HTML-safe string.
   */
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  /**
   * Read a value from localStorage without allowing storage failures to break the page.
   *
   * @param {string} key Storage key.
   * @returns {string|null} Stored value or null when unavailable.
   */
  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  /**
   * Persist a value to localStorage when storage is available.
   *
   * @param {string} key Storage key.
   * @param {string} value Value to persist.
   * @returns {void}
   */
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Storage may be disabled; the page remains fully usable without it.
    }
  }

  /**
   * Remove a localStorage value when possible.
   *
   * @param {string} key Storage key.
   * @returns {void}
   */
  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore disabled storage.
    }
  }

  /**
   * Resolve the active role from the URL or persisted user selection.
   * URL state always wins so shared role-specific links remain deterministic.
   *
   * @returns {string} Valid role identifier.
   */
  function resolveInitialRole() {
    const params = new URLSearchParams(window.location.search);
    const queryRole = String(params.get('role') || params.get('channel') || '').toLowerCase();
    if (ROLE_CONFIG[queryRole]) return queryRole;

    const hashRole = window.location.hash.replace('#', '').toLowerCase();
    if (ROLE_CONFIG[hashRole]) return hashRole;

    const persistedRole = String(readStorage(ROLE_STORAGE_KEY) || '').toLowerCase();
    if (ROLE_CONFIG[persistedRole]) return persistedRole;

    return 'attendee';
  }

  /**
   * Return data-backed track options for speaker inquiries.
   *
   * @returns {Array<[string,string]>} Track id/label pairs.
   */
  function getTrackOptions() {
    const data = window.WEB3_CARNIVAL_DATA;
    if (!data || !Array.isArray(data.tracks)) return [];
    return data.tracks.map(track => [track.id, track.name]);
  }

  /**
   * Build one dynamic form field from role configuration.
   *
   * @param {Object} field Field configuration.
   * @returns {string} Rendered field HTML.
   */
  function renderField(field) {
    const requiredText = field.required ? ' required' : '';
    const requiredMark = field.required ? ' <span aria-hidden="true">*</span>' : '';
    const inputId = `contact-${field.name}`;

    if (field.type === 'select') {
      return `
        <div class="form-group">
          <label class="form-label" for="${escapeHtml(inputId)}">${escapeHtml(field.label)}${requiredMark}</label>
          <select class="form-select" id="${escapeHtml(inputId)}" name="${escapeHtml(field.name)}"${requiredText}>
            <option value="" disabled selected>Select an option</option>
            ${(field.options || []).map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')}
          </select>
        </div>`;
    }

    if (field.optionsFromData === 'tracks') {
      return `
        <div class="form-group">
          <label class="form-label" for="${escapeHtml(inputId)}">${escapeHtml(field.label)}${requiredMark}</label>
          <select class="form-select" id="${escapeHtml(inputId)}" name="${escapeHtml(field.name)}"${requiredText}>
            <option value="" disabled selected>Select a track</option>
            ${getTrackOptions().map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')}
          </select>
        </div>`;
    }

    return `
      <div class="form-group">
        <label class="form-label" for="${escapeHtml(inputId)}">${escapeHtml(field.label)}${requiredMark}</label>
        <input class="form-input" type="${escapeHtml(field.type || 'text')}" id="${escapeHtml(inputId)}" name="${escapeHtml(field.name)}"${requiredText}${field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ''}>
      </div>`;
  }

  /**
   * Load a previously saved role-specific draft.
   *
   * @param {string} role Active role.
   * @returns {Record<string,string>} Draft field values.
   */
  function loadDraft(role) {
    try {
      const raw = readStorage(`${DRAFT_STORAGE_PREFIX}${role}`);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Persist current form values for the active role.
   *
   * @param {string} role Active role.
   * @param {HTMLFormElement} form Contact form.
   * @returns {void}
   */
  function saveDraft(role, form) {
    const payload = {};
    new FormData(form).forEach((value, key) => {
      payload[key] = String(value);
    });
    writeStorage(`${DRAFT_STORAGE_PREFIX}${role}`, JSON.stringify(payload));
  }

  /**
   * Restore a previously saved draft into the current form.
   *
   * @param {Record<string,string>} draft Saved draft.
   * @param {HTMLFormElement} form Contact form.
   * @returns {void}
   */
  function applyDraft(draft, form) {
    Object.entries(draft).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (!field) return;
      if (field instanceof RadioNodeList) {
        const target = Array.from(field).find(input => input.value === value);
        if (target) target.checked = true;
      } else {
        field.value = value;
      }
    });
  }

  /**
   * Initialize the contact page and all interactive behavior.
   *
   * @returns {void}
   */
  function initContactPage() {
    const form = document.getElementById('contact-form');
    const dynamicFields = document.querySelector('[data-contact-dynamic-fields]');
    const confirmation = document.querySelector('[data-contact-confirmation]');
    const feedback = document.getElementById('contact-form-feedback');
    const roleEyebrow = document.querySelector('[data-contact-role-eyebrow]');
    const roleHeading = document.querySelector('[data-contact-form-heading]');
    const roleDescription = document.querySelector('[data-contact-form-desc]');
    const roleSwitches = Array.from(document.querySelectorAll('[data-role-switch]'));
    const roleCards = Array.from(document.querySelectorAll('[data-contact-role-card]'));
    const faqButtons = Array.from(document.querySelectorAll('.faq-question'));
    if (!form || !dynamicFields || !confirmation) return;

    let activeRole = resolveInitialRole();

    /**
     * Update the URL and persisted role without causing a navigation reload.
     *
     * @param {string} role Role to activate.
     * @param {boolean} includeFormHash Whether to point the URL at the form.
     * @returns {void}
     */
    function syncRoleUrl(role, includeFormHash) {
      const hash = includeFormHash ? '#contact-form' : '';
      history.replaceState(null, '', `contact.html?role=${encodeURIComponent(role)}${hash}`);
      writeStorage(ROLE_STORAGE_KEY, role);
    }

    /**
     * Render the correct role context and fields into the form.
     *
     * @param {string} role Role identifier.
     * @param {boolean} restoreDraft Whether a saved draft should be restored.
     * @returns {void}
     */
    function renderRole(role, restoreDraft) {
      const config = ROLE_CONFIG[role];
      if (!config) return;

      activeRole = role;
      writeStorage(ROLE_STORAGE_KEY, role);

      if (roleEyebrow) roleEyebrow.textContent = config.eyebrow;
      if (roleHeading) roleHeading.textContent = `Tell us what you need — ${config.title.toLowerCase()}.`;
      if (roleDescription) roleDescription.textContent = config.description;

      dynamicFields.innerHTML = config.fields.map(renderField).join('');
      roleSwitches.forEach(link => {
        const active = link.getAttribute('data-role-switch') === role;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      roleCards.forEach(card => {
        const active = card.getAttribute('data-contact-role-card') === role;
        card.classList.toggle('is-active', active);
      });

      feedback.hidden = true;
      feedback.textContent = '';
      confirmation.hidden = true;
      confirmation.innerHTML = '';
      form.hidden = false;
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.setAttribute('aria-invalid', 'false'));

      if (restoreDraft) applyDraft(loadDraft(role), form);
    }

    /**
     * Render a polished frontend-only confirmation state.
     *
     * @param {string} ticketId Generated mock ticket identifier.
     * @param {string} email Submitted contact email.
     * @returns {void}
     */
    function renderConfirmation(ticketId, email) {
      const config = ROLE_CONFIG[activeRole];
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.innerHTML = `
        <div class="contact-confirmation-mark" aria-hidden="true">✓</div>
        <span class="section-eyebrow">Request received</span>
        <h3 class="contact-confirmation-title" tabindex="-1" data-contact-confirmation-heading>You're routed to ${escapeHtml(config.title)}.</h3>
        <p class="contact-confirmation-copy">This prototype has created ticket <strong>${escapeHtml(ticketId)}</strong>. A ${escapeHtml(config.email)} representative would reply to <strong>${escapeHtml(email)}</strong> within 24 hours.</p>
        <div class="contact-confirmation-actions">
          <a href="${escapeHtml(config.registrationHref)}" class="btn btn-primary">Continue to Registration</a>
          <a href="mailto:${escapeHtml(config.email)}" class="btn btn-secondary">Email ${escapeHtml(config.title.replace(' &', ''))}</a>
          <button type="button" class="btn btn-secondary" data-contact-new-request>Start Another Inquiry</button>
        </div>`;

      const newRequestButton = confirmation.querySelector('[data-contact-new-request]');
      if (newRequestButton) {
        newRequestButton.addEventListener('click', () => {
          removeStorage(`${DRAFT_STORAGE_PREFIX}${activeRole}`);
          form.reset();
          renderRole(activeRole, false);
          form.hidden = false;
          const firstInput = form.querySelector('input, select, textarea');
          if (firstInput) firstInput.focus();
        });
      }

      const confirmationHeading = confirmation.querySelector('[data-contact-confirmation-heading]');
      if (confirmationHeading) confirmationHeading.focus();
    }

    roleSwitches.forEach(link => {
      link.addEventListener('click', () => {
        const role = link.getAttribute('data-role-switch');
        if (!ROLE_CONFIG[role]) return;
        syncRoleUrl(role, true);
      });
    });

    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        const role = card.getAttribute('data-contact-role-card');
        if (ROLE_CONFIG[role]) writeStorage(ROLE_STORAGE_KEY, role);
      });
    });

    form.addEventListener('invalid', event => {
      if (event.target && event.target.matches('input, select, textarea')) {
        event.target.setAttribute('aria-invalid', 'true');
      }
    }, true);

    form.addEventListener('input', event => {
      if (event.target && event.target.matches('input, select, textarea')) {
        event.target.setAttribute('aria-invalid', event.target.checkValidity() ? 'false' : 'true');
      }
      saveDraft(activeRole, form);
    });

    form.addEventListener('change', event => {
      if (event.target && event.target.matches('input, select, textarea')) {
        event.target.setAttribute('aria-invalid', event.target.checkValidity() ? 'false' : 'true');
      }
      saveDraft(activeRole, form);
    });

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        const invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
      }

      const email = String(form.elements.namedItem('email').value).trim();
      const ticketId = `W3C-CON-${Math.floor(100000 + Math.random() * 900000)}`;

      removeStorage(`${DRAFT_STORAGE_PREFIX}${activeRole}`);
      renderConfirmation(ticketId, email);
    });

    faqButtons.forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const answer = item ? item.querySelector('.faq-answer') : null;
        if (!item || !answer) return;

        const shouldOpen = !item.classList.contains('is-open');
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          const otherButton = otherItem.querySelector('.faq-question');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          otherItem.classList.remove('is-open');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.hidden = true;
        });

        item.classList.toggle('is-open', shouldOpen);
        button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        answer.hidden = !shouldOpen;
      });
    });

    renderRole(activeRole, true);
  }

  document.addEventListener('DOMContentLoaded', initContactPage);

  window.Web3CarnivalContact = {
    roles: Object.keys(ROLE_CONFIG),
    getConfig: role => ROLE_CONFIG[role] || null
  };
})();
