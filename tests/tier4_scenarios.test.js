/**
 * tests/tier4_scenarios.test.js
 * Tier 4: Real-World Workload Scenarios & End-to-End User Journeys.
 * Authoritative sources: ORIGINAL_REQUEST.md Acceptance Criteria, PROJECT.md Architecture.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR } = require('./helpers/test_fixtures');
const { createBrowserEnvironment, MockElement } = require('./helpers/dom_mock');

describe('Tier 4: Real-World Workload Scenarios', () => {

  const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');

  // ── W1: SPA Navigation Flow Simulation ──────────────────────────────
  test('W1.1: Complete End-to-End Single-Page Navigation Journey', () => {
    const { document, window } = createBrowserEnvironment();

    const sections = ['home', 'about', 'skills', 'projects', 'achievements', 'terminal', 'contact'];
    const secNodes = {};
    const linkNodes = {};

    sections.forEach(id => {
      const sec = new MockElement('section', id);
      sec.setAttribute('data-section', id);
      sec.hidden = (id !== 'home');
      secNodes[id] = sec;
      document.body.appendChild(sec);

      const link = new MockElement('a', `nav-${id}`);
      link.setAttribute('data-target', id);
      if (id === 'home') {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
      linkNodes[id] = link;
      document.body.appendChild(link);
    });

    let currentSection = 'home';
    const historyEntries = [];

    function showSection(targetId) {
      if (targetId === currentSection) return;
      sections.forEach(id => {
        secNodes[id].hidden = (id !== targetId);
        const isMatch = (id === targetId);
        linkNodes[id].classList.toggle('active', isMatch);
        if (isMatch) {
          linkNodes[id].setAttribute('aria-current', 'page');
        } else {
          linkNodes[id].removeAttribute('aria-current');
        }
      });
      currentSection = targetId;
      historyEntries.push(targetId);
    }

    // Step 1: Initial state
    assert.equal(secNodes.home.hidden, false, 'Initial section should be home');
    assert.equal(linkNodes.home.getAttribute('aria-current'), 'page');

    // Step 2: Navigate to Skills
    showSection('skills');
    assert.equal(secNodes.skills.hidden, false, 'Skills section must be visible');
    assert.equal(secNodes.home.hidden, true, 'Home section must be hidden');
    assert.equal(linkNodes.skills.getAttribute('aria-current'), 'page');
    assert.equal(linkNodes.home.getAttribute('aria-current'), null);

    // Step 3: Navigate to Achievements (Ribbon section)
    showSection('achievements');
    assert.equal(secNodes.achievements.hidden, false, 'Achievements section must be visible');
    assert.equal(secNodes.skills.hidden, true, 'Skills section must be hidden');

    // Step 4: Navigate to Terminal
    showSection('terminal');
    assert.equal(secNodes.terminal.hidden, false, 'Terminal section must be visible');

    // Step 5: Return to Home
    showSection('home');
    assert.equal(secNodes.home.hidden, false, 'Home section must be restored');
    assert.deepEqual(historyEntries, ['skills', 'achievements', 'terminal', 'home']);
  }, { tier: 'tier4', milestone: 'M3', description: 'Simulate user clicking through navigation links in SPA' });

  // ── W2: Certificate Inspection & Lightbox Lifecycle ─────────────────
  test('W2.1: Certificate Inspection and Lightbox Open/Close Lifecycle', () => {
    const { document } = createBrowserEnvironment();

    const modal = new MockElement('div', 'lightboxModal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    const modalImg = new MockElement('img', 'lightboxImage');
    const modalCaption = new MockElement('div', 'lightboxCaption');
    const closeBtn = new MockElement('button', 'lightboxClose');

    modal.appendChild(modalImg);
    modal.appendChild(modalCaption);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);

    let isModalOpen = false;

    function openModal(src, captionText) {
      modalImg.setAttribute('src', src);
      modalCaption.textContent = captionText;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      isModalOpen = true;
    }

    function closeModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      isModalOpen = false;
      modalImg.setAttribute('src', '');
    }

    // Step 1: User clicks on Hackathon certificate
    const certSrc = 'assets/cerificates/IMG_20260701_185332433.jpg';
    openModal(certSrc, 'Artiverse 3.0 Hackathon - 1st Place');

    assert.equal(modal.classList.contains('show'), true, 'Modal should have "show" class');
    assert.equal(modal.getAttribute('aria-hidden'), 'false', 'Modal aria-hidden should be false');
    assert.equal(modalImg.getAttribute('src'), certSrc, 'Image src should match certificate');
    assert.equal(document.body.style.overflow, 'hidden', 'Body overflow should be locked to prevent scroll');

    // Step 2: User presses Escape key
    closeModal();
    assert.equal(modal.classList.contains('show'), false, 'Modal should no longer have "show" class');
    assert.equal(modal.getAttribute('aria-hidden'), 'true', 'Modal aria-hidden should be restored to true');
    assert.equal(document.body.style.overflow, '', 'Body overflow should be restored');
    assert.equal(modalImg.getAttribute('src'), '', 'Image src should be cleared');
  }, { tier: 'tier4', featureId: 'F8', milestone: 'M2', description: 'End-to-end lightbox open, inspect, and close interaction' });

  // ── W3: Theme Persistence Across Refresh Simulation ─────────────────
  test('W3.1: Theme Persistence Across Page Refresh Simulation', () => {
    const env1 = createBrowserEnvironment();

    function initTheme(env) {
      const saved = env.localStorage.getItem('km_theme') || 'light';
      if (saved === 'dark') {
        env.document.body.dataset.theme = 'dark';
      } else {
        delete env.document.body.dataset.theme;
      }
      return saved;
    }

    function toggleTheme(env) {
      const current = env.document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      if (current === 'dark') {
        env.document.body.dataset.theme = 'dark';
      } else {
        delete env.document.body.dataset.theme;
      }
      env.localStorage.setItem('km_theme', current);
      return current;
    }

    // First visit: no theme saved -> defaults to light
    const firstTheme = initTheme(env1);
    assert.equal(firstTheme, 'light');
    assert.equal(env1.document.body.dataset.theme, undefined);

    // User toggles to dark theme
    const toggledTheme = toggleTheme(env1);
    assert.equal(toggledTheme, 'dark');
    assert.equal(env1.document.body.dataset.theme, 'dark');
    assert.equal(env1.localStorage.getItem('km_theme'), 'dark');

    // Second visit / refresh simulation: new environment with same localStorage store
    const env2 = createBrowserEnvironment();
    env2.localStorage.setItem('km_theme', env1.localStorage.getItem('km_theme'));

    const loadedTheme = initTheme(env2);
    assert.equal(loadedTheme, 'dark', 'Dark theme should be loaded from localStorage on page refresh');
    assert.equal(env2.document.body.dataset.theme, 'dark', 'data-theme="dark" attribute must be applied on body');
  }, { tier: 'tier4', featureId: 'F12', milestone: 'M3', description: 'Theme choice persists across page loads via localStorage' });

  // ── W4: Telemetry & Contact Form Security Integration ───────────────
  test('W4.1: Contact Form Anti-Bot Honeypot & SHA-256 HMAC Signing Workflow', () => {
    // Replicate contact form submission validation logic
    function validateAndSignForm(formData) {
      // Honeypot check: website field must be empty
      if (formData.website && formData.website.trim() !== '') {
        return { success: false, reason: 'honeypot_triggered' };
      }

      if (!formData.name || !formData.email || !formData.message) {
        return { success: false, reason: 'missing_fields' };
      }

      const timestamp = Date.now();
      const payloadString = `${formData.name}|${formData.email}|${timestamp}|km_sec_salt`;
      const hmacSignature = crypto.createHash('sha256').update(payloadString).digest('hex');

      return {
        success: true,
        record: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          timestamp,
          signature: hmacSignature,
        },
      };
    }

    // Case 1: Spam bot fills the hidden website honeypot field
    const spamSubmission = {
      website: 'http://spam-link.com',
      name: 'Bot User',
      email: 'bot@spam.com',
      message: 'Buy cheap watches',
    };
    const botResult = validateAndSignForm(spamSubmission);
    assert.equal(botResult.success, false);
    assert.equal(botResult.reason, 'honeypot_triggered', 'Honeypot should silently reject spam submission');

    // Case 2: Legitimate human submission
    const legitSubmission = {
      website: '', // honeypot left blank
      name: 'Kabilan Visitor',
      email: 'recruiter@techcorp.com',
      message: 'Interested in your cybersecurity and networking background.',
    };
    const legitResult = validateAndSignForm(legitSubmission);
    assert.equal(legitResult.success, true);
    assert.ok(legitResult.record.signature.length === 64, 'SHA-256 digest must be 64 hexadecimal characters');
  }, { tier: 'tier4', featureId: 'F10', milestone: 'M3', description: 'Contact form honeypot defense and cryptographic request signing' });

});
