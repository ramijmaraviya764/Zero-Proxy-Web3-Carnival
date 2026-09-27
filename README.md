# Web3 Carnival — Event Experience Platform

A responsive, interaction-focused Web3 Carnival event website built with semantic HTML, modular CSS, and vanilla JavaScript.

The website is structured as a connected event experience rather than a collection of independent marketing pages. Visitors can discover the event, identify relevant stakeholder segments, explore tracks and speakers, review ecosystem opportunities, complete a guided registration flow, and receive a personalized digital event pass.

---

## Production Documentation

This README is the primary delivery document for the frontend repository.

It covers:

- product and information architecture;
- production deployment;
- frontend architecture;
- developer ownership and change points;
- responsive behavior;
- browser and device QA;
- accessibility checks;
- release verification;
- current technical boundaries.

This repository is a static frontend application. It can be deployed as a production website through any static web host or web server capable of serving HTML, CSS, JavaScript, and image assets.

---

## 1. Product Overview

### Objective

The website provides a premium digital experience for a Web3 event with a strong emphasis on:

- clear information hierarchy;
- fast event discovery;
- role-based exploration;
- responsive behavior across desktop, tablet, and mobile;
- interaction that improves discovery rather than adding decoration;
- accessible and keyboard-aware interaction patterns;
- a lightweight frontend architecture with minimal dependencies.

### Core Experience Model

The primary user journey is:

**Discover → Identify relevance → Explore → Personalize → Act**

The model is expressed through the homepage, ecosystem experience, tracks, speakers, and registration flow.

---

## 2. Site Architecture

| Page | Responsibility |
|---|---|
| `index.html` | Landing experience, event proposition, highlights, statistics, and primary entry points |
| `event.html` | Event details, format, schedule, venue, and supporting information |
| `tracks.html` | Track discovery and thematic exploration |
| `speakers.html` | Speaker discovery, filtering, and profile interaction |
| `past-events.html` | Previous editions and event history |
| `ecosystem.html` | Stakeholder Relationship Map and connected opportunities |
| `partners.html` | Partnership and sponsor information |
| `register.html` | Guided registration flow and personalized digital pass |
| `contact.html` | Contact routing, support information, form interaction, and FAQ content |

The navigation system is shared across the site and uses a dedicated mobile navigation pattern at smaller widths.

---

## 3. Key Product Experiences

### 3.1 Stakeholder Relationship Map

The Ecosystem page is organized around stakeholder-driven discovery.

The available stakeholder segments are:

1. Startups
2. Web3 Enthusiasts
3. Developers
4. Investors
5. Policy Makers
6. Enterprises
7. Academia and Institutions
8. Incubators and Accelerators

Selecting a stakeholder updates the connected opportunity content without requiring a separate page load.

The relationship model connects stakeholder segments with:

- thematic tracks;
- opportunities;
- relevant speakers;
- ecosystem context;
- next actions.

This makes the ecosystem section an exploration interface rather than a static audience list.

### 3.2 Mobile Ecosystem Behavior

The Stakeholder Relationship Map uses a dedicated responsive composition rather than scaling the desktop geometry indefinitely.

On narrow screens:

- stakeholder cards are constrained by the viewport;
- cards remain horizontally centered;
- internal grid children are allowed to shrink safely;
- the detail panel is independently constrained and centered;
- horizontal overflow is avoided;
- text wraps inside the available card width;
- the larger relationship-map composition is preserved for wider viewports.

The responsive correction is intentionally localized to the ecosystem experience so unrelated page sections do not inherit unnecessary layout overrides.

### 3.3 Track and Speaker Discovery

Track and speaker content is exposed through dedicated experiences rather than being buried in one long event page.

The shared data model supports relationships such as:

**Track → Related Speakers → Session Context → Next Action**

### 3.4 Guided Registration

Registration uses a five-step flow:

1. Goal
2. Interests
3. Personal details
4. Event plan
5. Digital pass

The progressive flow reduces cognitive load and allows the final digital pass to reflect the selections made during registration.

### 3.5 Digital Event Pass

The registration experience creates a browser-side digital pass containing contextual registration information such as:

- participant identity;
- role or organization;
- event information;
- access level;
- pass identifier;
- selected tracks or interests.

The generated pass is client-side output. It must not be treated as a server-issued ticket, payment receipt, or authoritative venue credential unless an external production backend is integrated.

### 3.6 Theme Support

The site provides dark and light theme support through a shared theme controller.

Theme preference is persisted locally where browser storage is available. Storage failures are handled without preventing the rest of the interface from operating.

### 3.7 Local Client State

`localStorage` is used selectively for lightweight client-side state such as:

- theme preference;
- selected ecosystem/journey information;
- saved journey items;
- registration-related frontend state.

No server-side persistence or authentication service is included in this repository.

---

## 4. Design System

The visual system follows a premium, dark-first Web3 event direction with restrained accent color and strong typography.

### Visual characteristics

- dark interface foundation;
- restrained indigo, violet, and cyan accents;
- editorial typographic hierarchy;
- deliberate use of gradients, glow, borders, and depth;
- compact controls rather than oversized UI chrome;
- content-specific card structures instead of one repeated card template.

### Layout principles

The interface does not force every section into identical rounded containers. Visual grouping is used where it improves hierarchy, scanning, or interaction clarity.

Responsive layouts are recomposed where necessary instead of treating mobile as a scaled-down desktop.

---

## 5. Frontend Architecture

The repository is intentionally dependency-light.

### Technologies

- **HTML5** — semantic page structure
- **CSS3** — design tokens, shared components, page layouts, responsive rules
- **JavaScript (ES6+)** — interaction, filtering, state, navigation, registration, theme handling
- **Browser APIs** — DOM APIs, `localStorage`, media-query checks, and client-side event handling

No frontend framework or build pipeline is required by the current implementation.

### CSS responsibilities

| File | Responsibility |
|---|---|
| `css/tokens.css` | Design tokens and shared visual variables |
| `css/base.css` | Resets, typography, global defaults, foundational styles |
| `css/components.css` | Reusable UI components and shared interaction patterns |
| `css/pages.css` | Page-specific layouts and component composition |
| `css/responsive.css` | Shared breakpoint and responsive behavior |
| `css/final-polish.css` | Final presentation refinements and targeted adjustments |

### JavaScript responsibilities

| File | Responsibility |
|---|---|
| `js/data.js` | Shared application and event content |
| `js/main.js` | Shared page-level behavior |
| `js/navigation.js` | Desktop/mobile navigation behavior |
| `js/theme.js` | Theme switching and preference persistence |
| `js/ecosystem.js` | Stakeholder map and ecosystem interactions |
| `js/tracks.js` | Track discovery and filtering behavior |
| `js/speakers.js` | Speaker discovery and filtering |
| `js/past-events.js` | Past-event interactions |
| `js/partners.js` | Partner-page interactions |
| `js/contact.js` | Contact and support interactions |
| `js/filters.js` | Filtering and saved-journey behavior |
| `js/registration.js` | Registration flow and digital pass generation |

---

## 6. Data and Interaction Model

The shared JavaScript data layer keeps related event content consistent across pages.

Conceptually:

```text
Stakeholder
   ├── Tracks
   │     └── Sessions
   │           └── Speakers
   ├── Opportunities
   └── Next Actions
```

The current implementation does not include a CMS or application backend. The data model is kept centralized so future migration to an API, CMS, or application framework can preserve the existing content relationships.

### Primary developer rule

When changing event content, prefer updating the shared data source in:

```text
js/data.js
```

instead of duplicating the same information across multiple HTML files.

This reduces content drift between pages.

---

# 7. Developer Guide

This section is intended for engineers or maintainers who will modify, deploy, or extend the website.

## 7.1 Where to Make Common Changes

### Event content

Use:

```text
js/data.js
```

for shared event information, tracks, speakers, ecosystem relationships, and other reusable content data.

### Shared visual tokens

Use:

```text
css/tokens.css
```

for shared color, spacing, typography, sizing, and other design-system values.

Do not introduce one-off values into multiple files when the value represents a reusable design token.

### Shared components

Use:

```text
css/components.css
```

for patterns that appear across multiple pages.

### Page-specific styling

Use:

```text
css/pages.css
```

when the change genuinely belongs to one page or one page-specific component.

### Shared responsive behavior

Use:

```text
css/responsive.css
```

for cross-page breakpoint behavior.

### Ecosystem-specific responsive behavior

The stakeholder map is intentionally isolated from broad global responsive overrides. Changes to its narrow-screen composition should remain scoped to the ecosystem experience.

This is important because changing the global container or breakpoint rules can unintentionally alter unrelated pages.

### Interactions

Use the page-specific JavaScript module rather than placing large inline scripts inside HTML files.

---

## 7.2 Change-Safety Rules

When modifying the production frontend:

1. Prefer the smallest scoped change that solves the problem.
2. Avoid global CSS overrides when the requirement is page-specific.
3. Keep shared data centralized.
4. Preserve existing accessibility attributes and keyboard behavior.
5. Test both the changed viewport and at least one desktop viewport after a responsive change.
6. Verify adjacent components for regression rather than testing only the modified element.
7. Do not place secrets, credentials, API keys, or private data in frontend files.

---

## 7.3 Responsive Development

The website uses shared breakpoints plus page-specific responsive composition.

### Desktop priorities

- information density;
- multi-column layouts;
- visual composition;
- hover/pointer-driven discovery;
- relationship mapping.

### Tablet priorities

- reduced column count;
- comfortable tap targets;
- controlled content width;
- predictable transition from desktop composition.

### Mobile priorities

- single-column readability;
- centered content;
- stable side margins;
- content reflow;
- touch-friendly controls;
- reduced visual clutter.

### Important mobile rule

Do not solve a mobile overflow problem by adding arbitrary negative margins or by forcing a desktop-sized child into a smaller viewport.

For the ecosystem map, the intended model is:

```text
Viewport
   ↓
Available content width
   ↓
Centered visual component
   ↓
Internal content reflows within that component
```

---

# 8. Production Deployment

## 8.1 Hosting Model

The repository can be deployed as a static website.

A compatible deployment target should support:

- HTTPS;
- HTML5;
- CSS;
- JavaScript;
- static image assets;
- client-side browser storage.

Examples include standard web servers and static hosting platforms.

## 8.2 Deployment Directory

The deployable site is contained in:

```text
web3/
```

The production document root should point to the directory containing `index.html`.

## 8.3 HTTPS

Production traffic should be served over HTTPS.

This is especially important for:

- secure browser behavior;
- predictable browser storage behavior;
- external integrations added later;
- protection against content or connection tampering.

## 8.4 No Build Step

The current repository does not require:

```text
npm install
npm run build
webpack
vite build
```

for its included static frontend.

The HTML, CSS, JavaScript, and assets are deployed directly.

## 8.5 Caching

When deploying behind a CDN or static host, use cache policies appropriate to the asset type.

A practical production approach is:

- long-lived caching for versioned/static image assets;
- controlled caching for CSS and JavaScript during active releases;
- short or revalidated caching for HTML during frequent content changes.

## 8.6 Deployment Verification

After every production deployment:

1. Open the production URL in a clean browser session.
2. Verify the homepage and primary navigation.
3. Open Ecosystem and test stakeholder switching.
4. Verify Tracks and Speakers.
5. Complete the registration flow.
6. Verify digital pass generation.
7. Test mobile navigation.
8. Check for horizontal scrolling.
9. Open browser developer tools and check for console errors.
10. Verify assets load with HTTP status 200 where applicable.

---

# 9. Production QA and Testing

## 9.1 Important Repository Note

The current repository does **not** include a JavaScript unit-test suite, end-to-end automation suite, CI pipeline, or browser-test configuration.

Therefore, the README does not claim automated test coverage.

Production release validation should be performed using the manual QA matrix below unless an automated test layer is added later.

---

## 9.2 Functional QA

### Navigation

- [ ] Homepage navigation opens every primary destination.
- [ ] Desktop navigation links work.
- [ ] Mobile navigation opens correctly.
- [ ] Mobile navigation closes after selection.
- [ ] No dead internal links exist.
- [ ] Browser back/forward navigation does not leave the interface in an unusable state.

### Ecosystem

- [ ] All stakeholder segments can be selected.
- [ ] Selected-state styling is visible.
- [ ] Connected content updates correctly.
- [ ] Track links point to the intended destinations.
- [ ] Speaker entries open correctly.
- [ ] No horizontal overflow occurs at narrow widths.
- [ ] The stakeholder cards stay centered.
- [ ] The detail panel stays centered.
- [ ] Text remains readable at 320px-wide viewports.

### Tracks

- [ ] Track content loads.
- [ ] Track filtering works.
- [ ] Relevant controls remain usable on mobile.
- [ ] No clipped labels or controls appear.

### Speakers

- [ ] Speaker content loads.
- [ ] Filtering works.
- [ ] Speaker cards remain readable at narrow widths.
- [ ] Images load correctly.
- [ ] Links and interaction states work.

### Registration

- [ ] Step 1 loads.
- [ ] Step 2 loads.
- [ ] Step 3 validation behaves correctly.
- [ ] Step 4 selections are retained.
- [ ] Step 5 generates the digital pass.
- [ ] Back/next interactions do not unexpectedly erase entered data.
- [ ] Refresh behavior is acceptable for the intended production flow.

### Theme

- [ ] Dark theme applies correctly.
- [ ] Light theme applies correctly.
- [ ] Theme state persists when browser storage is available.
- [ ] The site remains usable if browser storage is unavailable.

---

# 10. Responsive QA Matrix

At minimum, validate the site at these viewport widths:

| Category | Widths |
|---|---|
| Small mobile | 320px, 360px |
| Standard mobile | 390px, 430px |
| Tablet | 768px, 820px, 1024px |
| Desktop | 1280px, 1440px, 1920px |

### Mobile checks

For every mobile width:

- [ ] no unexpected horizontal scrollbar;
- [ ] no card extends beyond the viewport;
- [ ] left/right spacing is consistent;
- [ ] headings wrap correctly;
- [ ] buttons remain tappable;
- [ ] navigation remains reachable;
- [ ] images preserve their intended aspect ratio;
- [ ] relationship-map cards remain centered;
- [ ] ecosystem detail content remains within the viewport.

### Desktop checks

For every desktop width:

- [ ] no unintended mobile rules leak into desktop;
- [ ] primary content remains visually centered;
- [ ] multi-column layouts retain intended hierarchy;
- [ ] hover interactions remain functional;
- [ ] whitespace does not become excessive at larger widths.

---

# 11. Browser QA

At minimum, production validation should cover:

- Chromium-based browsers;
- Firefox;
- WebKit/Safari where available.

The goal is to detect:

- layout differences;
- unsupported browser behavior;
- font/rendering issues;
- `localStorage` edge cases;
- focus behavior;
- responsive breakpoint issues;
- JavaScript console errors.

Browser-specific behavior should be fixed at the smallest responsible scope rather than by adding broad compatibility hacks.

---

# 12. Accessibility QA

Accessibility should be treated as part of release quality.

Verify:

- semantic headings follow a logical hierarchy;
- interactive elements are keyboard reachable;
- focus states remain visible;
- buttons and links have meaningful accessible names;
- dynamic controls expose their state where required;
- mobile navigation is keyboard operable;
- form controls have associated labels;
- text remains readable at small widths;
- reduced-motion preferences are respected where animations are present;
- color is not the only method used to communicate state.

A production release should additionally be checked with an accessibility auditing tool and, where practical, a screen reader.

---

# 13. Performance QA

Before release, verify:

- no unnecessarily large asset is loaded for a small component;
- images are served at appropriate dimensions;
- unused console logging is removed;
- JavaScript errors are absent;
- layout does not visibly jump while assets load;
- the homepage remains responsive during initial interaction;
- third-party requests, if later introduced, are limited and intentional.

The current repository contains a lightweight frontend and does not require a build optimizer, but deployment-level compression and CDN delivery are still recommended.

---

# 14. Security and Production Boundaries

The frontend is client-side code. Anything shipped under `web3/` is visible to users.

Do not put any of the following into frontend source:

- API secrets;
- private tokens;
- database credentials;
- administrative keys;
- confidential user information.

The current registration and digital-pass behavior is client-side. If the production event requires authoritative registration, payment, ticket issuance, attendee authentication, or protected attendee data, those operations must be implemented through a trusted backend service rather than browser-only JavaScript.

---

# 15. Current Runtime Boundaries

The repository provides the frontend experience.

The following services are **not implemented inside this package**:

- server-side authentication;
- server-side registration persistence;
- payment processing;
- authoritative ticket issuance;
- CRM synchronization;
- real-time event scheduling backend;
- production analytics pipeline;
- content-management backend.

These are architectural boundaries, not defects in the frontend repository.

If external production services are added later, their integration should be isolated behind explicit API/service layers instead of embedding credentials or business logic directly in reusable UI components.

---

# 16. Project Structure

```text
web3/
├── index.html
├── event.html
├── tracks.html
├── speakers.html
├── past-events.html
├── ecosystem.html
├── partners.html
├── register.html
├── contact.html
├── design.md
├── README.md
│
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── components.css
│   ├── pages.css
│   ├── responsive.css
│   └── final-polish.css
│
├── js/
│   ├── data.js
│   ├── main.js
│   ├── navigation.js
│   ├── theme.js
│   ├── ecosystem.js
│   ├── tracks.js
│   ├── speakers.js
│   ├── past-events.js
│   ├── partners.js
│   ├── registration.js
│   ├── filters.js
│   └── contact.js
│
├── assets/
│   ├── favicon.svg
│   ├── event-*.jpg
│   └── speaker-*.jpg
│
└── .vscode/
    ├── launch.json
    └── settings.json
```

---

# 17. Local Development

## Option A — Direct browser open

Open:

```text
index.html
```

in a modern browser.

## Option B — Local HTTP server

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Option C — VS Code

Open the `web3` folder in VS Code and use the included `.vscode` configuration or any local static-server extension.

For frontend changes, browser developer tools should be used to inspect:

- viewport dimensions;
- layout boxes;
- computed styles;
- console errors;
- storage state;
- keyboard focus;
- network asset failures.

---

# 18. Release Checklist

A release should not be considered complete until the following are checked.

## Functional

- [ ] All primary pages open.
- [ ] Navigation works on desktop and mobile.
- [ ] Ecosystem stakeholder selection works.
- [ ] Tracks work.
- [ ] Speakers work.
- [ ] Registration works from start to finish.
- [ ] Digital pass generation works.
- [ ] Theme switching works.

## Responsive

- [ ] 320px checked.
- [ ] 360px checked.
- [ ] 390px checked.
- [ ] 430px checked.
- [ ] Tablet checked.
- [ ] Desktop checked.
- [ ] No unintended horizontal scrolling.

## Visual

- [ ] No clipped content.
- [ ] No broken images.
- [ ] No unexpected spacing regressions.
- [ ] Typography remains consistent.
- [ ] Mobile cards stay within viewport.
- [ ] Ecosystem relationship-map composition remains centered.

## Accessibility

- [ ] Keyboard navigation checked.
- [ ] Focus states checked.
- [ ] Labels checked.
- [ ] Dynamic states checked.
- [ ] Reduced-motion behavior checked.

## Browser

- [ ] Chromium checked.
- [ ] Firefox checked.
- [ ] WebKit/Safari checked where available.

## Production

- [ ] HTTPS enabled.
- [ ] Correct document root configured.
- [ ] Production URL verified.
- [ ] Browser console checked for errors.
- [ ] Required assets load successfully.
- [ ] No development-only debugging output remains.
- [ ] No secrets or credentials are present in frontend files.

---

# 19. Change Management

For future modifications:

1. Identify whether the requirement is global, page-specific, or component-specific.
2. Modify the smallest appropriate source file.
3. Preserve existing shared data relationships.
4. Run the relevant functional QA.
5. Run the responsive QA matrix when layout changes are involved.
6. Check at least one unaffected page for regression.
7. Review browser console errors before deployment.
8. Deploy only after the production checklist passes.

For responsive CSS changes, the minimum regression set should include:

```text
320px
390px
430px
768px
1440px
```

This catches the most common failure mode where a mobile fix unintentionally changes desktop behavior.

---

# 20. Design Documentation

Additional design rationale is available in:

```text
design.md
```

Use that document for deeper explanation of:

- visual direction;
- interaction principles;
- layout reasoning;
- design-system choices.

This README should remain the operational and technical entry point for deployment and maintenance.

---

# 21. Important Implementation Note

The Stakeholder Relationship Map recently received a targeted narrow-screen responsive correction.

The correction is intentionally scoped to the ecosystem experience and focuses on:

- dynamic width based on available viewport space;
- centered stakeholder cards;
- centered detail content;
- safe shrinking of nested grid items;
- preventing horizontal overflow;
- preserving the wider-screen composition.

Do not replace this behavior with a global fixed-width rule. The map should derive its usable width from the available viewport.

---

# 22. Summary

Web3 Carnival is implemented as a connected event experience rather than a conventional event brochure.

The core product decisions are:

- role-based ecosystem discovery;
- connected tracks, speakers, and opportunities;
- progressive registration;
- personalized digital pass output;
- centralized content data;
- responsive layouts that are recomposed where required;
- accessibility-aware interaction;
- a cohesive premium visual system;
- a lightweight static frontend suitable for direct deployment.

The repository is production-ready as a frontend delivery package within the boundaries documented above. Any backend-dependent capability such as authoritative ticketing, authentication, payment, persistent attendee records, or CRM integration must be provided by the corresponding production services.

---

## License / Usage

This repository is provided as a project implementation. Confirm ownership and licensing requirements for any third-party images, fonts, logos, or event content before public or commercial deployment.
