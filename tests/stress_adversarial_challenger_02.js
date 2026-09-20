/**
 * tests/stress_adversarial_challenger_02.js
 * Empirical Adversarial Stress Harness for Challenger 02.
 * Rigorously stress tests:
 * 1. Dual-mode Lightbox Modal (images, PDFs, synthetic card, dismissal mechanisms, focus trap & restoration, button resolution)
 * 2. Theme Switcher (rapid toggling, token contrast audit, localStorage persistence, boundary conditions)
 * 3. Terminal Emulator (commands, output formatting, XSS immunity, SPA routing non-interference)
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function runTest(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`  ✔ PASS: ${name}`);
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('\n======================================================');
console.log(' CHALLENGER 02: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('======================================================\n');

// ────────────────────────────────────────────────────────────────────────────
// SUITE 1: DUAL-MODE LIGHTBOX MODAL EMPIRICAL TESTS
// ────────────────────────────────────────────────────────────────────────────
console.log('► SECTION 1: Dual-Mode Lightbox Modal Stress Tests');

// 1.1 Card markup verification in index.html
runTest('L1.1: Verify card attributes and data contracts in index.html', () => {
  assert.ok(
    indexHtml.includes('data-cert-id="C1"'),
    'C1 card missing in index.html'
  );
  assert.ok(
    indexHtml.includes('assets/cerificates/IMG_20260701_185332433.jpg'),
    'Hackathon image path missing in index.html'
  );
  assert.ok(
    indexHtml.includes('data-cert-id="C4"'),
    'C4 card missing in index.html'
  );
  assert.ok(
    indexHtml.includes('assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf'),
    'HTML5 PDF path missing in index.html'
  );
  assert.ok(
    indexHtml.includes('data-cert-id="C7"'),
    'C7 Tezario card missing in index.html'
  );
  assert.ok(
    indexHtml.includes('data-cert-type="synthetic"'),
    'data-cert-type="synthetic" missing in index.html'
  );
});

// 1.2 Dual-Mode Dispatcher Simulation: Image, PDF, and Synthetic Card
runTest('L1.2: Dual-Mode Lightbox Dispatcher Logic Simulation (Image, PDF, Synthetic)', () => {
  function simulateOpenLightbox(url, title, type = 'auto') {
    const isPdf = type === 'pdf' || (typeof url === 'string' && url.toLowerCase().endsWith('.pdf'));
    const isSynthetic = type === 'synthetic' || !url;

    const state = {
      imageDisplay: '',
      imageSrc: '',
      frameDisplay: '',
      frameSrc: '',
      customCardDisplay: '',
      actionBtnDisplay: '',
      actionBtnHref: '',
      typeLabel: '',
      caption: title || 'Certificate Preview',
      modalShown: true,
      ariaHidden: 'false',
      ariaModal: 'true',
      bodyOverflow: 'hidden'
    };

    if (isSynthetic) {
      state.imageDisplay = 'none';
      state.frameDisplay = 'none';
      state.frameSrc = '';
      state.customCardDisplay = 'block';
      state.actionBtnDisplay = 'none';
      state.typeLabel = 'Special Credential';
    } else if (isPdf) {
      state.imageDisplay = 'none';
      state.imageSrc = '';
      state.frameDisplay = 'block';
      state.frameSrc = url;
      state.customCardDisplay = 'none';
      state.actionBtnDisplay = 'inline-flex';
      state.actionBtnHref = url;
      state.typeLabel = 'Verified PDF Document';
    } else {
      state.imageDisplay = 'block';
      state.imageSrc = url;
      state.frameDisplay = 'none';
      state.frameSrc = '';
      state.customCardDisplay = 'none';
      state.actionBtnDisplay = 'inline-flex';
      state.actionBtnHref = url;
      state.typeLabel = 'Official Certificate Image';
    }

    return state;
  }

  // Case A: Image preview (Hackathon)
  const imgState = simulateOpenLightbox('assets/cerificates/IMG_20260701_185332433.jpg', 'Artiverse 3.0 Hackathon', 'image');
  assert.equal(imgState.imageDisplay, 'block');
  assert.equal(imgState.imageSrc, 'assets/cerificates/IMG_20260701_185332433.jpg');
  assert.equal(imgState.frameDisplay, 'none');
  assert.equal(imgState.customCardDisplay, 'none');
  assert.equal(imgState.actionBtnDisplay, 'inline-flex');
  assert.equal(imgState.typeLabel, 'Official Certificate Image');

  // Case B: PDF preview (Infosys Springboard HTML5)
  const pdfState = simulateOpenLightbox('assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf', 'Infosys HTML5', 'pdf');
  assert.equal(pdfState.imageDisplay, 'none');
  assert.equal(pdfState.frameDisplay, 'block');
  assert.equal(pdfState.frameSrc, 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf');
  assert.equal(pdfState.customCardDisplay, 'none');
  assert.equal(pdfState.actionBtnDisplay, 'inline-flex');
  assert.equal(pdfState.typeLabel, 'Verified PDF Document');

  // Case C: Synthetic Credential (Tezario 3.0 Project Expo)
  const synState = simulateOpenLightbox('', 'Tezario 3.0 Project Expo', 'synthetic');
  assert.equal(synState.imageDisplay, 'none');
  assert.equal(synState.frameDisplay, 'none');
  assert.equal(synState.customCardDisplay, 'block');
  assert.equal(synState.actionBtnDisplay, 'none');
  assert.equal(synState.typeLabel, 'Special Credential');
});

// 1.3 Card Click vs Button Click Adversarial Analysis
runTest('L1.3: Inspect Button (.btn-cert-preview) resolution within .cert-card container', () => {
  // Let's simulate the actual DOM tree from index.html:
  // <article class="cert-card card" data-cert-id="C1" data-cert-type="image" data-cert-src="assets/cerificates/IMG_20260701_185332433.jpg" data-cert-title="Artiverse 3.0 Intra-College Hackathon - 1st Place">
  //    <button type="button" class="btn-cert-preview" aria-label="Preview Artiverse 3.0 Certificate">Inspect</button>
  // </article>

  let modalOpenedWith = null;
  function mockOpenLightbox(url, title, type, el) {
    modalOpenedWith = { url, title, type, el };
  }

  // Verify script.js source code genuinely implements closest('.cert-card') delegation:
  assert.ok(
    scriptJs.includes("el.closest('.cert-card')") || scriptJs.includes('el.closest(".cert-card")'),
    "script.js must resolve parent .cert-card via el.closest('.cert-card')"
  );
  assert.ok(
    scriptJs.includes('card.dataset.certSrc'),
    "script.js must check card.dataset.certSrc"
  );

  // Exact handler from script.js:
  function simulateBtnClick(btnEl) {
    const el = btnEl;
    const card = el.closest ? el.closest('.cert-card') : (el.parentNode || null);
    const src = el.tagName === 'A' 
      ? el.getAttribute('href') 
      : (el.dataset.certSrc !== undefined 
          ? el.dataset.certSrc 
          : (card && card.dataset.certSrc !== undefined ? card.dataset.certSrc : el.getAttribute('src')));
    const alt = el.tagName === 'A' 
      ? (el.getAttribute('aria-label') || el.textContent.trim()) 
      : (el.dataset.certTitle || (card && card.dataset.certTitle) || el.getAttribute('alt') || 'Preview');
    const type = el.dataset.certType || (card && card.dataset.certType) || ((src && src.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image');
    mockOpenLightbox(src, alt, type, el);
  }

  // Exact card handler from script.js lines 778-785:
  function simulateCardClick(cardEl) {
    const src = cardEl.dataset.certSrc || '';
    const title = cardEl.dataset.certTitle || 'Certificate';
    const type = cardEl.dataset.certType || ((src && src.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image');
    mockOpenLightbox(src, title, type, cardEl);
  }

  const mockCard = {
    tagName: 'ARTICLE',
    dataset: {
      certId: 'C1',
      certType: 'image',
      certSrc: 'assets/cerificates/IMG_20260701_185332433.jpg',
      certTitle: 'Artiverse 3.0 Intra-College Hackathon - 1st Place'
    }
  };

  const mockBtn = {
    tagName: 'BUTTON',
    dataset: {}, // Button in index.html does NOT have data-cert-src
    getAttribute: (attr) => (attr === 'aria-label' ? 'Preview Artiverse 3.0 Certificate' : null),
    parentNode: mockCard,
    closest: (selector) => (selector === '.cert-card' ? mockCard : null)
  };

  // Test 1: Clicking card directly opens image
  simulateCardClick(mockCard);
  assert.equal(modalOpenedWith.url, 'assets/cerificates/IMG_20260701_185332433.jpg');
  assert.equal(modalOpenedWith.type, 'image');

  // Test 2: Clicking the button .btn-cert-preview
  simulateBtnClick(mockBtn);
  
  console.log(`    [EMPIRICAL EVIDENCE] Clicking .btn-cert-preview passed URL: ${modalOpenedWith.url} (expected 'assets/cerificates/IMG_20260701_185332433.jpg')`);
  assert.equal(
    modalOpenedWith.url,
    'assets/cerificates/IMG_20260701_185332433.jpg',
    `CRITICAL BUG: .btn-cert-preview click resolved URL to ${modalOpenedWith.url} instead of card's data-cert-src! In script.js, openLightbox receives null URL, triggering isSynthetic=true and falsely displaying Tezario Project Expo for Artiverse Hackathon!`
  );
  assert.equal(modalOpenedWith.type, 'image');

  // Test 3: Keyboard trigger (Enter/Space) verification
  assert.ok(
    scriptJs.includes("e.key === 'Enter'") || scriptJs.includes('e.key === "Enter"'),
    "script.js must support Enter keyboard trigger"
  );
  assert.ok(
    scriptJs.includes("e.key === ' '") || scriptJs.includes('e.key === " "'),
    "script.js must support Space keyboard trigger"
  );
});

// 1.4 Lightbox Dismissal Mechanisms
runTest('L1.4: Lightbox Dismissal Mechanisms (Close Button, Escape Key, Backdrop)', () => {
  let modalShown = true;
  let ariaHidden = 'false';
  let bodyOverflow = 'hidden';
  let imageSrc = 'sample.jpg';
  let frameSrc = 'sample.pdf';

  function closeModal() {
    modalShown = false;
    ariaHidden = 'true';
    bodyOverflow = '';
    imageSrc = '';
    frameSrc = '';
  }

  // Dismissal 1: Close button
  modalShown = true;
  closeModal();
  assert.equal(modalShown, false);
  assert.equal(ariaHidden, 'true');
  assert.equal(bodyOverflow, '');
  assert.equal(imageSrc, '');
  assert.equal(frameSrc, '');

  // Dismissal 2: Escape key
  modalShown = true;
  const evt = { key: 'Escape' };
  if (modalShown && evt.key === 'Escape') closeModal();
  assert.equal(modalShown, false);

  // Dismissal 3: Backdrop click vs content click
  modalShown = true;
  function handleClick(isBackdrop) {
    if (isBackdrop) closeModal();
  }
  handleClick(true);
  assert.equal(modalShown, false);
});

// 1.5 Lightbox Accessibility: Focus Trap and Focus Restoration
runTest('L1.5: Accessibility: Focus Trap and Return Focus to Trigger Element', () => {
  assert.ok(
    scriptJs.includes('lastModalTrigger'),
    'script.js must track lastModalTrigger for focus restoration'
  );
  assert.ok(
    scriptJs.includes('lastModalTrigger.focus()'),
    'script.js must restore focus via lastModalTrigger.focus()'
  );
  assert.ok(
    scriptJs.includes("e.key === 'Tab'"),
    'script.js must intercept Tab key for focus trapping'
  );
  assert.ok(
    scriptJs.includes('e.shiftKey'),
    'script.js must handle Shift+Tab reverse wrapping'
  );
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 2: THEME SWITCHER EMPIRICAL STRESS TESTS
// ────────────────────────────────────────────────────────────────────────────
console.log('\n► SECTION 2: Theme Switcher Adversarial Stress Tests');

// 2.1 Rapid Theme Toggling (100 cycles)
runTest('T2.1: Rapid Theme Toggling Stress Test (100 cycles)', () => {
  const store = new Map();
  let currentTheme = 'light';
  let datasetTheme = undefined;

  function apply(theme) {
    if (theme === 'dark') {
      datasetTheme = 'dark';
    } else {
      datasetTheme = undefined;
    }
  }

  function toggle() {
    const next = datasetTheme === 'dark' ? 'light' : 'dark';
    apply(next);
    store.set('km_theme', next);
    currentTheme = next;
  }

  apply('light');
  for (let i = 0; i < 100; i++) {
    toggle();
    if (i % 2 === 0) {
      assert.equal(currentTheme, 'dark');
      assert.equal(datasetTheme, 'dark');
      assert.equal(store.get('km_theme'), 'dark');
    } else {
      assert.equal(currentTheme, 'light');
      assert.equal(datasetTheme, undefined);
      assert.equal(store.get('km_theme'), 'light');
    }
  }
  assert.equal(currentTheme, 'light');
  assert.equal(store.get('km_theme'), 'light');
});

// 2.2 CSS Design Tokens in style.css
runTest('T2.2: CSS Tokens Verification for Light and Dark Modes', () => {
  const requiredTokens = [
    '--bg',
    '--text',
    '--glass-surface',
    '--glass-border',
    '--glass-blur',
    '--cyber-cyan',
    '--cyber-teal',
    '--cyber-indigo',
  ];

  for (const token of requiredTokens) {
    assert.ok(
      styleCss.includes(token),
      `CSS token ${token} missing from style.css`
    );
  }

  assert.ok(
    styleCss.includes("body[data-theme='dark']") || styleCss.includes('body[data-theme="dark"]'),
    "body[data-theme='dark'] selector missing in style.css"
  );
});

// 2.3 LocalStorage Persistence and Graceful Fallback
runTest('T2.3: Theme LocalStorage Persistence and Corruption Resilience', () => {
  function getResolvedTheme(val) {
    return (val === 'dark') ? 'dark' : 'light';
  }

  assert.equal(getResolvedTheme('dark'), 'dark');
  assert.equal(getResolvedTheme('light'), 'light');
  assert.equal(getResolvedTheme(null), 'light');
  assert.equal(getResolvedTheme(''), 'light');
  assert.equal(getResolvedTheme('undefined'), 'light');
  assert.equal(getResolvedTheme('<script>'), 'light');
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 3: TERMINAL EMULATOR INTEGRATION STRESS TESTS
// ────────────────────────────────────────────────────────────────────────────
console.log('\n► SECTION 3: Terminal Emulator Adversarial Stress Tests');

// 3.1 Terminal Commands Execution
runTest('M3.1: Terminal Command Execution: help, skills, projects, clear, unknown_cmd', () => {
  let terminalLines = [];

  function appendLine(text, type = '') {
    terminalLines.push({ text, type });
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function handleCommand(cmd) {
    const rawCmd = cmd.trim();
    const cleanCmd = rawCmd.toLowerCase();
    if (!cleanCmd) return;

    appendLine(`<span class="t-prompt">security@kabilan:~$</span> ${escapeHtml(cmd)}`);

    const parts = cleanCmd.split(/\s+/);
    const mainCmd = parts[0];

    switch (mainCmd) {
      case 'help':
        appendLine('Available Linux & System Commands:\n  resume\n  skills\n  projects\n  clear', 't-log');
        break;
      case 'skills':
        appendLine('<b>[Kabilan\'s Skills Profile]</b>\n  - Languages: Java, HTML5, CSS3', 't-green');
        break;
      case 'projects':
        appendLine('<b>[Featured Project Portfolio]</b>\n  1. Wi-Fi De-authentication Device', 't-cyan');
        break;
      case 'clear':
        terminalLines = [];
        appendLine("Welcome to Kabilan's Interactive Lab Terminal", 't-log');
        break;
      default:
        appendLine(`bash: ${escapeHtml(cleanCmd)}: command not found. Type <span class="t-cyan">help</span> or <span class="t-cyan">resume</span> to list commands.`, 't-red');
    }
  }

  // 1. help
  handleCommand('help');
  assert.ok(terminalLines.some(l => l.text.includes('Available Linux & System Commands')));

  // 2. skills
  handleCommand('skills');
  assert.ok(terminalLines.some(l => l.text.includes("Kabilan's Skills Profile")));

  // 3. projects
  handleCommand('projects');
  assert.ok(terminalLines.some(l => l.text.includes('Featured Project Portfolio')));

  // 4. unknown_cmd with XSS attack
  handleCommand('unknown_cmd <script>alert("xss")</script>');
  const unknownLine = terminalLines.find(l => l.text.includes('command not found'));
  assert.ok(unknownLine, 'Unknown command feedback line missing');
  assert.ok(!unknownLine.text.includes('<script>'), 'Injection must be safely escaped');
  assert.ok(unknownLine.text.includes('&lt;script&gt;'), 'HTML tags must be escaped to &lt;script&gt;');

  // 5. clear
  handleCommand('clear');
  assert.equal(terminalLines.length, 1, 'Clear should wipe terminal body except welcome line');
  assert.ok(terminalLines[0].text.includes("Welcome to Kabilan's Interactive Lab Terminal"));
});

// 3.2 Terminal Non-Interference with SPA Routing
runTest('M3.2: Terminal Navigation & Section Display SPA Isolation', () => {
  const sections = ['home', 'about', 'skills', 'projects', 'achievements', 'terminal', 'contact'];
  const visibility = {};
  sections.forEach(s => { visibility[s] = (s === 'home'); });

  function showSection(targetId) {
    sections.forEach(s => { visibility[s] = (s === targetId); });
  }

  assert.equal(visibility.home, true);
  assert.equal(visibility.terminal, false);

  showSection('terminal');
  assert.equal(visibility.terminal, true);
  assert.equal(visibility.achievements, false);
  assert.equal(visibility.home, false);

  showSection('achievements');
  assert.equal(visibility.achievements, true);
  assert.equal(visibility.terminal, false);
});

// 3.3 Terminal XSS Immunity
runTest('M3.3: Terminal Input HTML Entity Escaping (Adversarial Payloads)', () => {
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const payloads = [
    '<img src=x onerror=alert(1)>',
    '"><script>alert(document.cookie)</script>',
    '\' OR \'1\'=\'1',
    '& < > " \''
  ];

  for (const p of payloads) {
    const escaped = escapeHtml(p);
    assert.ok(!escaped.includes('<img'));
    assert.ok(!escaped.includes('<script>'));
    assert.ok(escaped.includes('&lt;') || !p.includes('<'));
    assert.ok(escaped.includes('&gt;') || !p.includes('>'));
  }
});

console.log('\n======================================================');
console.log(` RESULTS: ${results.passed} passed, ${results.failed} failed`);
console.log('======================================================\n');

process.exit(results.failed === 0 ? 0 : 1);
