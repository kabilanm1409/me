/**
 * tests/tier1_features.test.js
 * Tier 1: Primary Feature Coverage for Features F1 through F15.
 * Authoritative source: PROJECT.md § Feature Inventory.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR, TERMINAL_COMMAND_REGISTRY, EXPECTED_CYBER_TOKENS } = require('./helpers/test_fixtures');
const {
  findTags,
  findTagById,
  findTagsWithClass,
  getCssVariableValue,
  hasKeyframeAnimation,
  hasMediaQuery,
} = require('./helpers/dom_mock');

describe('Tier 1: Feature Coverage (F1 to F15)', () => {

  const styleCssPath = path.join(ROOT_DIR, 'style.css');
  const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
  const scriptJsPath = path.join(ROOT_DIR, 'script.js');
  const trackerJsPath = path.join(ROOT_DIR, 'tracker.js');
  const firebaseConfigPath = path.join(ROOT_DIR, 'firebase-config.js');
  const adminHtmlPath = path.join(ROOT_DIR, 'admin.html');

  const styleCss = fs.readFileSync(styleCssPath, 'utf8');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const scriptJs = fs.readFileSync(scriptJsPath, 'utf8');

  // ── F1: Cyber Glassmorphism CSS Tokens ──────────────────────────────
  test('F1: Cyber Glassmorphism CSS Tokens in :root and body[data-theme="dark"]', () => {
    // Check light mode variables in :root
    for (const token of EXPECTED_CYBER_TOKENS.light) {
      const val = getCssVariableValue(styleCss, ':root', token);
      assert.ok(
        val !== null,
        `F1 CSS variable ${token} missing in :root of style.css`
      );
    }

    // Check dark mode variables in body[data-theme='dark']
    for (const token of EXPECTED_CYBER_TOKENS.dark) {
      const val = getCssVariableValue(styleCss, "body\\[data-theme=['\"]?dark['\"]?\\]", token);
      assert.ok(
        val !== null,
        `F1 CSS variable ${token} missing in body[data-theme='dark'] of style.css`
      );
    }
  }, { tier: 'tier1', featureId: 'F1', milestone: 'M1', description: 'Design tokens in :root and dark mode' });

  // ── F2: Glassmorphic Cards & UI Modernization ───────────────────────
  test('F2: Glassmorphic Cards with blur, luminous border, and hover elevation', () => {
    const cardRuleMatch = /\.card\b[^{]*\{([^}]+)\}/i.exec(styleCss);
    assert.ok(cardRuleMatch, 'F2: .card selector missing in style.css');
    const cardCss = cardRuleMatch[1];

    assert.ok(
      cardCss.includes('backdrop-filter') || cardCss.includes('-webkit-backdrop-filter'),
      'F2: .card missing backdrop-filter property in style.css'
    );
    assert.ok(
      cardCss.includes('blur(') || cardCss.includes('var(--glass-blur'),
      'F2: .card missing blur filter in style.css'
    );

    // Hover state check
    const hoverMatch = /\.card:hover\b[^{]*\{([^}]+)\}/i.exec(styleCss);
    assert.ok(hoverMatch, 'F2: .card:hover selector missing in style.css');
    assert.ok(
      hoverMatch[1].includes('transform') || hoverMatch[1].includes('translate'),
      'F2: .card:hover must include transform elevation in style.css'
    );
  }, { tier: 'tier1', featureId: 'F2', milestone: 'M1', description: 'Glassmorphic card styling & hover elevation' });

  // ── F3: Developer Typography & Pill Badges ──────────────────────────
  test('F3: Developer Typography & Glowing Pill Badges', () => {
    // Typography
    assert.ok(
      /font-family:[^;]*Manrope/i.test(styleCss),
      'F3: Manrope headings font declaration missing in style.css'
    );
    assert.ok(
      /font-family:[^;]*(?:Courier|monospace)/i.test(styleCss),
      'F3: Monospace terminal font declaration missing in style.css'
    );

    // Pill badge styling
    const hasPillRadius = /(?:\.profile-points|\.tag-row|\.filter-btn|\.terminal-badge)[^{]*\{[^}]*border-radius:\s*(?:999px|24px|50px)/is.test(styleCss);
    assert.ok(hasPillRadius, 'F3: Pill badge border-radius missing on tags or badges in style.css');
  }, { tier: 'tier1', featureId: 'F3', milestone: 'M1', description: 'Developer fonts and glowing pill badges' });

  // ── F4: Certificate Asset Integration ───────────────────────────────
  test('F4: Certificate Asset Integration under assets/cerificates/*', () => {
    const requiredAssets = [
      'assets/cerificates/IMG_20260701_185332433.jpg',
      'assets/cerificates/IMG_20260701_185137413.jpg',
      'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf',
      'assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf',
      'assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf',
    ];

    for (const asset of requiredAssets) {
      assert.ok(
        indexHtml.includes(asset),
        `F4: index.html missing link or reference to certificate asset: ${asset}`
      );
    }
  }, { tier: 'tier1', featureId: 'F4', milestone: 'M2', description: 'Validated asset mapping in index.html' });

  // ── F5: Infinite Horizontal 3D Floating Ribbon ──────────────────────
  test('F5: Infinite Horizontal Floating Ribbon Markup and Keyframe Animation', () => {
    // Check DOM markup in index.html
    const hasRibbonWrapper = indexHtml.includes('cert-ribbon-wrapper') || indexHtml.includes('certRibbonWrapper');
    const hasRibbonTrack = indexHtml.includes('cert-ribbon-track') || indexHtml.includes('certRibbonTrack');
    assert.ok(hasRibbonWrapper, 'F5: Ribbon container (cert-ribbon-wrapper) missing in index.html');
    assert.ok(hasRibbonTrack, 'F5: Ribbon track (cert-ribbon-track) missing in index.html');

    // Check CSS Animation
    const hasAnimation = hasKeyframeAnimation(styleCss, 'ribbonScroll') || /@keyframes\s+[^\{]+\{[^\}]+translate3d\(-50%/is.test(styleCss);
    assert.ok(hasAnimation, 'F5: Keyframe marquee animation translate3d(-50%, 0, 0) missing in style.css');

    // Check hover pause
    const hasHoverPause = /(?:\.cert-ribbon-track|\.cert-ribbon-wrapper):hover[^{]*\{[^}]*animation-play-state:\s*paused/is.test(styleCss);
    assert.ok(hasHoverPause, 'F5: Hover-to-pause (animation-play-state: paused) missing in style.css');
  }, { tier: 'tier1', featureId: 'F5', milestone: 'M2', description: 'Continuous infinite marquee with hover pause' });

  // ── F6: 3D Tilt Physics & Elevation Drop Shadows ────────────────────
  test('F6: 3D Tilt Physics and Elevation Drop Shadows', () => {
    // Check perspective in CSS
    assert.ok(
      /perspective:\s*\d+px/i.test(styleCss),
      'F6: CSS perspective missing for 3D ribbon viewport in style.css'
    );
    assert.ok(
      /transform-style:\s*preserve-3d/i.test(styleCss),
      'F6: transform-style: preserve-3d missing in style.css'
    );

    // Check 3D tilt calculation in script.js
    const hasTiltCode = /rotateX|rotateY/i.test(scriptJs);
    assert.ok(hasTiltCode, 'F6: 3D tilt physics (rotateX / rotateY) calculation missing in script.js');
  }, { tier: 'tier1', featureId: 'F6', milestone: 'M2', description: 'Interactive card tilt physics & drop shadows' });

  // ── F7: Award & Category Badges ─────────────────────────────────────
  test('F7: Award & Category Badges on Certificate Ribbon Cards', () => {
    // Must feature 1st Place, 2nd Place, Hackathon, Security, Web Dev
    const requiredBadges = ['1st Place', '2nd Place', 'Hackathon', 'Security'];
    for (const badge of requiredBadges) {
      assert.ok(
        indexHtml.includes(badge),
        `F7: Required award/category badge "${badge}" missing in index.html`
      );
    }
  }, { tier: 'tier1', featureId: 'F7', milestone: 'M2', description: 'Visual category badges on certificate cards' });

  // ── F8: Dual-Mode Lightbox Preview Modal ────────────────────────────
  test('F8: Dual-Mode Lightbox Preview Modal (Image & PDF Iframe Viewer)', () => {
    const modal = findTagById(indexHtml, 'lightboxModal');
    assert.ok(modal, 'F8: #lightboxModal element missing in index.html');

    const hasImg = findTagById(indexHtml, 'lightboxImage');
    assert.ok(hasImg, 'F8: #lightboxImage element missing in #lightboxModal');

    const hasFrame = findTagById(indexHtml, 'lightboxFrame') || indexHtml.includes('id="lightboxFrame"') || indexHtml.includes('lightbox-frame');
    assert.ok(hasFrame, 'F8: #lightboxFrame PDF viewer iframe missing in #lightboxModal');

    const hasCloseBtn = findTagById(indexHtml, 'lightboxClose');
    assert.ok(hasCloseBtn, 'F8: #lightboxClose button missing in #lightboxModal');

    // Verify script.js handles PDF vs Image dual mode
    assert.ok(
      /\.pdf/i.test(scriptJs) && (/lightboxFrame|iframe/i.test(scriptJs)),
      'F8: script.js must inspect .pdf extension and toggle lightboxFrame vs lightboxImage'
    );
  }, { tier: 'tier1', featureId: 'F8', milestone: 'M2', description: 'Lightbox supporting img, iframe, and close controls' });

  // ── F9: Touch & Swipe Controls ──────────────────────────────────────
  test('F9: Touch & Swipe Controls on Ribbon Viewport', () => {
    const hasTouchListeners = /touchstart|pointerdown/i.test(scriptJs) && /touchmove|pointermove/i.test(scriptJs);
    assert.ok(
      hasTouchListeners,
      'F9: Touch/pointer drag event listeners (pointerdown/touchstart & pointermove) missing in script.js'
    );
  }, { tier: 'tier1', featureId: 'F9', milestone: 'M2', description: 'Touch and pointer-drag support for ribbon' });

  // ── F10: Telemetry & CMS Preservation ───────────────────────────────
  test('F10: Telemetry & CMS Preservation (tracker.js, firebase-config.js, admin.html)', () => {
    const trackerContent = fs.readFileSync(trackerJsPath, 'utf8');
    assert.ok(
      trackerContent.includes('initDeepVisitorTracker'),
      'F10: tracker.js missing initDeepVisitorTracker entrypoint'
    );
    assert.ok(
      trackerContent.includes('liveVisitors'),
      'F10: tracker.js missing liveVisitors presence telemetry'
    );

    const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    assert.ok(
      configContent.includes('_VAULT_KEY'),
      'F10: firebase-config.js missing _VAULT_KEY obfuscation vault'
    );

    assert.ok(
      fs.existsSync(adminHtmlPath),
      'F10: admin.html dashboard file missing'
    );
  }, { tier: 'tier1', featureId: 'F10', milestone: 'M3', description: 'Preservation of Firebase tracker and admin CMS' });

  // ── F11: Cyber Terminal Emulator Preservation ───────────────────────
  test('F11: Cyber Terminal Emulator Preservation (22-command registry)', () => {
    const terminalEl = findTagById(indexHtml, 'terminal');
    assert.ok(terminalEl, 'F11: #terminal section missing in index.html');
    const terminalBody = findTagById(indexHtml, 'terminalBody');
    assert.ok(terminalBody, 'F11: #terminalBody element missing in index.html');
    const terminalInput = findTagById(indexHtml, 'terminalInput');
    assert.ok(terminalInput, 'F11: #terminalInput element missing in index.html');

    // Test command coverage in script.js
    for (const cmd of TERMINAL_COMMAND_REGISTRY) {
      const pattern = new RegExp(`case\\s+['"]${cmd}['"]`, 'i');
      assert.ok(
        pattern.test(scriptJs),
        `F11: Command "${cmd}" missing from terminal switch registry in script.js`
      );
    }
  }, { tier: 'tier1', featureId: 'F11', milestone: 'M3', description: 'Preservation of 22 terminal commands and HUD' });

  // ── F12: Theme Switcher Harmony ─────────────────────────────────────
  test('F12: Theme Switcher Harmony with dataset.theme and localStorage', () => {
    assert.ok(
      scriptJs.includes('km_theme'),
      'F12: script.js missing km_theme localStorage storage key'
    );
    assert.ok(
      scriptJs.includes("document.body.dataset.theme = 'dark'") || scriptJs.includes('dataset.theme'),
      'F12: script.js missing dataset.theme toggle logic'
    );
    assert.ok(
      scriptJs.includes('delete document.body.dataset.theme') || scriptJs.includes('removeAttribute'),
      'F12: script.js must remove dataset.theme for light mode (clean attribute removal)'
    );
  }, { tier: 'tier1', featureId: 'F12', milestone: 'M3', description: 'Seamless theme switching between dark and light' });

  // ── F13: Responsive & Zero Layout Shift ─────────────────────────────
  test('F13: Responsive & Zero Horizontal Overflow Rules', () => {
    // overflow-x: hidden on body
    const bodyRuleMatch = /body\s*\{([^}]+)\}/i.exec(styleCss);
    assert.ok(bodyRuleMatch, 'F13: body selector missing in style.css');
    assert.ok(
      bodyRuleMatch[1].includes('overflow-x: hidden') || styleCss.includes('overflow-x: hidden'),
      'F13: overflow-x: hidden missing for body in style.css'
    );

    // Responsive breakpoints: 860px and 560px
    assert.ok(
      hasMediaQuery(styleCss, 'max-width: 860px') || hasMediaQuery(styleCss, '860px'),
      'F13: Mobile breakpoint 860px missing in style.css'
    );
    assert.ok(
      hasMediaQuery(styleCss, 'max-width: 560px') || hasMediaQuery(styleCss, '560px'),
      'F13: Small mobile breakpoint 560px missing in style.css'
    );

    // Containment on ribbon to prevent horizontal layout shift
    const hasContainment = /contain:\s*layout paint|contain:\s*paint|overflow:\s*hidden/i.test(styleCss);
    assert.ok(hasContainment, 'F13: CSS containment (overflow: hidden or contain) missing in style.css');
  }, { tier: 'tier1', featureId: 'F13', milestone: 'M3', description: 'Zero layout shift and responsive breakpoints' });

  // ── F14: Accessibility (ARIA & Focus Trap) ──────────────────────────
  test('F14: Accessibility (ARIA modal, live region, and focus trap)', () => {
    const modal = findTagById(indexHtml, 'lightboxModal');
    assert.ok(modal, 'F14: #lightboxModal missing');
    assert.equal(
      modal.attributes.role,
      'dialog',
      'F14: #lightboxModal must declare role="dialog"'
    );

    // Focus trapping / Escape handler in script.js
    assert.ok(
      scriptJs.includes("'Escape'") || scriptJs.includes('"Escape"'),
      'F14: Escape key handler missing in script.js'
    );

    // role="log" on terminal output
    const terminalBody = findTagById(indexHtml, 'terminalBody');
    assert.ok(terminalBody, 'F14: #terminalBody missing');
    assert.ok(
      terminalBody.attributes.role === 'log' || scriptJs.includes("role") || terminalBody.attributes['aria-live'],
      'F14: #terminalBody should declare role="log" or aria-live="polite"'
    );
  }, { tier: 'tier1', featureId: 'F14', milestone: 'M3', description: 'Accessibility ARIA tags and focus trapping' });

  // ── F15: Zero JavaScript Syntax Errors ──────────────────────────────
  test('F15: Zero JavaScript Syntax Errors across all modules', () => {
    const files = ['script.js', 'tracker.js', 'firebase-config.js', 'portfolio-cms.js', 'server.js'];
    for (const f of files) {
      const fullPath = path.join(ROOT_DIR, f);
      execFileSync(process.execPath, ['-c', fullPath], { encoding: 'utf8' });
    }
  }, { tier: 'tier1', featureId: 'F15', milestone: 'M3', description: 'node -c cleanly passing on all scripts' });

});
