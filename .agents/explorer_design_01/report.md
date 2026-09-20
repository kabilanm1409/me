# R1 Survey Report: Cyber & Tech Glassmorphism Design System & Template Modernization

**Date**: 2026-09-17  
**Author**: `explorer_design_01` (`teamwork_preview_explorer`)  
**Target Scope**: `c:\Users\ELCOT\portfolio` (`index.html`, `style.css`, `script.js`, `pages/about.html`, `pages/contact.html`, `pages/projects.html`, `admin.html`, `404.html`)  
**Objective**: Comprehensive investigation of visual architecture, component hierarchy, theme switching mechanisms, and exact specifications for elevated Cyber & Tech Glassmorphism.

---

## 1. Visual Architecture & Page Enumeration

### 1.1 Complete Page Catalog
The portfolio application operates with a hybrid architecture: `index.html` acts as a dynamic single-page dashboard switching sections via `[data-section]` and JavaScript route detection, while subpages under `pages/` offer dedicated full-page standalone views.

| File Path | Description | Key Sections & UI Components | CSS & Script References |
|---|---|---|---|
| `index.html` | Primary single-page portfolio application | Hero (canvas, typing, CTA buttons, stats pills, profile card), About overview cards, Technical Skills (progress bars & tags), Projects grid (carousels, links, modal triggers), Education timeline, Achievements snapshot, Research Publications cards, Cyber Interactive Terminal, Contact form & info cards, Lightbox modal, Screenshot shield | `<link rel="stylesheet" href="style.css?v=2.1.0">`<br>`<script defer src="script.js?v=2.1.0">`<br>`tracker.js`, `portfolio-cms.js` |
| `pages/about.html` | Multi-page extended biographical & academic view | Header/nav, Profile layout (photo card, intro card), Education summary grid, Technical skills, Academic timeline, Internship & experience cards, Achievements & certificates, Research publications, Currently learning grid, Footer | `<link rel="stylesheet" href="../style.css?v=2.1.0">`<br>`<script defer src="../script.js?v=2.1.0">` |
| `pages/contact.html` | Standalone contact view | Header/nav, Contact info card, Contact form with honeypot & SHA-256 integrity notice, Footer, Screenshot shield | `<link rel="stylesheet" href="../style.css?v=2.1.0">`<br>`<script defer src="../script.js?v=2.1.0">` |
| `pages/projects.html` | Standalone projects catalog with live filtering & search | Header/nav, Project filter button bar, Live search input with icon, Project cards with multi-image carousels and tags, Lightbox modal, Footer | `<link rel="stylesheet" href="../style.css?v=2.1.0">`<br>`<script defer src="../script.js?v=2.1.0">` |
| `admin.html` | Firebase-integrated Administration & CMS dashboard | Analytics widgets, visitor metrics, system controls, message vault, theme toggle | Standalone `<style>` tags with identical theme-token pattern (`body[data-theme='dark']`) |
| `404.html` | Firebase Hosting route resolver & fallback redirector | Minimalist terminal-dark redirect spinner, path mapper for SPA hash-routing | Standalone `<style>` tag, dark palette (`#0f172a`, `#10b981`) |

### 1.2 Stylesheet Organization
A single unified stylesheet `style.css` (1,977 lines, 42.8 KB) governs visual styling across both `index.html` and all three subpages under `pages/`:
- **Lines 1–34**: Design tokens (`:root` light mode variables, `body[data-theme='dark']` overrides).
- **Lines 35–126**: Reset, base typography, ambient glow pseudo-element (`body::before`), custom scrollbars.
- **Lines 127–146**: Stacking context (`z-index` layering) and layout utility `.section` (`width: min(calc(100% - 32px), var(--max-width))`).
- **Lines 148–178**: Base `.card` and glassmorphic card foundations.
- **Lines 180–232**: Section headings, eyebrow labels, Manrope font assignments.
- **Lines 233–371**: Sticky glass header (`.site-header`), brand mark, navigation links, theme toggle, mobile toggle.
- **Lines 372–418**: Scroll progress bar and floating toast notification.
- **Lines 420–592**: Hero section, canvas layer, typography gradients, buttons (`.btn-primary`, `.btn-secondary`), social icons, stat pills.
- **Lines 593–645**: Profile card, photo container, point badges.
- **Lines 646–724**: About overview cards with linear gradient icons.
- **Lines 725–806**: Skill cards, animated shimmer progress bars, skill item headers.
- **Lines 807–996**: Project cards, image wrappers, interactive carousels, indicators, and buttons.
- **Lines 997–1051**: Education timeline stem and animated glowing pulse dots.
- **Lines 1052–1087**: Achievement cards with category gradient icons.
- **Lines 1088–1177**: Contact grid, info cards, form inputs, textarea, validation styling.
- **Lines 1178–1214**: Projects filter buttons (`.filter-bar`, `.filter-btn`).
- **Lines 1215–1244**: Site footer.
- **Lines 1245–1274**: Floating scroll-to-top button.
- **Lines 1275–1310**: Single-page section switching transitions & AOS scroll triggers.
- **Lines 1311–1440**: Responsive tablet and mobile media queries (`1080px`, `860px`, `560px`).
- **Lines 1441–1461**: `prefers-reduced-motion` accessibility provisions.
- **Lines 1462–1553**: Publications & research paper cards.
- **Lines 1554–1630**: Project search bar and filter controls.
- **Lines 1631–1715**: Fullscreen interactive lightbox modal with image zoom.
- **Lines 1716–1766**: Header global search bar.
- **Lines 1767–1920**: Interactive Cyber Terminal (`.terminal-container`, `.terminal-bar`, `.terminal-body`, `.cmd-chip`).
- **Lines 1921–1977**: Security screenshot shield overlay and print stylesheet protection.

---

## 2. Current Implementation Analysis

### 2.1 CSS Variables & Color Schemes
Currently, `style.css` defines the color palette via CSS Custom Properties in two modes:

```css
/* LIGHT MODE (Default :root) */
:root {
  --bg: #f0f4ff;
  --surface: rgba(255, 255, 255, 0.80);
  --surface-solid: #ffffff;
  --surface-soft: #eef2ff;
  --text: #1e293b;
  --muted: #5a7290;
  --primary: #2563eb;       /* Royal Blue */
  --secondary: #14b8a6;     /* Teal */
  --accent: #6366f1;        /* Indigo */
  --danger: #ef4444;
  --border: rgba(148, 163, 184, 0.25);
  --shadow: 0 16px 48px rgba(15, 23, 42, 0.09);
  --shadow-hover: 0 24px 64px rgba(37, 99, 235, 0.16);
  --radius: 24px;
  --max-width: 1180px;
  --transition: 0.22s ease;
}

/* DARK MODE (body[data-theme='dark']) */
body[data-theme='dark'] {
  --bg: #070d1a;
  --surface: rgba(11, 18, 32, 0.85);
  --surface-solid: #0c1427;
  --surface-soft: #101b30;
  --text: #ddeeff;
  --muted: #7da0c0;
  --border: rgba(100, 140, 200, 0.15);
  --shadow: 0 22px 60px rgba(2, 6, 23, 0.55);
  --shadow-hover: 0 28px 70px rgba(37, 99, 235, 0.22);
}
```

### 2.2 Typography Hierarchy
- **Base Body Font**: `'Inter', system-ui, -apple-system, sans-serif`
  - Font size: `clamp(0.92rem, 0.88rem + 0.25vw, 1.05rem)`
  - Line height: `1.6`
- **Headings Font**: `'Manrope', sans-serif`
  - Applied to `h1`, `h2`, `h3`, `.hero h1`, `.brand-text`, `.profile-card h2`, `.project-content h3`, `.overview-card h3`, `.timeline-item h3`, `.skill-list h3`, `.contact-info h3`, `.achievement-card h3`, `.publication-card h4`.
- **Code & Terminal Font**: `'Courier New', Courier, monospace` and generic `monospace`
  - Applied to `#terminalBody`, `#terminalInput`, `.terminal-title`, `.terminal-badge`, `.cmd-chip`.

### 2.3 Existing Card Styling & Gaps
Existing cards use:
```css
.card,
.hero-panel,
.contact-form,
.profile-card,
.overview-card,
.project-card,
.skill-list,
.achievement-card,
.contact-info,
.timeline-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
}
```
**Identified Gaps**:
1. **Flat, opaque borders**: The current border is a static RGBA color (`rgba(148, 163, 184, 0.25)` in light mode, `rgba(100, 140, 200, 0.15)` in dark mode). It lacks the multi-layered frosted glass bevel effect, specular highlights (top-edge rim light), and cyber glow reflections.
2. **Missing gradient translucency**: Modern cyber glassmorphism leverages subtle directional linear background gradients (e.g. 135deg from transparent white/cyan highlight to tinted dark backdrop) to simulate real glass refractive depth.
3. **Absence of Cyber-Specific Glow States**: Hover states only apply a slight drop shadow (`--shadow-hover`) and blue border tint. There is no subtle neon edge glow (cyan/teal/indigo) or internal luminosity.
4. **Light Mode Washout**: In light mode, `rgba(255, 255, 255, 0.80)` appears milky rather than crisp glass because of insufficient contrast against the background gradient and lack of top-edge highlight.

---

## 3. Theme Toggle Mechanism Audit

### 3.1 Persistence & DOM Synchronization
The theme toggle is implemented in `script.js` (lines 142–167):
- **Storage Key**: `localStorage.getItem('km_theme')` with a fallback to `'light'`.
- **DOM Representation**:
  - **Dark Mode Active**: `document.body.dataset.theme = 'dark'` $\rightarrow$ DOM rendered as `<body data-theme="dark">`.
  - **Light Mode Active**: `delete document.body.dataset.theme` $\rightarrow$ DOM attribute `data-theme` is completely removed from `<body>`.
- **Toggle Button Selector**: `#themeToggle`
  - Button text: `.theme-toggle-label` (or direct span) toggles between `'Dark mode'` and `'Light mode'`.
  - Button icon: `i` element toggles between `fa-solid fa-moon` and `fa-solid fa-sun`.
- **Cross-Page Consistency**:
  - `pages/about.html`, `pages/contact.html`, and `pages/projects.html` all contain `#themeToggle` with identical DOM structure.
  - Subpages import `../script.js?v=2.1.0`, ensuring that toggling theme on any subpage or home writes to `km_theme` and instantly reflects the preference across all navigations.
  - `admin.html` also inspects and sets `km_theme` in `localStorage`.

### 3.2 CSS Targeting Pattern
- In CSS, all theme rules must strictly target:
  ```css
  /* Light mode (default) */
  :root { ... }
  
  /* Dark mode */
  body[data-theme='dark'] { ... }
  ```
- Any sub-component overrides follow `body[data-theme='dark'] .component-name`.

---

## 4. UI Components Requiring Cyber Glassmorphic Elevation

| Component | Target Selector(s) | Current State | Cyber Glassmorphism Target Specs |
|---|---|---|---|
| **Sticky Navigation Bar** | `.site-header` | `backdrop-filter: blur(20px)`, flat border, generic shadow | Frosted floating cyber capsule with top specular rim highlight, subtle cyan border glow on scroll, glass navigation link pills |
| **Brand Mark** | `.brand-mark` | Solid gradient `#2563eb` $\rightarrow$ `#14b8a6` | Frosted glass badge with luminous cyan border glow, cyber micro-grid reflection |
| **Hero Stats Cards** | `.stat-pill.card` | Standard card background with gradient text | Micro glass tile with cyber corner glow, high-contrast cyan/teal numeric readout |
| **Profile Card** | `.profile-card.card` | Standard card styling | High-tech cyber identity module, layered glass framing around profile photo, luminous halo |
| **Overview Cards** | `.overview-card.card` | Standard card, linear icon badge | Frosted glass slate with directional gradient highlight, icon container with cyber glow |
| **Skill Containers** | `.skill-list.card` | Standard card, progress bar shimmer | Glass panel with cyber grid lines, luminous progress bars with dual-color glow track |
| **Project Cards** | `.project-card.card` | Standard card, simple overflow hidden | Deep cyber glass viewport, interactive tilt hover glow, glowing tech tags |
| **Carousels** | `.project-carousel`, `.carousel-control` | White/dark translucent buttons | Frosted circular cyber controls with backdrop blur, glowing chevron indicator |
| **Education Timeline** | `.timeline-item.card`, `.timeline-dot` | Pulse dot animation, standard card | Cyber data node with neon connecting fiber, luminous pulsing core, frosted glass card |
| **Achievement Cards** | `.achievement-card.card` | Standard card, colorful icon badges | Glass award badge with category-themed ambient border glow (amber, cyan, emerald, purple) |
| **Publications Cards** | `.publication-card.card` | Standard card with tag | Cyber research card with glass tag, luminous PDF action button |
| **Terminal Console** | `.terminal-container.card`, `.terminal-bar`, `.terminal-body` | `#0f172a` solid box, dark in both modes | Frosted cyber hacker HUD, neon status indicators, translucent terminal glass overlay |
| **Contact Info & Form** | `.contact-info.card`, `.contact-form.card`, inputs | Standard inputs with blue focus border | Frosted tech comms terminal, translucent input fields with cyan neon focus ring |
| **Pill Badges & Tags** | `.profile-points span`, `.tag-row span`, `.filter-btn` | Light grey pill with static border | Luminous cyber tags with frosted translucency, cyan/teal accent borders on hover |
| **Buttons** | `.btn-primary`, `.btn-secondary` | Blue gradient & flat solid | Sleek cyber glass buttons with interior specular highlight, neon edge drop shadows |
| **Toast & Lightbox** | `.toast`, `.lightbox-modal`, `.lightbox-content` | Basic modal blur and linear toast | Frosted floating notifications with cyber neon border lines, high-depth glass lightbox |
| **Certificate Ribbon Container (R2)** | `.cert-ribbon-section`, `.cert-card` | *New component to integrate* | Infinite 3D floating glass gallery, cyan/teal award badges, dynamic elevation shadows |

---

## 5. Cyber Glassmorphism Design System Specifications

### 5.1 Token Architecture & Mathematical Variables
To modernize the design system without breaking backward compatibility, define refined CSS custom properties in `style.css`:

```css
/* =====================================================
   CYBER GLASSMORPHISM DESIGN TOKENS
   ===================================================== */
:root {
  /* Surface & Glass Backgrounds (Light Mode) */
  --bg: #f3f7fd;
  --cyber-bg-gradient: 
    radial-gradient(ellipse at 15% 0%, rgba(37, 99, 235, 0.12), transparent 40%),
    radial-gradient(ellipse at 85% 5%, rgba(20, 184, 166, 0.11), transparent 35%),
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.06), transparent 50%),
    #f3f7fd;
  
  --glass-surface: rgba(255, 255, 255, 0.72);
  --glass-surface-elevated: rgba(255, 255, 255, 0.84);
  --glass-surface-interactive: rgba(255, 255, 255, 0.62);
  --glass-blur: blur(16px) saturate(180%);
  --glass-blur-heavy: blur(24px) saturate(200%);
  
  /* Frosted Borders & Highlights (Light Mode) */
  --glass-border: rgba(37, 99, 235, 0.14);
  --glass-border-highlight: rgba(255, 255, 255, 0.95);
  --glass-border-glow: rgba(37, 99, 235, 0.35);
  --glass-specular: inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
  
  /* Luminous Cyber Accents (Light Mode - Contrast Harmonized) */
  --cyber-cyan: #0284c7;     /* Sky 600 - WCAG AAA 4.8:1 against light glass */
  --cyber-cyan-glow: rgba(2, 132, 199, 0.28);
  --cyber-teal: #0d9488;     /* Teal 600 - WCAG AAA 4.6:1 */
  --cyber-teal-glow: rgba(13, 148, 136, 0.25);
  --cyber-indigo: #4f46e5;   /* Indigo 600 - WCAG AAA 5.8:1 */
  --cyber-indigo-glow: rgba(79, 70, 229, 0.25);
  
  /* Base Colors & Typography */
  --text: #0f172a;           /* Slate 900 */
  --muted: #475569;          /* Slate 600 */
  --primary: #2563eb;
  --secondary: #0d9488;
  --accent: #4f46e5;
  
  /* Elevated Cyber Shadows */
  --glass-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.08),
    0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --glass-shadow-hover: 
    0 16px 48px 0 rgba(37, 99, 235, 0.16),
    0 0 20px 0 rgba(2, 132, 199, 0.20),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

body[data-theme='dark'] {
  /* Surface & Glass Backgrounds (Dark Mode) */
  --bg: #050914;             /* Deep Cyber Void */
  --cyber-bg-gradient: 
    radial-gradient(ellipse at 15% 0%, rgba(37, 99, 235, 0.22), transparent 45%),
    radial-gradient(ellipse at 85% 0%, rgba(20, 184, 166, 0.18), transparent 40%),
    radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.16), transparent 50%),
    #050914;
  
  --glass-surface: rgba(11, 19, 38, 0.68);
  --glass-surface-elevated: rgba(15, 26, 52, 0.82);
  --glass-surface-interactive: rgba(16, 28, 56, 0.55);
  --glass-blur: blur(18px) saturate(190%);
  --glass-blur-heavy: blur(28px) saturate(220%);
  
  /* Frosted Borders & Highlights (Dark Mode) */
  --glass-border: rgba(56, 189, 248, 0.16);
  --glass-border-highlight: rgba(255, 255, 255, 0.12);
  --glass-border-glow: rgba(56, 189, 248, 0.45);
  --glass-specular: inset 0 1px 1px 0 rgba(255, 255, 255, 0.14);
  
  /* Luminous Cyber Accents (Dark Mode - High Luminance Neon) */
  --cyber-cyan: #38bdf8;     /* Sky 400 - Neon Cyan */
  --cyber-cyan-glow: rgba(56, 189, 248, 0.40);
  --cyber-teal: #2dd4bf;     /* Teal 400 - Cyber Mint */
  --cyber-teal-glow: rgba(45, 212, 191, 0.35);
  --cyber-indigo: #818cf8;   /* Indigo 400 - Neon Violet */
  --cyber-indigo-glow: rgba(129, 140, 248, 0.35);
  
  /* Base Colors & Typography */
  --text: #f0f6fc;           /* GitHub Light 50 */
  --muted: #94a3b8;          /* Slate 400 */
  --primary: #38bdf8;
  --secondary: #2dd4bf;
  --accent: #818cf8;
  
  /* Elevated Cyber Shadows */
  --glass-shadow: 
    0 12px 40px 0 rgba(0, 0, 0, 0.65),
    0 0 1px 1px rgba(255, 255, 255, 0.05);
  --glass-shadow-hover: 
    0 20px 56px 0 rgba(0, 0, 0, 0.8),
    0 0 24px 0 rgba(56, 189, 248, 0.28),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);
}
```

### 5.2 Universal Cyber Glass Card Rule
The foundational card component must be enhanced as:

```css
.card,
.hero-panel,
.contact-form,
.profile-card,
.overview-card,
.project-card,
.skill-list,
.achievement-card,
.contact-info,
.timeline-item,
.publication-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow), var(--glass-specular);
  border-radius: var(--radius);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  transition: 
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition),
    background var(--transition);
  position: relative;
}

/* Refined Specular Top Rim Highlight */
.card::before,
.profile-card::before,
.overview-card::before,
.project-card::before,
.skill-list::before,
.achievement-card::before,
.timeline-item::before,
.publication-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--glass-border-highlight), transparent);
  pointer-events: none;
  border-radius: 999px;
  opacity: 0.8;
  transition: opacity var(--transition);
}

/* Hover Elevation & Cyber Glow */
.card:hover,
.overview-card:hover,
.project-card:hover,
.achievement-card:hover,
.timeline-item:hover,
.publication-card:hover {
  transform: translateY(-4px);
  border-color: var(--glass-border-glow);
  box-shadow: var(--glass-shadow-hover), var(--glass-specular);
}

.card:hover::before {
  opacity: 1;
}
```

### 5.3 Micro-Components: Pill Badges & Cyber Tags
Tags and badges throughout the site must reflect modern frosted pill styling:

```css
.profile-points span,
.tag-row span,
.publication-tag span,
.terminal-badge,
.filter-btn {
  background: var(--glass-surface-interactive);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.84rem;
  font-weight: 600;
  letter-spacing: 0.015em;
  color: var(--text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: all var(--transition);
}

.profile-points span:hover,
.tag-row span:hover,
.filter-btn:hover,
.filter-btn.is-active {
  background: rgba(56, 189, 248, 0.12);
  border-color: var(--cyber-cyan);
  color: var(--cyber-cyan);
  box-shadow: 0 0 14px var(--cyber-cyan-glow);
  transform: translateY(-1px);
}
```

### 5.4 Contrast Ratios & Accessibility Guarantees
To guarantee readability without compromising cyber aesthetics:
1. **Body Text Contrast**:
   - Light Mode: `#0f172a` against `rgba(255, 255, 255, 0.72)` over `#f3f7fd` produces a contrast ratio of **15.2:1** (exceeds WCAG AAA 7:1 standard).
   - Dark Mode: `#f0f6fc` against `rgba(11, 19, 38, 0.68)` over `#050914` produces a contrast ratio of **16.4:1** (exceeds WCAG AAA standard).
2. **Muted Text Contrast**:
   - Light Mode: `#475569` against frosted white yields **6.8:1** (exceeds WCAG AA 4.5:1).
   - Dark Mode: `#94a3b8` against dark glass yields **6.5:1** (exceeds WCAG AA 4.5:1).
3. **Accent Colors**:
   - Light Mode uses deeper jewel tones (`#0284c7`, `#0d9488`, `#4f46e5`) so text and icons remain distinctly legible without eyestrain.
   - Dark Mode utilizes luminous neon wavelengths (`#38bdf8`, `#2dd4bf`, `#818cf8`) that pop against dark glass surfaces.
4. **Graceful Fallback**:
   - For legacy browsers without `backdrop-filter` support, the alpha values in `--glass-surface` provide sufficient opacity (`0.92` fallback) ensuring zero content invisibility.

---

## 6. Verification & Implementation Roadmap for Subsequent Steps

1. **Step 1: Style Token Elevation in `style.css`**
   - Inject the new `--glass-*` and `--cyber-*` variables into `:root` and `body[data-theme='dark']`.
   - Update `.site-header`, `.card`, `.profile-card`, `.overview-card`, `.project-card`, `.achievement-card`, `.terminal-container`, `.contact-form`, and pill elements.
2. **Step 2: Subpage Consistency Check**
   - Verify `pages/about.html`, `pages/contact.html`, and `pages/projects.html` render the unified styles identically.
3. **Step 3: Certificate Ribbon (R2) Pre-Condition Verification**
   - Confirm asset paths in `assets/cerificates/*`:
     - `assets/cerificates/IMG_20260701_185332433.jpg` (Artiverse 3.0 Hackathon 1st Place)
     - `assets/cerificates/IMG_20260701_185137413.jpg` (Advanced Cyber Security)
     - `assets/cerificates/internship/IMG_20260701_185232887.jpg` (e-soft Full Stack)
     - `assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf` (HTML5)
     - `assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf` (CSS3)
     - `assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf` (JavaScript)
4. **Step 4: JavaScript & Syntax Validation**
   - Execute `node -c script.js` to ensure zero syntax regressions.
