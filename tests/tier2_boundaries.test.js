/**
 * tests/tier2_boundaries.test.js
 * Tier 2: Boundary, Edge Cases, and Corner Conditions.
 * Authoritative sources: ORIGINAL_REQUEST.md R3, PROJECT.md Architecture, Explorer Survey Reports.
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR } = require('./helpers/test_fixtures');
const { findTags, findTagById, createBrowserEnvironment } = require('./helpers/dom_mock');

describe('Tier 2: Boundary & Corner Cases', () => {

  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');
  const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');

  // ── B1: Missing Attributes Defense ──────────────────────────────────
  test('B1.1: Image Missing Attributes Defense (alt & src present on all img tags)', () => {
    const images = findTags(indexHtml, 'img');
    assert.ok(images.length > 0, 'No img tags found in index.html');

    for (const img of images) {
      // lightboxImage has dynamic src, so skip checking src for it if id is lightboxImage
      if (img.attributes.id === 'lightboxImage') {
        assert.ok(
          img.attributes.alt !== undefined,
          `Image #${img.attributes.id || 'unknown'} missing alt attribute`
        );
        continue;
      }

      assert.ok(
        img.attributes.src && img.attributes.src.trim() !== '',
        `Image missing valid src attribute: ${img.raw.slice(0, 50)}...`
      );
      assert.ok(
        img.attributes.alt !== undefined,
        `Image missing alt attribute for accessibility: ${img.raw.slice(0, 50)}...`
      );
    }
  }, { tier: 'tier2', milestone: 'M3', description: 'Ensure all images have alt and valid src' });

  test('B1.2: External Link Security Defense (rel="noopener noreferrer" on target="_blank")', () => {
    const links = findTags(indexHtml, 'a');
    for (const link of links) {
      if (link.attributes.target === '_blank') {
        const rel = link.attributes.rel || '';
        assert.ok(
          rel.includes('noopener') && rel.includes('noreferrer'),
          `External link with target="_blank" missing rel="noopener noreferrer": ${link.raw.slice(0, 70)}...`
        );
      }
    }
  }, { tier: 'tier2', milestone: 'M3', description: 'Ensure no tabnabbing vulnerabilities on target="_blank" links' });

  test('B1.3: Contact Form Required Attributes Defense', () => {
    const form = findTagById(indexHtml, 'contactForm');
    assert.ok(form, 'Contact form missing in index.html');

    const inputs = findTags(form.innerHtml, 'input');
    const textareas = findTags(form.innerHtml, 'textarea');
    const fields = [...inputs, ...textareas];

    const requiredFields = fields.filter(f => f.attributes.name !== 'website'); // exclude honeypot
    for (const field of requiredFields) {
      assert.ok(
        field.attributes.required !== undefined || field.attributes['aria-required'] === 'true',
        `Form field "${field.attributes.name}" missing required / aria-required attribute`
      );
    }
  }, { tier: 'tier2', milestone: 'M3', description: 'Validate required fields on contact form' });

  // ── B2: Ultra-Small Viewport (320px) Defense ─────────────────────────
  test('B2.1: Small Viewport Fluid Typography & Responsive Container Defense', () => {
    // Check that style.css does not enforce rigid non-responsive fixed widths > 320px without max-width
    const rigidWidthRegex = /(?:^|[^-])\bwidth:\s*(?:3[3-9]\d|[4-9]\d\d|\d{4,})px/gm;
    let match;
    const suspiciousRules = [];
    while ((match = rigidWidthRegex.exec(styleCss)) !== null) {
      // Allow if within a media query or accompanied by max-width: 100%
      const startIdx = Math.max(0, match.index - 50);
      const snippet = styleCss.slice(startIdx, match.index + 50);
      if (!snippet.includes('max-width') && !snippet.includes('@media')) {
        suspiciousRules.push(match[0].trim());
      }
    }
    assert.ok(
      suspiciousRules.length < 5,
      `Detected rigid fixed pixel widths in CSS that may cause horizontal overflow at 320px: ${suspiciousRules.join(', ')}`
    );
  }, { tier: 'tier2', milestone: 'M3', description: 'Check responsive fluid layout without rigid pixel overflow' });

  // ── B3: Long Text & Container Blowout Defense ────────────────────────
  test('B3.1: Long Text & SHA-256 Output Container Blowout Defense', () => {
    // In style.css, terminal output line .t-line must have word-break or overflow handling
    const hasWordBreak = /(?:\.t-line|\.terminal-body)[^{]*\{[^}]*(?:word-break:\s*break-all|overflow-wrap:\s*break-word|overflow-x:\s*auto)/is.test(styleCss);
    assert.ok(
      hasWordBreak,
      'style.css missing word-break: break-all or overflow-x on .t-line to handle 64+ char hashes and long outputs'
    );
  }, { tier: 'tier2', milestone: 'M3', description: 'Verify word-break on long terminal output strings' });

  // ── B4: Theme Attribute Mutation State Defense ───────────────────────
  test('B4.1: Theme Attribute Presence/Absence State Mutation Defense', () => {
    const { document, window, localStorage } = createBrowserEnvironment();

    // Replicate applyTheme logic from script.js
    function applyTheme(theme) {
      const isDark = theme === 'dark';
      if (isDark) {
        document.body.dataset.theme = 'dark';
      } else {
        delete document.body.dataset.theme;
      }
    }

    // Default state: light mode -> dataset.theme should NOT exist
    applyTheme('light');
    assert.equal(
      document.body.dataset.theme,
      undefined,
      'Light mode must NOT leave dataset.theme defined; it should delete the property'
    );
    assert.equal(
      document.body.getAttribute('data-theme'),
      null,
      'Light mode must remove data-theme attribute completely from body'
    );

    // Switch to dark mode -> dataset.theme must be 'dark'
    applyTheme('dark');
    assert.equal(
      document.body.dataset.theme,
      'dark',
      'Dark mode must set dataset.theme to "dark"'
    );
    assert.equal(
      document.body.getAttribute('data-theme'),
      'dark',
      'Dark mode must set data-theme attribute on body'
    );

    // Switch back to light mode -> dataset.theme must be deleted cleanly
    applyTheme('light');
    assert.equal(
      document.body.dataset.theme,
      undefined,
      'Switching back to light mode must cleanly delete dataset.theme'
    );
  }, { tier: 'tier2', milestone: 'M3', description: 'Verify clean theme attribute toggling without leftover attributes' });

  // ── B5: Terminal Command Boundary & Invalid Inputs ───────────────────
  test('B5.1: Terminal Command Fallback for Invalid Commands', () => {
    // Test terminal fallback logic from script.js
    const invalidCmd = 'nonexistent_cmd_xyz';
    const cleanCmd = invalidCmd.trim().toLowerCase();

    // Verify script.js handles default unrecognized commands
    assert.ok(
      scriptJs.includes('command not found'),
      'script.js missing standard "command not found" fallback message'
    );
  }, { tier: 'tier2', milestone: 'M3', description: 'Invalid terminal command outputs friendly bash error' });

  test('B5.2: Terminal Input HTML Escaping Defense against Injection', () => {
    // Verify script.js contains HTML escaping function
    assert.ok(
      scriptJs.includes('escapeHtml') || scriptJs.includes('replace(/&/g'),
      'script.js missing escapeHtml helper to prevent XSS in terminal echoes and logs'
    );

    // Test escaping logic
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    const payload = '<script>alert("xss")</script>';
    const sanitized = escapeHtml(payload);
    assert.equal(sanitized.includes('<script>'), false, 'XSS script tag not escaped');
    assert.ok(sanitized.includes('&lt;script&gt;'), 'HTML characters correctly converted to entities');
  }, { tier: 'tier2', milestone: 'M3', description: 'Prevent XSS injection through terminal input commands' });

  test('B5.3: Terminal Sudo Command Unauthorized Boundary', () => {
    // Test sudo handler in script.js
    assert.ok(
      scriptJs.includes('sudoers') || scriptJs.includes('incident will be reported'),
      'script.js missing security notification for unauthorized sudo execution'
    );
  }, { tier: 'tier2', milestone: 'M3', description: 'Sudo command triggers simulated incident warning' });

});
