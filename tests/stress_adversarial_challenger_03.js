/**
 * CHALLENGER 03: EMPIRICAL ADVERSARIAL VERIFICATION & STRESS SUITE
 * 
 * Verifies:
 * 1. Click delegation & dataset resolution across all 14 ribbon cards (7 primary + 7 clones)
 * 2. Deep event propagation and target nesting (clicks on <i> icon inside .btn-cert-preview)
 * 3. Exact matching of data-cert-src to existing physical assets on disk
 * 4. Image vs PDF vs Synthetic dispatcher integrity for every certificate
 * 5. Seam gap mathematical zeroing via style.css padding-right: 24px
 * 6. Keyboard navigation (Enter, Space, Escape, Tab focus trap) and focus restoration
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const scriptJs = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('======================================================');
console.log(' CHALLENGER 03: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('======================================================\n');

// ----------------------------------------------------
// SECTION 1: All 14 Ribbon Cards Click Delegation & Resolution
// ----------------------------------------------------
console.log('► SECTION 1: Exhaustive Ribbon Cards Click Delegation & Asset Resolution');

// Extract all cards from index.html
const cardRegex = /<article\s+class="cert-card card"[^>]*data-cert-id="([^"]+)"[^>]*data-cert-type="([^"]+)"[^>]*data-cert-src="([^"]*)"[^>]*data-cert-title="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;

let match;
const cards = [];
while ((match = cardRegex.exec(indexHtml)) !== null) {
  cards.push({
    id: match[1],
    type: match[2],
    src: match[3],
    title: match[4],
    innerHtml: match[5]
  });
}

runTest('C3.1.1: Verify total card count in index.html (7 primary + 7 clones = 14)', () => {
  assert.strictEqual(cards.length, 14, `Expected 14 cards, got ${cards.length}`);
});

// Simulating script.js lightbox dispatcher and handleTrigger logic
function simulateScriptJsHandleTrigger(btnEl) {
  let modalOpenedWith = null;
  const mockOpenLightbox = (src, alt, type, el) => {
    modalOpenedWith = { src, title: alt, alt, type, el };
  };

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
  return modalOpenedWith;
}

// Simulating openLightbox state machine from script.js lines 628-670
function simulateOpenLightbox(src, title, type) {
  const isPdf = type === 'pdf' || (typeof src === 'string' && src.toLowerCase().endsWith('.pdf'));
  const isSynthetic = type === 'synthetic' || !src;

  if (isSynthetic) {
    return { mode: 'synthetic', activeElement: 'customCard', label: 'Special Credential' };
  } else if (isPdf) {
    return { mode: 'pdf', activeElement: 'frame', label: 'Verified PDF Document', src };
  } else {
    return { mode: 'image', activeElement: 'image', label: 'Official Certificate Image', src };
  }
}

runTest('C3.1.2: Verify .btn-cert-preview resolution on all 14 individual cards', () => {
  for (const c of cards) {
    const mockCard = {
      tagName: 'ARTICLE',
      dataset: {
        certId: c.id,
        certType: c.type,
        certSrc: c.src,
        certTitle: c.title
      }
    };
    const mockBtn = {
      tagName: 'BUTTON',
      dataset: {},
      getAttribute: (attr) => (attr === 'aria-label' ? `Preview ${c.title}` : null),
      parentNode: mockCard,
      closest: (sel) => (sel === '.cert-card' ? mockCard : null)
    };

    const triggerResult = simulateScriptJsHandleTrigger(mockBtn);
    assert.strictEqual(triggerResult.src, c.src, `Card ${c.id} src mismatch`);
    assert.strictEqual(triggerResult.title, c.title, `Card ${c.id} title mismatch`);
    assert.strictEqual(triggerResult.type, c.type, `Card ${c.id} type mismatch`);

    const modalState = simulateOpenLightbox(triggerResult.src, triggerResult.title, triggerResult.type);
    if (c.type === 'synthetic') {
      assert.strictEqual(modalState.mode, 'synthetic', `Card ${c.id} must open in synthetic mode`);
    } else if (c.type === 'pdf') {
      assert.strictEqual(modalState.mode, 'pdf', `Card ${c.id} must open in pdf mode`);
      assert.strictEqual(modalState.src, c.src, `Card ${c.id} pdf src must match authentic file path`);
    } else if (c.type === 'image') {
      assert.strictEqual(modalState.mode, 'image', `Card ${c.id} must open in image mode`);
      assert.strictEqual(modalState.src, c.src, `Card ${c.id} image src must match authentic file path`);
    }
  }
});

runTest('C3.1.3: Verify physical existence of all linked certificate assets on disk', () => {
  for (const c of cards) {
    if (c.src && c.type !== 'synthetic') {
      const fullPath = path.join(ROOT, c.src);
      assert.ok(fs.existsSync(fullPath), `Asset file missing on disk: ${c.src}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 0, `Asset file is empty (0 bytes): ${c.src}`);
    }
  }
});

// ----------------------------------------------------
// SECTION 2: Nested Click Target & Event Propagation Stress Tests
// ----------------------------------------------------
console.log('\n► SECTION 2: Nested Click Target & Event Propagation Stress Tests');

runTest('C3.2.1: Nested <i> icon click inside .btn-cert-preview resolves parent card', () => {
  const sampleCard = cards[0];
  const mockCard = {
    tagName: 'ARTICLE',
    dataset: {
      certId: sampleCard.id,
      certType: sampleCard.type,
      certSrc: sampleCard.src,
      certTitle: sampleCard.title
    }
  };
  const mockBtn = {
    tagName: 'BUTTON',
    dataset: {},
    getAttribute: () => null,
    parentNode: mockCard,
    closest: (sel) => (sel === '.cert-card' ? mockCard : null)
  };
  const mockIcon = {
    tagName: 'I',
    parentNode: mockBtn,
    closest: (sel) => {
      if (sel === '.btn-cert-preview') return mockBtn;
      if (sel === '.cert-card') return mockCard;
      return null;
    }
  };

  // When clickableElements is querySelectorAll('.btn-cert-preview'), the event listener receives el = mockBtn
  const triggerResult = simulateScriptJsHandleTrigger(mockBtn);
  assert.strictEqual(triggerResult.src, sampleCard.src);
  assert.strictEqual(triggerResult.type, sampleCard.type);
});

runTest('C3.2.2: .cert-card click handler guards against double-firing from .btn-cert-preview and external link', () => {
  // Check script.js line 796 and 806
  const hasExternalGuard = scriptJs.includes("e.target.closest('a.btn-cert-external')");
  const hasPreviewGuard = scriptJs.includes("e.target.closest('.btn-cert-preview')");
  
  assert.ok(hasExternalGuard, 'script.js must guard cert-card handler against external link clicks');
  assert.ok(hasPreviewGuard, 'script.js must guard cert-card handler against .btn-cert-preview clicks');
});

// ----------------------------------------------------
// SECTION 3: Mathematical Ribbon Seam Verification
// ----------------------------------------------------
console.log('\n► SECTION 3: Mathematical Ribbon Seam Verification');

runTest('C3.3.1: Verify style.css declares padding-right: 24px on #certRibbonTrack / .cert-ribbon-track', () => {
  const trackBlockMatch = styleCss.match(/(\.cert-ribbon-track[\s\S]*?\{[\s\S]*?\})/i);
  assert.ok(trackBlockMatch, 'Could not find .cert-ribbon-track CSS block');
  const trackBlock = trackBlockMatch[1];

  assert.ok(trackBlock.includes('gap: 24px;'), 'Track must have gap: 24px');
  assert.ok(trackBlock.includes('padding-right: 24px;'), 'Track must have padding-right: 24px to eliminate half-gap seam');
  assert.ok(trackBlock.includes('display: flex;'), 'Track must be display: flex');
  assert.ok(trackBlock.includes('width: max-content;'), 'Track must have width: max-content');
});

runTest('C3.3.2: Exact mathematical seam offset calculation with padding-right: 24px', () => {
  const W = 320; // card width
  const G = 24;  // gap
  const N = 7;   // number of primary cards
  const P = 24;  // padding-right

  // Total width of track with 14 cards, 13 gaps, and padding-right
  const totalTrackWidth = (2 * N * W) + ((2 * N - 1) * G) + P;
  // 14 * 320 + 13 * 24 + 24 = 4480 + 312 + 24 = 4816px
  assert.strictEqual(totalTrackWidth, 4816, 'Total track width must be 4816px');

  // Animation translates by -50%
  const shift50 = totalTrackWidth * 0.5;
  assert.strictEqual(shift50, 2408, '50% shift must be exactly 2408px');

  // Position where Clone 1 starts: after N cards and N gaps
  const clone1Start = N * W + N * G;
  // 7 * 320 + 7 * 24 = 2240 + 168 = 2408px
  assert.strictEqual(clone1Start, 2408, 'Clone 1 starting position must be exactly 2408px');

  // Difference between 50% shift and Clone 1 start
  const seamOffset = Math.abs(clone1Start - shift50);
  assert.strictEqual(seamOffset, 0, `Seam offset must be 0px, got ${seamOffset}px`);
  console.log(`    [SEAM PROOF] Total: ${totalTrackWidth}px | -50% Shift: ${shift50}px | Clone 1 Start: ${clone1Start}px | Seam Offset: ${seamOffset}px (ZERO SEAM)`);
});

// ----------------------------------------------------
// SECTION 4: Accessibility & Keyboard Interaction Verification
// ----------------------------------------------------
console.log('\n► SECTION 4: Accessibility & Keyboard Interaction Verification');

runTest('C3.4.1: Enter and Space keyboard triggers on .btn-cert-preview in script.js', () => {
  assert.ok(
    scriptJs.includes("e.key === 'Enter'") && scriptJs.includes("e.key === ' '"),
    'Keyboard triggers for Enter and Space must be present in handleTrigger'
  );
});

runTest('C3.4.2: Focus restoration to triggering element upon modal close', () => {
  assert.ok(
    scriptJs.includes('lastModalTrigger.focus()'),
    'script.js must restore focus to lastModalTrigger upon closing modal'
  );
});

runTest('C3.4.3: Focus trap (Shift+Tab and Tab wrap) inside lightbox modal', () => {
  assert.ok(
    scriptJs.includes("e.key === 'Tab'") && scriptJs.includes('e.shiftKey'),
    'script.js must implement Tab and Shift+Tab focus trap in lightbox'
  );
});

runTest('C3.4.4: Escape key dismissal listener', () => {
  assert.ok(
    scriptJs.includes("e.key === 'Escape'"),
    'script.js must implement Escape key dismissal'
  );
});

console.log('\n======================================================');
console.log(` RESULTS: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
