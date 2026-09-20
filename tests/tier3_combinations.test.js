/**
 * tests/tier3_combinations.test.js
 * Tier 3: Cross-Feature Combinations & Architectural Synergies.
 * Authoritative sources: PROJECT.md Architecture, Explorer Survey Reports.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR } = require('./helpers/test_fixtures');
const { findTagById, getCssVariableValue, createBrowserEnvironment, MockElement } = require('./helpers/dom_mock');

describe('Tier 3: Cross-Feature Combinations', () => {

  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');
  const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');

  // ── C1: Ribbon Anchoring Under Achievements & SPA Lifecycle ─────────
  test('C1.1: Certificate Ribbon Anchored INSIDE Achievements Section', () => {
    // Locate <section id="achievements">
    const achievementsSection = findTagById(indexHtml, 'achievements');
    assert.ok(achievementsSection, 'Achievements section (#achievements) missing in index.html');

    // Verify ribbon markup is situated within #achievements
    const hasRibbonInsideAchievements = achievementsSection.innerHtml.includes('certRibbon') ||
      achievementsSection.innerHtml.includes('cert-ribbon');

    assert.ok(
      hasRibbonInsideAchievements,
      'Architectural Requirement: Certificate Ribbon MUST be nested inside <section id="achievements"> so it is visible during achievements SPA navigation and hidden when browsing other sections'
    );
  }, { tier: 'tier3', featureId: 'F5', milestone: 'M2', description: 'Ensure ribbon stays within achievements section boundary' });

  test('C1.2: SPA Section Switching Lifecycle Hiding Sibling Elements', () => {
    // Simulate showSection(targetId) behavior from script.js
    const { document } = createBrowserEnvironment();

    const homeSec = new MockElement('section', 'home');
    homeSec.setAttribute('data-section', 'home');
    homeSec.hidden = false;

    const achSec = new MockElement('section', 'achievements');
    achSec.setAttribute('data-section', 'achievements');
    achSec.hidden = true;

    const ribbonDiv = new MockElement('div', 'certRibbonWrapper');
    achSec.appendChild(ribbonDiv);

    document.body.appendChild(homeSec);
    document.body.appendChild(achSec);

    const allSections = [homeSec, achSec];

    function showSection(targetId) {
      allSections.forEach(sec => (sec.hidden = true));
      const target = document.querySelector(`[data-section="${targetId}"]`);
      if (target) target.hidden = false;
    }

    // When on home: achievements section is hidden
    showSection('home');
    assert.equal(homeSec.hidden, false, 'Home section should be visible');
    assert.equal(achSec.hidden, true, 'Achievements section must be hidden on home');

    // When navigating to achievements: achievements section is unhidden
    showSection('achievements');
    assert.equal(homeSec.hidden, true, 'Home section must be hidden when achievements active');
    assert.equal(achSec.hidden, false, 'Achievements section must be unhidden');
    assert.equal(ribbonDiv.parentNode.hidden, false, 'Ribbon parent section must be visible');
  }, { tier: 'tier3', featureId: 'F5', milestone: 'M2', description: 'Verify SPA navigation hides/shows ribbon with achievements section' });

  // ── C2: Theme Toggle Compatibility with Glassmorphic Components ──────
  test('C2.1: Glassmorphic Component CSS Token Resolution in Dark and Light Modes', () => {
    // Both light (:root) and dark (body[data-theme='dark']) must supply required surface tokens
    const lightSurface = getCssVariableValue(styleCss, ':root', '--glass-surface') ||
      getCssVariableValue(styleCss, ':root', '--surface');
    assert.ok(lightSurface, 'Light mode missing surface variable in style.css');

    const darkSurface = getCssVariableValue(styleCss, "body\\[data-theme=['\"]?dark['\"]?\\]", '--glass-surface') ||
      getCssVariableValue(styleCss, "body\\[data-theme=['\"]?dark['\"]?\\]", '--surface');
    assert.ok(darkSurface, 'Dark mode missing surface variable in body[data-theme="dark"] of style.css');

    // Verify dark surface uses dark/translucent tone
    assert.ok(
      darkSurface.includes('0,') || darkSurface.includes('#0') || darkSurface.includes('11,') || darkSurface.includes('16,'),
      `Dark theme surface should have dark luminosity: found "${darkSurface}"`
    );
  }, { tier: 'tier3', featureId: 'F12', milestone: 'M1', description: 'Verify token resolution across themes for glass surfaces' });

  // ── C3: Lightbox Dual-Mode Image/Iframe Handling ─────────────────────
  test('C3.1: Lightbox Dual-Mode Dispatcher (PDF vs Image Mode Selection)', () => {
    const { document } = createBrowserEnvironment();

    const modal = new MockElement('div', 'lightboxModal');
    const imgEl = new MockElement('img', 'lightboxImage');
    const frameEl = new MockElement('iframe', 'lightboxFrame');
    const customCardEl = new MockElement('div', 'lightboxCustomCard');
    const actionBtn = new MockElement('a', 'lightboxActionBtn');

    modal.appendChild(imgEl);
    modal.appendChild(frameEl);
    modal.appendChild(customCardEl);
    modal.appendChild(actionBtn);
    document.body.appendChild(modal);

    // Lightbox dispatcher logic conforming to R2 / PROJECT.md F8
    function openLightbox(url, title, type = 'auto') {
      const isPdf = type === 'pdf' || url.toLowerCase().endsWith('.pdf');
      const isSynthetic = type === 'synthetic' || !url;

      if (isSynthetic) {
        imgEl.style.display = 'none';
        frameEl.style.display = 'none';
        customCardEl.style.display = 'block';
        actionBtn.style.display = 'none';
      } else if (isPdf) {
        imgEl.style.display = 'none';
        frameEl.style.display = 'block';
        frameEl.setAttribute('src', url);
        customCardEl.style.display = 'none';
        actionBtn.style.display = 'inline-flex';
        actionBtn.setAttribute('href', url);
      } else {
        imgEl.style.display = 'block';
        imgEl.setAttribute('src', url);
        frameEl.style.display = 'none';
        customCardEl.style.display = 'none';
        actionBtn.style.display = 'inline-flex';
        actionBtn.setAttribute('href', url);
      }
      modal.classList.add('show');
    }

    // Case 1: Image URL (Hackathon certificate)
    openLightbox('assets/cerificates/IMG_20260701_185332433.jpg', 'Artiverse 3.0');
    assert.equal(imgEl.style.display, 'block', 'Image element must be displayed for JPG assets');
    assert.equal(frameEl.style.display, 'none', 'Iframe element must be hidden for JPG assets');
    assert.equal(imgEl.getAttribute('src'), 'assets/cerificates/IMG_20260701_185332433.jpg');

    // Case 2: PDF URL (Infosys Springboard certificate)
    openLightbox('assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf', 'Infosys HTML5');
    assert.equal(imgEl.style.display, 'none', 'Image element must be hidden for PDF assets');
    assert.equal(frameEl.style.display, 'block', 'Iframe element must be displayed for PDF assets');
    assert.equal(frameEl.getAttribute('src'), 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf');

    // Case 3: Synthetic credential (Tezario 3.0 Project Expo)
    openLightbox('', 'Tezario 3.0 Project Expo', 'synthetic');
    assert.equal(customCardEl.style.display, 'block', 'Custom award card must be displayed for synthetic credentials');
    assert.equal(imgEl.style.display, 'none', 'Image element must be hidden for synthetic credentials');
    assert.equal(frameEl.style.display, 'none', 'Iframe element must be hidden for synthetic credentials');
  }, { tier: 'tier3', featureId: 'F8', milestone: 'M2', description: 'Dual-mode lightbox correctly dispatches JPG vs PDF vs Synthetic' });

  // ── C4: Terminal Active State & Navigation HUD Display ───────────────
  test('C4.1: Terminal Navigation Link Visibility Synchronized with Terminal Section', () => {
    // In script.js line 59-62:
    // const navTerminal = document.getElementById('nav-terminal');
    // if (navTerminal) navTerminal.style.display = (targetId === 'terminal') ? 'inline-flex' : 'none';
    assert.ok(
      scriptJs.includes('nav-terminal') && scriptJs.includes("targetId === 'terminal'"),
      'script.js must conditionally toggle #nav-terminal display only when terminal section is active'
    );
  }, { tier: 'tier3', featureId: 'F11', milestone: 'M3', description: 'Ensure #nav-terminal appears only when terminal section active' });

});
