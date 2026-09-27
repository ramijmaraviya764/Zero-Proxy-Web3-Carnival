# Web3 Carnival — Event Experience Platform

A premium, responsive digital experience designed to help audiences discover, understand, and engage with a Web3 event through a connected journey rather than a collection of standalone pages.

Web3 Carnival brings together event discovery, stakeholder exploration, tracks, speakers, ecosystem opportunities, guided registration, and a personalized digital event pass within one cohesive experience.

---

## Overview

Traditional event websites often present information as separate pages: event details, speakers, schedules, partners, and registration.

Web3 Carnival takes a more connected approach.

The experience is built around a simple progression:

**Discover → Identify Relevance → Explore → Personalize → Act**

Visitors can enter the experience from different perspectives, discover content relevant to them, explore the wider ecosystem, and move naturally toward registration and participation.

---

## Experience Architecture

The platform is organized across focused experiences, each serving a distinct purpose.

| Experience | Purpose |
|---|---|
| **Home** | Introduces the event, its proposition, key highlights, and primary entry points |
| **Event** | Presents event details, format, schedule, venue, and supporting information |
| **Tracks** | Enables thematic exploration across the event |
| **Speakers** | Provides speaker discovery and profile exploration |
| **Past Events** | Connects the current experience with previous editions |
| **Ecosystem** | Helps visitors explore stakeholders and connected opportunities |
| **Partners** | Presents partnership and sponsor information |
| **Registration** | Guides visitors through a personalized five-step registration journey |
| **Contact** | Provides contact routes, support information, and FAQs |

Together, these experiences form one continuous event journey rather than isolated destinations.

---

# The Ecosystem Experience

## Stakeholder Relationship Map

The Ecosystem page is the central discovery layer of the experience.

Instead of presenting audiences as a static list, the interface allows visitors to identify themselves within the ecosystem and discover the opportunities, content, and connections most relevant to them.

The experience includes eight stakeholder segments:

- Startups
- Web3 Enthusiasts
- Developers
- Investors
- Policy Makers
- Enterprises
- Academia and Institutions
- Incubators and Accelerators

Selecting a stakeholder dynamically changes the connected ecosystem content so that the visitor can move from:

**Who am I? → What is relevant to me? → Who should I meet? → What can I explore next?**

The relationship model connects stakeholder groups with:

- thematic tracks;
- opportunities;
- relevant speakers;
- ecosystem context;
- next actions.

This transforms the ecosystem section from a conventional audience directory into an interactive discovery interface.

---

## Responsive Ecosystem Design

The Stakeholder Relationship Map is designed to adapt its composition to the available screen size rather than simply shrinking a desktop layout.

On smaller screens:

- stakeholder cards remain centered;
- content width responds to the viewport;
- internal content reflows naturally;
- detail panels remain within the available space;
- horizontal overflow is avoided;
- typography and controls remain readable;
- the wider relationship-map composition is preserved where the viewport allows it.

The goal is to maintain the character and hierarchy of the experience across desktop, tablet, and mobile environments.

---

# Connected Event Discovery

## Tracks

Tracks organize the event around thematic areas and make a large amount of event content easier to explore.

The experience allows visitors to move from a theme into the people, opportunities, and context associated with it.

A core discovery pattern is:

**Track → Related Speakers → Session Context → Next Action**

---

## Speakers

The speaker experience provides focused discovery instead of requiring visitors to search through a long event page.

Speaker information is presented as part of the wider event ecosystem, making it easier to connect people with tracks, topics, and opportunities.

---

# Guided Registration

Registration is designed as a progressive five-step journey:

1. **Goal**
2. **Interests**
3. **Personal Details**
4. **Event Plan**
5. **Digital Pass**

Rather than presenting one large form, the experience progressively introduces information and decisions.

This keeps the interaction focused while allowing the final result to reflect the visitor's selected interests and event context.

---

# Personalized Digital Event Pass

The registration journey concludes with a personalized digital event pass.

The pass can reflect contextual information such as:

- participant identity;
- role or organization;
- event information;
- access level;
- pass identifier;
- selected tracks or interests.

This creates a natural transition from registration to participation and gives the user a tangible outcome from the journey.

---

# Design Direction

Web3 Carnival follows a premium, dark-first visual language designed for a contemporary Web3 event.

### Visual principles

- dark interface foundation;
- restrained indigo, violet, and cyan accents;
- strong editorial typography;
- clear information hierarchy;
- deliberate gradients, glow, borders, and depth;
- compact and purposeful controls;
- content-specific layouts rather than repetitive card patterns;
- strong visual composition without relying on excessive decoration.

The design intentionally avoids making every section look identical.

Different content types are given their own visual treatment so that the interface communicates hierarchy through structure as well as styling.

---

# Responsive Experience

Responsive behavior is treated as a design requirement rather than simply a scaling exercise.

### Desktop

The experience emphasizes:

- visual composition;
- information density;
- multi-column layouts;
- ecosystem relationships;
- hover and pointer-driven discovery.

### Tablet

The layout progressively reduces density while preserving hierarchy, touch comfort, and clear content grouping.

### Mobile

The experience prioritizes:

- readable single-column layouts;
- centered content;
- stable horizontal margins;
- touch-friendly controls;
- natural text reflow;
- reduced visual clutter;
- mobile-specific composition where a desktop structure does not translate effectively.

This approach helps the experience retain its identity rather than becoming a compressed version of the desktop interface.

---

# Interaction Philosophy

Interactions are used where they improve understanding or discovery.

The experience focuses on making information feel connected rather than simply adding animation.

Examples include:

- stakeholder selection that changes ecosystem context;
- filtering across event content;
- guided registration steps;
- dynamic digital pass generation;
- shared theme behavior;
- saved journey state.

The interface is designed so that interaction has a clear purpose:

**to help the visitor understand what matters to them and what to do next.**

---

# Accessibility

Accessibility is considered part of the experience rather than an optional layer.

The interface incorporates:

- semantic HTML structure;
- keyboard-accessible controls;
- visible focus states;
- accessible labels;
- dynamic state handling;
- skip-navigation support;
- responsive text behavior;
- reduced-motion considerations;
- contrast-conscious visual design.

The objective is to keep the experience usable across different interaction methods and viewport sizes.

---

# Technology

The platform is intentionally lightweight and dependency-conscious.

### Core technologies

- **HTML5** — semantic structure and content
- **CSS3** — design system, layouts, responsive behavior, and presentation
- **JavaScript (ES6+)** — interactions, filtering, navigation, registration, and state
- **Browser APIs** — client-side storage, DOM interaction, and responsive behavior

The current experience does not require a frontend framework.

This keeps the implementation portable and makes the experience suitable for direct static deployment.

---

# Frontend Structure

The project separates shared visual foundations, reusable components, page-specific composition, responsive behavior, and interaction logic.

### Styles

```text
css/
├── tokens.css
├── base.css
├── components.css
├── pages.css
├── responsive.css
└── final-polish.css
```

### Interaction logic

```text
js/
├── data.js
├── main.js
├── navigation.js
├── theme.js
├── ecosystem.js
├── tracks.js
├── speakers.js
├── past-events.js
├── partners.js
├── registration.js
├── filters.js
└── contact.js
```

This structure keeps shared patterns reusable while allowing individual event experiences to retain their own behavior and composition.

---

# Content Relationships

The underlying content model is organized around connected event information:

```text
Stakeholder
   ├── Tracks
   │     └── Sessions
   │           └── Speakers
   ├── Opportunities
   └── Next Actions
```

The purpose of this structure is to make relationships visible throughout the experience.

A visitor can begin with their role, move toward a relevant theme, discover people and opportunities, and continue toward an action without losing context.

---

# Theme Support

The platform supports both dark and light themes through a shared theme experience.

Theme preference can be retained locally so that the interface can remain consistent across visits in supported browsers.

---

# Client-Side Personalization

The experience uses lightweight browser-side state for selected preferences and journey information.

This supports experiences such as:

- theme preference;
- selected ecosystem information;
- saved journey items;
- registration-related state.

This keeps personalization immediate and responsive within the frontend experience.

---

# Experience Philosophy

Web3 Carnival is built around a simple idea:

> An event should feel like an ecosystem people can navigate, not a brochure they scroll through.

That principle influences the structure of the platform:

**Role → Relevance → Discovery → Connection → Action**

The result is an experience designed to help visitors understand where they fit within the event and what they can do next.

---

# Project Structure

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

# Deployment

The current frontend is suitable for static web deployment.

The project can be served directly from a standard web server or static hosting platform capable of delivering HTML, CSS, JavaScript, and image assets.

A local preview can also be started with:

```bash
python -m http.server 8000
```

and accessed at:

```text
http://localhost:8000/
```

---

# Current Scope

The current implementation focuses on the complete frontend experience and its interactive event journeys.

Client-side experiences include:

- event discovery;
- stakeholder exploration;
- track and speaker discovery;
- guided registration;
- personalized digital pass presentation;
- theme switching;
- browser-side journey state.

Capabilities such as authenticated attendee accounts, payment processing, server-side ticket issuance, CRM synchronization, real-time event operations, and content management require corresponding production services beyond the frontend layer.

---

# Future Evolution

The architecture is designed so that the experience can evolve into a larger event platform.

Potential extensions include:

- content management for tracks, sessions, speakers, and partners;
- persistent attendee accounts;
- server-side registration;
- ticket and credential management;
- personalized attendee dashboards;
- event networking;
- calendar integration;
- CRM integration;
- analytics and engagement insights;
- real-time schedule updates.

The underlying information architecture can remain intact as these capabilities are introduced.

---

# Why the Experience Is Different

The website is designed around relationships rather than isolated content.

A visitor should be able to move naturally through:

**Stakeholder → Track → Speaker → Opportunity → Registration → Digital Pass**

That continuity makes the event feel like one connected digital product.

Instead of asking visitors to understand the entire event first, the experience begins with what is most relevant to them and expands outward.

---

# Design Documentation

Additional design rationale is available in:

```text
design.md
```

This document provides deeper context around the visual system, interaction principles, and design direction.

---

# Closing Statement

Web3 Carnival is a connected event experience built to make a complex Web3 ecosystem easier to discover, understand, and navigate.

It combines:

- role-based exploration;
- connected event content;
- immersive visual design;
- responsive interaction;
- guided registration;
- personalized event output.

The result is a digital experience that treats the event as an ecosystem of people, ideas, tracks, and opportunities — not simply a collection of pages.

---

## License / Usage

Confirm ownership and licensing requirements for any third-party images, fonts, logos, and event content before public or commercial use.
