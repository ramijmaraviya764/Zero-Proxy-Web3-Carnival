# Web3 Carnival — Design System
**GDG KalaKriti Designathon · FinTech Track · Scenario 1**
Reference: https://www.web3carnival.world/ · Build target: static HTML/CSS/vanilla JS, no framework

---

## 0. What the brief actually locks down

**Must stay intact:** the Web3 Carnival name/wordmark, the "world's premier Web3 & Blockchain event" positioning, and the real content underneath it — the 7 tracks, the speaker roster, the event history, the sponsor list, the stats. You're redesigning *how people move through the site*, not *what it's about*.

**Fully open:** navigation, visual system, page structure, interaction model. You can add pages/sections the live site doesn't have.

**Required Round 1 coverage:** Home · Upcoming Event/Conference · Tracks · Past Speakers · Past Events · Attendees/Ecosystem · Sponsors & Partners · Get Involved/Registration · Contact/CTA · Footer — desktop **and** mobile — plus a company overview deck in the same brand kit.

**Two things to lock down before you build much further:**
- Round 1 only names a **Figma view link or a PDF presentation** as accepted formats — a live HTML link isn't listed anywhere in the rules. Build "screenshot the full desktop + mobile journey into a PDF" into your plan now, or get an explicit yes from organizers that a hosted link works alongside it.
- The rulebook's general section says the form closes 24 hours after it's issued. Confirm your team's actual deadline — it decides how much of Section 13 below is realistic.

---

## 1. Brand Foundation (from the live site)

Real assets and copy to carry forward rather than invent:

- **Wordmark/logo** — reuse as-is (it's an SVG on the live site).
- **Tagline** — "World's Premier Web3 & Blockchain Event."
- **The 7 tracks** (keep these exact names — your Speaker × Track Explorer and Tracks page hang off this taxonomy): Blockchain & its Infrastructure, DAO & Governance, Metaverse & GameFi, ZK & Security, CeFi DeFi & Staking, Enterprise Blockchain, NFT & Utilities.
- **The 8 audience/ecosystem segments** — Startups, Web3 Enthusiasts, Developers, Investors, Policy Makers, Enterprises, Academia and Institutions, Incubators and Accelerators. This is your Ecosystem Map's real node list, not an invented one.
- **Real "why us" stats** — reuse the real numbers, it's more brand-faithful than placeholders, and it's literally what your "Animated Proof" feature should count up to: 5,000+ Attendees · 250+ Investors & Accelerators · 1,000+ Web3 Developers · 500+ KOLs · 750+ Partners · 1,500+ Potential Web3 Startups.
- **Real "Get Involved" paths** — Sponsor, Speaker, Media, Community Partner, Volunteer, Super Demo. Map these onto step 1 ("your goal") of your registration flow instead of inventing new categories.
- **Tone descriptors from the brief:** Global · Premium · Immersive · Web3 · Community · Innovation.

A plain fetch of the live page returns content, not computed CSS — so there's no way to pull exact hex/font values off it this way. Sections 2–3 below are a deliberate system in the site's actual register plus your own Section 7 spec, not an extraction. If pixel-exact "brand fidelity" matters to your jury, eyedrop 2–3 real swatches from the live site yourself before you present.

---

## 2. Color System

Dark is the primary/default theme (matches your Section 7 spec and the genre); light is the bonus alternate.

### Dark theme (default)
| Token | Hex | Use |
|---|---|---|
| `--bg-void` | `#05060B` | Full-bleed hero / immersive sections |
| `--bg-surface` | `#0D1120` | Card and panel base |
| `--bg-raised` | `#161B2E` | Nav bar, modals, raised panels |
| `--accent-indigo` | `#5B5FEF` | Primary interactive color — buttons, links, active states |
| `--accent-violet` | `#8B5CF6` | Secondary accent — gradient partner, highlights |
| `--accent-cyan` | `#22D3EE` | Tertiary — live/countdown, data, ecosystem connections |
| `--text-primary` | `#F4F5FA` | Headlines, primary copy (off-white, not pure white) |
| `--text-secondary` | `#9CA3C4` | Supporting copy, captions |
| `--text-muted` | `#6B7290` | Timestamps, disabled states |
| `--success` | `#34D399` | Registration confirmation |
| `--warning` | `#FBBF24` | Time-sensitive flags (countdown, deadlines) |
| `--error` | `#F87171` | Form validation |
| `--focus-ring` | `#22D3EE` | 2px, 2px offset, on every interactive element |

Signature gradient — spend it in **one** place (hero headline or the digital pass), not smeared across every card:
```css
--gradient-signature: linear-gradient(135deg, #8B5CF6 0%, #5B5FEF 45%, #22D3EE 100%);
```

### Light theme (`data-theme="light"`) — bonus alternate
| Token | Hex |
|---|---|
| `--bg-void` | `#F7F7FB` |
| `--bg-surface` | `#FFFFFF` |
| `--bg-raised` | `#EEF0FA` |
| `--accent-indigo` | `#4C46E0` |
| `--accent-violet` | `#7C3AED` |
| `--accent-cyan` | `#0891A8` |
| `--text-primary` | `#12131C` |
| `--text-secondary` | `#4B4F66` |
| `--text-muted` | `#767C99` |

Accents are deepened versus the dark set to hold 4.5:1 contrast on white — don't reuse the dark-mode hex values on a white background. Functional colors (success/warning/error/focus) keep the same hues across both themes; only their luminance needs adjusting for contrast.

---

## 3. Typography

Two families, clearly distinct roles:

- **Display — Space Grotesk** (Google Fonts, free): headlines, nav, stat numerals, the countdown. Its numeral design is worth using specifically for the stats block.
- **Body — Plus Jakarta Sans** (Google Fonts, free): paragraphs, bios, form labels, footer. Warmer and more readable at length than Space Grotesk, so speaker bios and the vision/mission copy don't feel cold.

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

| Role | Font / weight | Size (mobile → desktop) | Line-height |
|---|---|---|---|
| Hero H1 | Space Grotesk 600 | `clamp(2.5rem, 6vw, 5rem)` | 1.05 |
| Section H2 | Space Grotesk 600 | `clamp(1.75rem, 3.5vw, 2.75rem)` | 1.1 |
| Card H3 | Space Grotesk 600 | 1.25–1.5rem | 1.2 |
| Body large (intro/mission copy) | Plus Jakarta Sans 400 | 1.125rem | 1.6 |
| Body | Plus Jakarta Sans 400 | 1rem | 1.6 |
| Caption / meta | Plus Jakarta Sans 500 | 0.8125rem | 1.4 |
| Stat numeral | Space Grotesk 700 | `clamp(2rem, 5vw, 3.5rem)` | 1 |

Cap body containers at 65–72 characters per line — matters most for bios and mission copy. Skip a tracked-out ALL-CAPS eyebrow label above every section heading; it's the single most common templated-AI tell and nothing in the brief asks for it.

---

## 4. Layout System

- **Base unit:** 8px. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- **Container:** max-width 1280px, 24px side padding mobile, 64px desktop.
- **Grid:** 4 columns mobile (16px gutter) → 8 tablet → 12 desktop.
- **Breakpoints:** 480 / 768 / 1024 / 1440.

Build mobile-first — "strong mobile-first thinking" is a named bonus item, and it's cheaper to build up from one column than retrofit one later.

---

## 5. Component Library

- **Nav** — sticky, `backdrop-filter: blur()` on translucent `--bg-raised`. One primary CTA ("Register") on mobile; everything else collapses into a menu. Theme toggle lives here.
- **Buttons** — primary (gradient-signature fill, used sparingly, ideally once per screen), secondary (indigo outline), text link (underline-on-hover — skip the arrow glyph appended to every link).
- **Cards — differentiate by content type, don't reuse one rounded-card-plus-shadow everywhere:**
  - *Track card* — gradient-edge border (it's the thing you want to stand out; ties to the signature gradient).
  - *Speaker card* — photo-led, quiet frame, matching the live site's existing pattern (photo, name, role/org, location, socials) just elevated visually.
  - *Sponsor/partner tile* — flat logo lockup on a neutral strip, grouped by tier (Sponsors / Crypto Payment Partner / Ticketing / Community / Media) exactly like the live site already groups them — this content doesn't need an elaborate card treatment.
- **Track pill** — small tag, connects track → speaker → session in the Explorer.
- **Stat block** — numeral (Space Grotesk 700) + label, count-up on scroll-into-view. Feed it the real numbers from Section 1.
- **Countdown** — 4 units (D/H/M/S), tabular numerals.
- **Registration stepper** — 5 steps, numbered. This is genuinely sequential content, so numbering is earned here — unlike a generic feature list.
- **Digital event pass** — your one recommended "spend the boldness here" element: gradient-edge card with name, role, interests, event info, QR placeholder. Give it the richest motion treatment on the site.
- **Ecosystem map** — node-link diagram, the 8 real segments as nodes; selecting one highlights connected tracks/speakers.

---

## 6. Motion & Interaction

Your update doc's Section 8 puts motion on nearly every element — hero, every scroll section, every card hover, the ecosystem, the stats, registration. Built exactly as spec'd, that reads as scattered rather than deliberate, and with a hard time limit it's also just more surface area to build and debug in one night. Pick **one signature moment** and keep everything else quiet:

- **Signature moment (pick one):** the hero's ambient gradient orbit + text reveal on load, *or* the digital pass reveal on registration success. Put your best effort here.
- **Restrained, secondary (fine to keep, keep it subtle):** section-entry fades via `IntersectionObserver` (short, ~200–300ms, no bounce), card hover elevation, ecosystem node highlight on selection, registration progress indicator, stat count-up.
- **Always:** wrap every animation in a `prefers-reduced-motion` check and show the static end-state directly. This is both a named rulebook bonus item and a real accessibility requirement, not just a checkbox to tick.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Page-by-Page Blueprint

Every page reuses the nav/footer/color/type system above. "New layer" = the feature from your update doc that lives on that page.

**Home** — nav → hero (headline, one primary CTA, video/motion backdrop like the live site's `hero.mp4`) → a lightweight, *skippable* path strip (see the note below — don't gate the page behind it) → 7-track highlight grid → real stats block → featured past events → speakers preview strip → partner logo strip → footer.
*New layer: countdown, animated stats, entry personalization as a strip, not a gate.*

**Event/Conference** — agenda/timeline, venue info, filter by track/day/interest.
*New layer: Smart Event Discovery.*

**Tracks** — the 7 real tracks as full cards, each linking into the Speaker × Track Explorer.
*New layer: track → speaker → session connections.*

**Speakers** — directory + search/filter, same card shape as the live site (photo, name, role/org, location, socials), elevated visually.
*New layer: filter by track/expertise.*

**Past Events** — the real event history (15 entries on the live site) as a visual timeline/gallery rather than a plain list — this is where "visual storytelling" pays off most, since the content already exists.

**Ecosystem/Attendees** — the interactive relationship map, using the real 8 segments.
*New layer: the map itself.*

**Sponsors & Partners** — the live site's existing tiered logo-wall pattern (Sponsors / Crypto Payment Partner / Ticketing / Community / Media), organized more clearly by tier, plus a "Partner With Us" CTA.

**Register/Get Involved** — 5-step flow; step 1 ("your goal") uses the real 6 application types (Sponsor/Speaker/Media/Community/Volunteer/Super Demo) instead of inventing new ones; ends in the digital pass reveal.
*New layer: the whole flow + pass.*

**Contact** — role-specific contact paths (attendee vs. sponsor vs. speaker vs. media).

**Footer** — keep the live site's existing grouping (Web3 Carnival / Get Involved / More / Legal / Newsletter) — it's already well-organized, no need to reinvent it.

---

## 8. Dark / Light Theme

Single `data-theme="dark"` (default) / `data-theme="light"` attribute on `<html>`, every color as a CSS custom property (Section 2), toggle button in nav, preference persisted to `localStorage`. No separate stylesheet — same components, token swap only.

---

## 9. Accessibility Checklist

- Contrast: body text 4.5:1 minimum, large text/UI elements 3:1, checked in **both** themes.
- Visible focus ring on every interactive element (`--focus-ring`, 2px, 2px offset) — don't remove the default outline without replacing it.
- `prefers-reduced-motion` respected everywhere (Section 6).
- Alt text on every image — the brief calls for heavy use of photography, and every one of those needs real alt copy, not filenames.
- Ecosystem map and speaker filter fully keyboard-operable (tab through nodes/filters, not just mouse/touch).
- Skip-to-content link before the nav.
- This whole section doubles as the "Accessibility considerations" line every Round 2 presentation in the rulebook explicitly asks for — keep notes on what you did here for that slide later.

---

## 10. Implementation Notes

- All tokens as CSS custom properties in one `:root` block (Section 2) — this is also what makes the dark/light toggle a one-line swap instead of a second stylesheet.
- `IntersectionObserver` for scroll reveals and stat count-ups — no animation library needed for what Section 6 actually calls for.
- Since you're building multiple HTML pages rather than a single-page app, keep nav/footer identical across every page by literally copying the same markup block, or fetch a shared `partials/nav.html` via `fetch()` + `innerHTML` if you want one source of truth — either works given the timeline; the second is worth it if more than one person is editing pages in parallel.
- Mobile-first CSS: write the single-column layout first, add `min-width` media queries to widen up, not the reverse.

---

## 11. Company Overview Deck — Same Brand Kit

Reuses every token above (colors, type scale, gradient, stat-block component). Suggested slide order: cover (wordmark + signature gradient) → vision & mission (real copy from the live site) → why the ecosystem matters → event formats/experiences → stats slide (the real numbers) → speakers/industry participation → sponsors & partners → past highlights → get involved CTA → close. 16:9, generous whitespace, one accent color doing the work per slide rather than all three at once.

---

## 12. Requirement Traceability

| Rulebook item | Status | Where |
|---|---|---|
| Homepage | Covered | §7 Home |
| Upcoming Event/Conference | Covered | §7 Event |
| Event themes/tracks | Covered | §7 Tracks |
| Past Speakers | Covered | §7 Speakers |
| Past events/editions | Covered | §7 Past Events |
| Attendees/ecosystem | Covered | §7 Ecosystem |
| Sponsors & Partners | Covered | §7 Sponsors |
| Get Involved/Registration | Covered | §7 Register |
| Contact/CTA | Covered | §7 Contact |
| Footer & social links | Covered | §7 Footer |
| Desktop + mobile | Covered | §4 breakpoints, every page |
| Company overview deck, same brand kit | Covered | §11 |
| Micro-interactions / scroll storytelling / motion | Covered (scoped) | §6 |
| Interactive speaker/event cards + discovery | Covered | §5, §7 Tracks/Speakers |
| Innovative registration flow | Covered | §5 stepper, §7 Register |
| Dark/light theme exploration | Covered | §2, §8 |
| Mobile-first, Web3-native interactions | Covered | §4, §7 |

---

## 13. Before You Submit — suggested build order

Given the 24-hour window, build in this order so a cut-short session still leaves something complete:

- **P0 (must be fully done, both breakpoints):** Home, Tracks, Speakers, Sponsors & Partners, Past Events, Event/Conference, Contact, Footer, a working (even if simplified) Register flow, dark theme.
- **P1 (your 2 signature differentiators — pick from these and build them properly rather than starting all four):** Ecosystem Map, Digital Event Pass reveal, Speaker × Track Explorer, Smart Event Discovery filter.
- **P2 (only if time remains):** full light theme, countdown timer, entry-point personalization strip, scroll storytelling beyond basic reveals.
- **Always:** leave time to export the desktop + mobile journey into the PDF the rulebook actually asks for.
