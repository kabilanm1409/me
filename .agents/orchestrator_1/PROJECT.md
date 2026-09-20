# Project: Portfolio Cyber Glassmorphism & 3D Certificate Ribbon Modernization

## Architecture
- **Global Theme & Styling**: Centrally governed by `style.css`, shared by `index.html`, `pages/about.html`, `pages/contact.html`, and `pages/projects.html`.
- **Navigation & Routing**: Single Page Application (SPA) section display via `[data-section]` in `script.js` with history integration (`pushState`).
- **Telemetry & CMS**: Firebase modular SDK integration in `firebase-config.js`, `tracker.js`, `portfolio-cms.js`, and `admin.html`.
- **Certificate Ribbon Architecture**: Continuous infinite 3D floating gallery directly below the Achievements section in `index.html` with CSS keyframe animation (`transform: translate3d(-50%, 0, 0)`), 3D perspective tilt, hover-to-pause, and touch-drag support.
- **Lightbox Architecture**: Dual-mode modal in `index.html` and `script.js` supporting both high-res image previews (`<img>`) and multi-page vector PDF documents (`<iframe>`) with accessibility focus trapping and escape/close triggers.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Cyber Glassmorphism CSS Tokens | Design tokens in `:root` and `body[data-theme='dark']` for frosted glass, luminous cyan/teal/indigo accents, and specular rim highlights with WCAG compliance | M1 | Survey (explorer_design_01) |
| F2 | Glassmorphic Cards & UI Modernization | `backdrop-filter: blur(20px)`, subtle gradients, luminous borders, and refined hover states on cards across `index.html` and all `pages/*.html` | M1 | Survey (explorer_design_01) |
| F3 | Developer Typography & Pill Badges | Modern monospaced/sans developer typography, glowing pill tags, and sleek badge components | M1 | Survey (explorer_design_01) |
| F4 | Certificate Asset Integration | Validated asset mapping for Hackathon 1st, Cyber Security, Infosys Springboard (3 PDFs), and Project Expo 2nd Place under `assets/cerificates/*` | M2 | Survey (explorer_ribbon_01) |
| F5 | Infinite Horizontal 3D Floating Ribbon | Continuous infinite marquee below Achievements with 60fps hardware acceleration and hover-to-pause | M2 | Survey (explorer_ribbon_01) |
| F6 | 3D Tilt Physics & Elevation Drop Shadows | Interactive card tilt/float physics (`perspective`, `rotateX/Y`) and layered drop shadows | M2 | Survey (explorer_ribbon_01) |
| F7 | Award & Category Badges | Visual category badges ("1st Place", "Hackathon", "Security", "Web Dev", "Expo") on each certificate card | M2 | Survey (explorer_ribbon_01) |
| F8 | Dual-Mode Lightbox Preview Modal | Modal supporting high-res image preview (`<img>`) and PDF viewer (`<iframe>`), ESC key, backdrop click, close button | M2 | Survey (explorer_ribbon_01) |
| F9 | Touch & Swipe Controls | Pointer events and touch-drag support for mobile and tablet users | M2 | Survey (explorer_ribbon_01) |
| F10 | Telemetry & CMS Preservation | Complete preservation of `tracker.js` Firebase presence, `admin.html` CMS sync, and `firebase-config.js` | M3 | Survey (explorer_system_01) |
| F11 | Cyber Terminal Emulator Preservation | Complete preservation of `script.js` 22-command registry, CLI inputs, and live HUD output | M3 | Survey (explorer_system_01) |
| F12 | Theme Switcher Harmony | Flawless switching between dark and light themes without contrast defects or unstyled flashes | M3 | Survey (explorer_system_01) |
| F13 | Responsive & Zero Layout Shift | 320px to 4K responsive layout, zero horizontal body overflow (`overflow-x: hidden`), `contain: layout paint` | M3 | Survey (explorer_system_01) |
| F14 | Accessibility (ARIA & Focus Trap) | Modal focus trapping, `aria-hidden` synchronization, keyboard accessibility, `role="log"` on terminal | M3 | Survey (explorer_system_01) |
| F15 | Zero JavaScript Syntax Errors | `node -c` validation passing cleanly with exit code 0 across all `.js` scripts | M3 | Survey (explorer_system_01) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Infrastructure | Create automated test runner and 4-tier test suite covering F1-F15; output TEST_READY.md | none | IN_PROGRESS |
| M1 | Cyber Glassmorphism Design System (R1) | CSS token overhaul in `style.css`, template updates in `index.html` and `pages/*.html` | none | PENDING |
| M2 | 3D Floating Certificate Ribbon & Lightbox (R2) | Certificate ribbon markup, 3D CSS physics, dual-mode lightbox, touch-drag controls | M1 | PENDING |
| M3 | System Preservation & Responsive Polish (R3) | Telemetry, Admin, Terminal preservation, a11y focus trap, theme contrast audit, node -c | M1, M2 | PENDING |
| M4 | Final 100% Verification & Forensic Audit | Run full E2E test suite, Reviewers, Challengers, and Forensic Auditor gating | M0, M1, M2, M3 | PENDING |

## Code Layout
- `style.css`: Primary stylesheet containing design tokens, glassmorphic card classes, ribbon animations, lightbox styles, and responsive media queries.
- `index.html`: Main SPA containing sections (including `#achievements` and the certificate ribbon), `#lightboxModal`, and `#terminal`.
- `pages/about.html`, `pages/contact.html`, `pages/projects.html`: Subpages consuming `style.css`.
- `script.js`: Client-side logic for section navigation, theme switching, terminal emulator, and ribbon / lightbox modal controls.
- `tracker.js`: Firebase presence and visitor telemetry (read-only / preserved).
- `firebase-config.js`: Firebase configuration and SDK initialization (read-only / preserved).
- `admin.html`: CMS admin dashboard (read-only / preserved).
- `assets/cerificates/*`: Certificate media files (JPEGs and PDFs).
