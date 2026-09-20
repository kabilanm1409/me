# Changes Summary: Milestone M2 (Requirement R2)
**Worker**: `worker_ribbon_01`  
**Target**: Milestone M2 - Animated Infinite 3D Floating Certificate Ribbon & Lightbox Modal  
**Date**: 2026-09-17  

---

## 1. Files Modified

### `index.html`
- **Location 1**: Directly below `.achievement-grid` inside `<section class="section achievements" id="achievements" data-section="achievements">`, before `.publications-heading`.
  - Added `#certRibbonWrapper` with header and accessible badge `<i class="fa-solid fa-ribbon"></i> Verified Credentials`.
  - Added `#certRibbonViewport` and marquee track `#certRibbonTrack`.
  - Populated `#certRibbonTrack` with a double-cloned 14-card sequence (Cards 1..7 + Clones 1..7) for mathematical zero-jump infinite marquee looping:
    1. **Artiverse 3.0 Hackathon 1st Place** (`assets/cerificates/IMG_20260701_185332433.jpg`) with badges: "1st Place", "Hackathon".
    2. **Advanced Cyber Security** (`assets/cerificates/IMG_20260701_185137413.jpg`) with badges: "Security", "Certified".
    3. **Tezario 3.0 Project Expo 2nd Place** (Synthetic medal card) with badges: "2nd Place", "Project Expo".
    4. **Infosys Springboard HTML5** (`assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf`) with badges: "Certified", "Web Dev".
    5. **Infosys Springboard CSS3** (`assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf`) with badges: "Certified", "Web Dev".
    6. **Infosys Springboard JavaScript** (`assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf`) with badges: "Certified", "JavaScript".
    7. **e-soft Full Stack Internship** (`assets/cerificates/internship/IMG_20260701_185232887.jpg`) with badges: "Internship", "Full Stack".
- **Location 2**: `#lightboxModal` (lines 791–824).
  - Upgraded `#lightboxModal` into a dual-mode viewer.
  - Added `<iframe>` element with `id="lightboxFrame"` alongside `#lightboxImage`.
  - Added `#lightboxCustomCard` for synthetic awards (Tezario 3.0 Project Expo).
  - Added `#lightboxActionBtn` with `target="_blank" rel="noopener noreferrer"` to open original files directly.
  - Added `#lightboxBadge` and `#lightboxType` indicators.

### `style.css`
- **Location 1**: Directly after `.achievement-card:nth-child(5)` (around line 1334).
  - Added `#certRibbonWrapper` / `.cert-ribbon-wrapper` with `overflow: hidden; width: 100%; contain: layout paint; position: relative;`.
  - Added `.cert-ribbon-viewport` with `perspective: 1200px; -webkit-perspective: 1200px;` and gradient alpha mask.
  - Added `#certRibbonTrack` / `.cert-ribbon-track` with 60fps hardware accelerated continuous horizontal translation `@keyframes ribbonScroll` (`0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); }`).
  - Added hover pause: `#certRibbonWrapper:hover #certRibbonTrack, .cert-ribbon-wrapper:hover .cert-ribbon-track, .cert-ribbon-track:hover { animation-play-state: paused; }`.
  - Added `.cert-card` with `flex: 0 0 320px; max-width: 85vw; perspective: 1000px; transform-style: preserve-3d;`, cyber glow box-shadow, frosted glass backdrop blur, and hover elevation.
  - Styled category badges: `.badge-gold`, `.badge-silver`, `.badge-cyan`, `.badge-purple`, `.badge-teal`, `.badge-orange`, `.badge-blue`, `.badge-yellow`, `.badge-indigo`.
  - Styled document icon previews for HTML5, CSS3, JS, and synthetic medal pulses.
- **Location 2**: LIGHTBOX MODAL section.
  - Styled `#lightboxFrame` with `width: 90vw; max-width: 960px; height: 78vh; border: none; border-radius: 16px; background: #fff;`.
  - Styled `.lightbox-header`, `.lightbox-controls`, `.lightbox-btn`, `.lightbox-badge`.
  - Styled `.lightbox-custom-card` with medal emblem, rank, summary, and award tags.

### `script.js`
- **Location 1**: `initPortfolio()` bootstrap.
  - Added `initCertificateRibbon();` call after `initLightbox();`.
- **Location 2**: Lightbox and Ribbon Logic.
  - Implemented `openLightbox(url, title, type = 'auto')`:
    - If `.pdf` or `type === 'pdf'`: reveals `#lightboxFrame` with `src=url`, hides `#lightboxImage` and `#lightboxCustomCard`, configures `#lightboxActionBtn`.
    - If image: reveals `#lightboxImage` with `src=url`, hides `#lightboxFrame` and `#lightboxCustomCard`.
    - If synthetic / empty: reveals `#lightboxCustomCard`, hides `#lightboxImage` and `#lightboxFrame`.
    - Synchronously sets `modal.classList.add('show')`, `modal.setAttribute('aria-hidden', 'false')`, `document.body.style.overflow = 'hidden'`.
  - Implemented `closeModal()`:
    - Sets `modal.classList.remove('show')`, `modal.setAttribute('aria-hidden', 'true')`, `document.body.style.overflow = ''`.
    - Synchronously clears `#lightboxImage.src` and `#lightboxFrame.src`.
    - Bound to `#lightboxClose`, backdrop click, and `Escape` keyboard event.
  - Implemented `initCertificateRibbon()`:
    - Subtle 3D Card Tilt on desktop: computes normalized pointer offsets and calculates dynamic `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`, smoothly resetting on `mouseleave`.
    - Touch & pointer swipe controls: listens for `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `touchstart`, `touchmove`, `touchend`, `touchcancel` to allow manual drag inspection on mobile and tablet touchscreens.
    - Card click & Enter/Space keyboard accessibility to open the lightbox.

---

## 2. Preserved Systems (Untouched)
- `tracker.js` (Firebase telemetry & presence tracking intact)
- `firebase-config.js` (`_VAULT_KEY` obfuscated config intact)
- `admin.html` (Admin CMS dashboard intact)
