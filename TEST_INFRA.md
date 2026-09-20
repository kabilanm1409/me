# Portfolio Test Infrastructure & Architecture Guide

**Milestone**: M0 (E2E Test Suite & Test Runner)  
**Author**: `test_writer_01` (`teamwork_preview_test_writer`)  
**Workspace**: `c:\Users\ELCOT\portfolio`  
**Execution Command**: `node tests/run_tests.js`  

---

## 1. Test Architecture Overview

The testing harness for the portfolio modernization project provides automated, zero-external-dependency quality assurance across all 15 features (F1 to F15) defined in `PROJECT.md` and requirements R1 to R3 in `ORIGINAL_REQUEST.md`.

### Core Engineering Principles:
1. **Zero External Dependencies**: Built exclusively on standard Node.js runtime modules (`node:assert/strict`, `node:child_process`, `node:fs`, `node:path`, `node:crypto`). No third-party packages (Jest, Mocha, Cypress, Playwright) are required.
2. **Progressive Testability & Gated Milestones**: The suite supports milestone-targeted execution (`--milestone=M1`, `--milestone=M2`, `--milestone=M3`), tier filtering (`--tier=1..4`, `--static`), and baseline diagnostic reporting (`--baseline`).
3. **Deterministic Expected Output Derivation**: Every test assertion is derived from authoritative specifications in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and explorer survey reports (`explorer_design_01`, `explorer_ribbon_01`, `explorer_system_01`).
4. **Adversarial & Boundary Verification**: Includes explicit tests for HTML attribute omission, ultra-narrow mobile viewports (320px), long unbroken string blowout defense, theme mutation state cleanups, XSS sanitization in shell commands, and honeypot spam protection.

---

## 2. Directory Structure

```
c:\Users\ELCOT\portfolio\
├── tests\
│   ├── run_tests.js               # CLI test runner entrypoint with flag parser & ANSI reporter
│   ├── static_integrity.test.js   # Static syntax (node -c) & physical certificate assets audit
│   ├── tier1_features.test.js     # Tier 1: Feature Coverage (F1 to F15)
│   ├── tier2_boundaries.test.js   # Tier 2: Boundary, edge cases & corner conditions (B1 to B5)
│   ├── tier3_combinations.test.js # Tier 3: Cross-feature combinations & architectural interactions (C1 to C4)
│   ├── tier4_scenarios.test.js    # Tier 4: Real-world workload journeys & lifecycle simulations (W1 to W4)
│   └── helpers\
│       ├── test_framework.js      # Zero-dependency test harness (describe, test, assert, reporter)
│       ├── test_fixtures.js       # Ground-truth schemas, certificate metadata, token lists
│       └── dom_mock.js            # AST-like HTML/CSS parsing utilities & browser environment mocks
├── TEST_INFRA.md                  # Test architecture & coverage matrix (this file)
└── TEST_READY.md                  # Readiness scorecard & baseline execution report
```

---

## 3. The 4-Tier Automated Testing Methodology

### Static Integrity & Physical Assets Audit (`tests/static_integrity.test.js`)
- **Syntax Validation (`node -c`)**: Executes Node.js byte-code compiler check across all JavaScript files (`script.js`, `tracker.js`, `firebase-config.js`, `portfolio-cms.js`, `server.js`) with exit code 0 requirement.
- **Physical Certificate Audit**: Inspects disk storage under `assets/cerificates/` to verify existence and non-empty byte count for:
  - `IMG_20260701_185332433.jpg` (Hackathon 1st Place - min 100 KB)
  - `IMG_20260701_185137413.jpg` (Advanced Cyber Security - min 150 KB)
  - `internship/IMG_20260701_185232887.jpg` (e-soft Full Stack - min 200 KB)
  - `Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf` (HTML5 - min 200 KB)
  - `Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf` (CSS3 - min 200 KB)
  - `Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf` (JavaScript - min 100 KB)
- **Directory Spelling Integrity**: Asserts that paths strictly use `assets/cerificates/` (single 't') to prevent dead links.

### Tier 1: Feature Coverage (F1 to F15) (`tests/tier1_features.test.js`)
Validates specific primary functionality for each feature:
- **F1**: CSS custom property tokens in `:root` and `body[data-theme='dark']` (`--glass-surface`, `--glass-border`, `--glass-blur`, `--cyber-cyan`, `--cyber-teal`, `--cyber-indigo`).
- **F2**: Glassmorphic cards with `backdrop-filter: blur()`, frosted backgrounds, and hover elevation `translateY(-4px)`.
- **F3**: Developer typography (`Manrope`, `Inter`, `monospace`) and glowing pill tags (`border-radius: 999px`).
- **F4**: Certificate asset integration mapping all 5 physical certificates and project awards.
- **F5**: Infinite 3D floating certificate ribbon DOM structure, `@keyframes ribbonScroll` with `translate3d(-50%, 0, 0)`, and hover-to-pause.
- **F6**: 3D tilt physics (`perspective`, `transform-style: preserve-3d`) and `rotateX`/`rotateY` calculation.
- **F7**: Award and category badges ("1st Place", "2nd Place", "Hackathon", "Security", "Web Dev").
- **F8**: Dual-mode lightbox preview modal with `#lightboxImage` and `#lightboxFrame` (iframe for PDFs).
- **F9**: Touch and pointer-drag support for mobile and tablet users.
- **F10**: Telemetry and CMS preservation (`tracker.js`, `firebase-config.js` vault, `admin.html`).
- **F11**: Cyber terminal emulator 22-command registry and HUD outputs.
- **F12**: Theme switcher harmony with `localStorage('km_theme')` and clean `dataset.theme` deletion.
- **F13**: Responsive layout protection (`overflow-x: hidden`, breakpoints at 860px/560px, CSS containment).
- **F14**: Accessibility compliance (`role="dialog"` on lightbox, `role="log"` on terminal, Escape key handling).
- **F15**: Zero syntax errors verified across all JavaScript scripts.

### Tier 2: Boundary & Corner Cases (`tests/tier2_boundaries.test.js`)
- **B1**: Missing attributes defense (`alt` and `src` on images, `rel="noopener noreferrer"` on `target="_blank"`, required form attributes).
- **B2**: Ultra-narrow mobile viewport (320px) inspection ensuring fluid rules without rigid overflow widths.
- **B3**: Long unbroken string handling in terminal (`word-break: break-all` on `.t-line`) to defend against blowout from 64+ char cryptographic hashes.
- **B4**: Theme attribute mutation state integrity: switching between dark mode (`data-theme="dark"`) and light mode (complete property deletion).
- **B5**: Terminal command boundary conditions: invalid commands (`command not found`), HTML escaping against XSS injection (`escapeHtml`), and unauthorized `sudo` security notices.

### Tier 3: Cross-Feature Combinations (`tests/tier3_combinations.test.js`)
- **C1**: Certificate ribbon anchoring strictly inside `<section id="achievements">`, ensuring visibility during Achievements SPA view and complete hiding during other section views.
- **C2**: Glassmorphic component token resolution across light and dark modes, ensuring adequate contrast.
- **C3**: Dual-mode lightbox URL dispatcher: routing `.jpg` to `<img>`, `.pdf` to `<iframe>`, and synthetic badge to custom award card.
- **C4**: Terminal navigation link `#nav-terminal` display state synchronized with active terminal section.

### Tier 4: Real-World Workload Scenarios (`tests/tier4_scenarios.test.js`)
- **W1**: Full SPA navigation flow simulation (`home` $\rightarrow$ `skills` $\rightarrow$ `achievements` $\rightarrow$ `terminal` $\rightarrow$ `contact` $\rightarrow$ `home`) verifying section switching, history push, and `aria-current` updates.
- **W2**: Certificate inspection end-to-end lifecycle: user clicks thumbnail $\rightarrow$ modal opens $\rightarrow$ `body` overflow locked $\rightarrow$ `aria-hidden="false"` $\rightarrow$ Escape pressed $\rightarrow$ modal closes and state restored.
- **W3**: Theme persistence across simulated browser reload: reading `km_theme` from `localStorage` $\rightarrow$ applying `data-theme` $\rightarrow$ toggling $\rightarrow$ re-verifying persistence.
- **W4**: Telemetry & contact form security workflow: honeypot spam detection, SHA-256 HMAC signature computation, and storage.

---

## 4. Test Runner CLI Specification

Execute tests from the project root using Node.js:

```powershell
# 1. Run full test suite
node tests/run_tests.js

# 2. Run in baseline mode (M0 baseline recording, exit code 0)
node tests/run_tests.js --baseline

# 3. Run specific tiers
node tests/run_tests.js --static           # Static syntax & asset audits
node tests/run_tests.js --tier=1           # Tier 1 Feature Coverage (F1-F15)
node tests/run_tests.js --tier=2           # Tier 2 Boundary & Corner Cases
node tests/run_tests.js --tier=3           # Tier 3 Cross-Feature Combinations
node tests/run_tests.js --tier=4           # Tier 4 Real-World Scenarios

# 4. Run tests by project milestone
node tests/run_tests.js --milestone=M1     # Cyber Glassmorphism Design System
node tests/run_tests.js --milestone=M2     # 3D Certificate Ribbon & Lightbox
node tests/run_tests.js --milestone=M3     # System Preservation & Responsive Polish

# 5. Output JSON format
node tests/run_tests.js --json
```

---

## 5. Requirement & Feature Coverage Matrix

| Req | Feature ID | Feature Name | Target Milestone | Test Suite Location | Primary Assertion |
|---|---|---|---|---|---|
| **R1** | **F1** | Cyber Glassmorphism Tokens | M1 | `tests/tier1_features.test.js` | `:root` & `body[data-theme='dark']` CSS custom properties |
| **R1** | **F2** | Glassmorphic Cards & Glow | M1 | `tests/tier1_features.test.js` | `.card` backdrop-filter blur & hover elevation |
| **R1** | **F3** | Developer Typography & Badges | M1 | `tests/tier1_features.test.js` | Manrope/monospace fonts & pill border-radius (999px) |
| **R2** | **F4** | Certificate Asset Integration | M2 | `tests/static_integrity.test.js` | Physical asset presence, size & spelling |
| **R2** | **F5** | Infinite 3D Floating Ribbon | M2 | `tests/tier1_features.test.js` | Keyframe `translate3d(-50%, 0, 0)` & hover pause |
| **R2** | **F6** | 3D Tilt Physics & Shadows | M2 | `tests/tier1_features.test.js` | Perspective in CSS & rotateX/Y in JS |
| **R2** | **F7** | Award & Category Badges | M2 | `tests/tier1_features.test.js` | Category badge markup ("1st Place", "Hackathon", etc.) |
| **R2** | **F8** | Dual-Mode Lightbox Modal | M2 | `tests/tier1_features.test.js` | Lightbox image + PDF iframe modal dual preview |
| **R2** | **F9** | Touch & Swipe Controls | M2 | `tests/tier1_features.test.js` | Pointerdown/touchmove event listeners in script.js |
| **R3** | **F10** | Telemetry & CMS Preservation | M3 | `tests/tier1_features.test.js` | `tracker.js`, `_VAULT_KEY`, and `admin.html` intact |
| **R3** | **F11** | Cyber Terminal Emulator | M3 | `tests/tier1_features.test.js` | 22-command registry execution & HUD output |
| **R3** | **F12** | Theme Switcher Harmony | M3 | `tests/tier1_features.test.js` | `km_theme` localStorage sync & dataset.theme deletion |
| **R3** | **F13** | Responsive & Zero Layout Shift | M3 | `tests/tier1_features.test.js` | `overflow-x: hidden`, breakpoints & CSS containment |
| **R3** | **F14** | Accessibility (ARIA & Focus) | M3 | `tests/tier1_features.test.js` | `role="dialog"`, `role="log"`, Escape key handler |
| **R3** | **F15** | Zero JavaScript Syntax Errors | M3 | `tests/static_integrity.test.js` | Clean `node -c` validation across all 5 scripts |
| **R3** | **B1** | Attribute Integrity | M3 | `tests/tier2_boundaries.test.js` | `alt` on img, `rel="noopener noreferrer"` on blank links |
| **R3** | **B2** | Small Viewport Defense | M3 | `tests/tier2_boundaries.test.js` | 320px responsive fluid widths without fixed overflow |
| **R3** | **B3** | Long String Defense | M3 | `tests/tier2_boundaries.test.js` | `word-break: break-all` on `.t-line` terminal outputs |
| **R3** | **B4** | Theme State Mutation | M3 | `tests/tier2_boundaries.test.js` | Clean deletion of `dataset.theme` for light mode |
| **R3** | **B5** | Terminal Error & XSS Defense | M3 | `tests/tier2_boundaries.test.js` | Command fallback, `escapeHtml`, sudo security notice |
| **R2** | **C1** | Ribbon Anchoring in SPA | M2 | `tests/tier3_combinations.test.js` | Ribbon nested in `#achievements` and hidden elsewhere |
| **R1** | **C2** | Cross-Theme Token Resolution | M1 | `tests/tier3_combinations.test.js` | Surface and text tokens resolve in dark & light modes |
| **R2** | **C3** | Lightbox Dual-Mode Dispatch | M2 | `tests/tier3_combinations.test.js` | PDF vs Image vs Synthetic card dynamic switching |
| **R3** | **C4** | Terminal HUD Nav Coupling | M3 | `tests/tier3_combinations.test.js` | `#nav-terminal` display tied to terminal section |
| **R3** | **W1** | SPA Navigation Flow | M3 | `tests/tier4_scenarios.test.js` | Section switching, history push, active link updates |
| **R2** | **W2** | Certificate Modal Lifecycle | M2 | `tests/tier4_scenarios.test.js` | Click $\rightarrow$ open $\rightarrow$ body lock $\rightarrow$ Escape $\rightarrow$ close |
| **R3** | **W3** | Theme Persistence Across Reload | M3 | `tests/tier4_scenarios.test.js` | Reading and writing `km_theme` on mock reload |
| **R3** | **W4** | Telemetry & Form Security | M3 | `tests/tier4_scenarios.test.js` | Honeypot rejection, SHA-256 HMAC request signing |
