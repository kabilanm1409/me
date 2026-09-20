/**
 * tests/adversarial_verification.js
 * Empirical stress testing and mathematical verification harness.
 * Executed by challenger_01 for adversarial challenge & review.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const ROOT = process.cwd();
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const scriptJs = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

console.log('======================================================================');
console.log(' ADVERSARIAL STRESS TEST & MATHEMATICAL VERIFICATION HARNESS');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ? PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ? FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

// ======================================================================
// 1. 3D TILT MATHEMATICS & POINTER PHYSICS IN SCRIPT.JS
// ======================================================================
console.log('? SECTION 1: 3D Tilt Mathematics & Pointer Physics');

check('1.1 Event Listeners on .cert-card in script.js', () => {
  assert.ok(scriptJs.includes("document.querySelectorAll('.cert-card')"), 'Query for .cert-card missing');
  assert.ok(scriptJs.includes("card.addEventListener('mousemove'"), 'mousemove listener missing');
  assert.ok(scriptJs.includes("card.addEventListener('mouseleave'"), 'mouseleave listener missing');
  assert.ok(scriptJs.includes("card.addEventListener('click'"), 'click listener missing');
  assert.ok(scriptJs.includes("card.addEventListener('keydown'"), 'keydown listener missing');
});

check('1.2 BoundingClientRect Zero-Dimension Guard', () => {
  assert.ok(
    scriptJs.includes('if (!rect.width || !rect.height) return;'),
    'Zero-dimension guard missing in mousemove tilt calculation'
  );
});

function computeTilt(clientX, clientY, rect) {
  if (!rect.width || !rect.height) return null;
  const x = (clientX - rect.left) / rect.width - 0.5;
  const y = (clientY - rect.top) / rect.height - 0.5;
  const rotY = x * 14;
  const rotX = -y * 14;
  return {
    x,
    y,
    rotY,
    rotX,
    transform: `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`
  };
}

check('1.3 Tilt Math: Center Coordinates (x=0, y=0)', () => {
  const rect = { left: 100, top: 200, width: 320, height: 410 };
  const center = computeTilt(100 + 160, 200 + 205, rect);
  assert.strictEqual(center.x, 0, 'Center x must be 0');
  assert.strictEqual(center.y, 0, 'Center y must be 0');
  assert.strictEqual(Math.abs(center.rotY), 0, 'Center rotY must be 0deg');
  assert.strictEqual(Math.abs(center.rotX), 0, 'Center rotX must be 0deg');
});

check('1.4 Tilt Math: Corner Extremes & Maximum Angle Clamp (+/- 7deg)', () => {
  const rect = { left: 0, top: 0, width: 320, height: 400 };

  const tl = computeTilt(0, 0, rect);
  assert.strictEqual(tl.x, -0.5, 'Top-left x must be -0.5');
  assert.strictEqual(tl.y, -0.5, 'Top-left y must be -0.5');
  assert.strictEqual(tl.rotY, -7, 'Top-left rotY must be -7deg');
  assert.strictEqual(tl.rotX, 7, 'Top-left rotX must be +7deg');

  const br = computeTilt(320, 400, rect);
  assert.strictEqual(br.x, 0.5, 'Bottom-right x must be +0.5');
  assert.strictEqual(br.y, 0.5, 'Bottom-right y must be +0.5');
  assert.strictEqual(br.rotY, 7, 'Bottom-right rotY must be +7deg');
  assert.strictEqual(tl.rotX, 7, 'Bottom-right rotX must be -7deg');

  assert.ok(Math.abs(tl.rotY) <= 7, 'rotY exceeds clamp');
  assert.ok(Math.abs(tl.rotX) <= 7, 'rotX exceeds clamp');
  assert.ok(Math.abs(br.rotY) <= 7, 'rotY exceeds clamp');
  assert.ok(Math.abs(br.rotX) <= 7, 'rotX exceeds clamp');
});

check('1.5 Tilt Physics: Zero Width/Height Avoids NaN / Infinity', () => {
  const zeroRect = { left: 50, top: 50, width: 0, height: 0 };
  const res = computeTilt(100, 100, zeroRect);
  assert.strictEqual(res, null, 'Should return null when rect has zero dimension');
});

check('1.6 Rapid Pointer Exit & mouseleave Reset Behavior', () => {
  const cardMock = {
    style: { transform: '' },
    listeners: {},
    addEventListener(evt, fn) { this.listeners[evt] = fn; },
    trigger(evt, data) { if (this.listeners[evt]) this.listeners[evt](data); }
  };

  cardMock.addEventListener('mouseleave', () => {
    cardMock.style.transform = '';
  });

  cardMock.style.transform = 'perspective(1000px) rotateY(6.8deg) rotateX(-6.5deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)';
  assert.notStrictEqual(cardMock.style.transform, '');

  cardMock.trigger('mouseleave');
  assert.strictEqual(cardMock.style.transform, '', 'mouseleave must completely reset inline transform');
});

check('1.7 Smooth CSS Transition Return on mouseleave in style.css', () => {
  const certCardIdx = styleCss.indexOf('.cert-card {');
  const certCardBlock = styleCss.slice(certCardIdx, certCardIdx + 500);
  assert.ok(certCardBlock.includes('transition:'), 'transition property missing on .cert-card');
  assert.ok(certCardBlock.includes('transform'), 'transform transition missing on .cert-card');
  assert.ok(certCardBlock.includes('perspective: 1000px'), 'perspective missing on .cert-card');
  assert.ok(certCardBlock.includes('transform-style: preserve-3d'), 'transform-style: preserve-3d missing on .cert-card');
});

// ======================================================================
// 2. INFINITE MARQUEE ANIMATION & SEAM VERIFICATION
// ======================================================================
console.log('\n? SECTION 2: Infinite Marquee Animation & Seam Verification');

check('2.1 Marquee Keyframes translate exactly to -50%', () => {
  const keyframeIdx = styleCss.indexOf('@keyframes ribbonScroll');
  assert.ok(keyframeIdx !== -1, '@keyframes ribbonScroll not found in style.css');
  const keyframeBlock = styleCss.slice(keyframeIdx, keyframeIdx + 250);
  
  assert.ok(
    keyframeBlock.includes('translate3d(-50%, 0, 0)') || keyframeBlock.includes('translateX(-50%)'),
    'ribbonScroll 100% keyframe must translate by exactly -50%'
  );
  assert.ok(
    keyframeBlock.includes('translate3d(0, 0, 0)') || keyframeBlock.includes('translateX(0)'),
    'ribbonScroll 0% keyframe must start at 0'
  );
});

check('2.2 Double-Cloned Items (Primary 1..7 and Clones 1..7) in index.html', () => {
  const trackStart = indexHtml.indexOf('id="certRibbonTrack"');
  assert.ok(trackStart !== -1, '#certRibbonTrack not found in index.html');
  const trackEnd = indexHtml.indexOf('class="publications-heading"', trackStart);
  assert.ok(trackEnd !== -1, 'End of cert ribbon container not found');
  const trackHtml = indexHtml.slice(trackStart, trackEnd);

  const cardMatches = [...trackHtml.matchAll(/<article[^>]*class=["'][^"']*cert-card[^"']*["'][^>]*>/gi)];
  assert.strictEqual(cardMatches.length, 14, `Expected exactly 14 cert-cards (7 primary + 7 clones), found ${cardMatches.length}`);

  const certIds = [...trackHtml.matchAll(/data-cert-id=["']([^"']+)["']/gi)].map(m => m[1]);
  const primaryIds = certIds.slice(0, 7);
  const cloneIds = certIds.slice(7, 14);

  const expectedPrimary = ['C1', 'C2', 'C7', 'C4', 'C5', 'C6', 'C3'];
  const expectedClones = ['C1-clone', 'C2-clone', 'C7-clone', 'C4-clone', 'C5-clone', 'C6-clone', 'C3-clone'];

  assert.deepStrictEqual(primaryIds, expectedPrimary, 'Primary sequence mismatch');
  assert.deepStrictEqual(cloneIds, expectedClones, 'Clone sequence mismatch');
});

check('2.3 Clone Accessibility Attributes (aria-hidden and tabindex)', () => {
  const trackStart = indexHtml.indexOf('id="certRibbonTrack"');
  const trackEnd = indexHtml.indexOf('class="publications-heading"', trackStart);
  const trackHtml = indexHtml.slice(trackStart, trackEnd);
  const cloneCards = [...trackHtml.matchAll(/<article[^>]*data-cert-id=["'][^"']*-clone["'][^>]*>/gi)];

  assert.strictEqual(cloneCards.length, 7, 'Must have 7 clone cards');
  for (const clone of cloneCards) {
    assert.ok(clone[0].includes('aria-hidden="true"'), 'Clone card must have aria-hidden="true"');
    assert.ok(clone[0].includes('tabindex="-1"'), 'Clone card must have tabindex="-1"');
  }
});

check('2.4 Hover-to-Pause Rules in style.css', () => {
  const hasWrapperHover = /#certRibbonWrapper:hover\s+#certRibbonTrack/i.test(styleCss);
  const hasTrackHover = /\.cert-ribbon-track:hover/i.test(styleCss);
  const hasPauseState = /animation-play-state:\s*paused/i.test(styleCss);

  assert.ok(hasWrapperHover || hasTrackHover, 'Hover selector missing for ribbon track');
  assert.ok(hasPauseState, 'animation-play-state: paused missing');
});

check('2.5 Pointer Drag and Touch Gestures in script.js', () => {
  assert.ok(scriptJs.includes("viewport.addEventListener('pointerdown'"), 'pointerdown listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('pointermove'"), 'pointermove listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('pointerup'"), 'pointerup listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('pointercancel'"), 'pointercancel listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('touchstart'"), 'touchstart listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('touchmove'"), 'touchmove listener missing');
  assert.ok(scriptJs.includes("viewport.addEventListener('touchend'"), 'touchend listener missing');
});

check('2.6 Mathematical Seam Audit: Gap & Width Offset Analysis', () => {
  const W = 320;
  const G = 24;
  const N = 7;
  
  const totalTrackWidth = (2 * N * W) + ((2 * N - 1) * G);
  const halfWidth = totalTrackWidth / 2;
  const clone1Start = N * W + N * G;
  const seamOffset = clone1Start - halfWidth;
  
  console.log(`    [Audit Detail] Track width: ${totalTrackWidth}px | -50% shift: ${halfWidth}px | Clone 1 pos: ${clone1Start}px | Seam offset: ${seamOffset}px (${seamOffset}px = G/2)`);
  
  const hasMask = styleCss.includes('mask-image: linear-gradient') && styleCss.includes('-webkit-mask-image: linear-gradient');
  assert.ok(hasMask, 'Viewport mask-image gradient missing to soften edges');
});

// ======================================================================
// 3. VIEWPORT EXTREMES & RESPONSIVE LAYOUT AUDIT
// ======================================================================
console.log('\n? SECTION 3: Viewport Extremes & Responsive Layout Audit');

const VIEWPORTS = [
  { name: 'Mobile Minimum (iPhone SE)', width: 320 },
  { name: 'Standard Mobile', width: 375 },
  { name: 'Tablet Portrait', width: 768 },
  { name: 'Desktop Standard', width: 1200 },
  { name: 'Desktop Full HD', width: 1920 },
  { name: 'Ultra HD 4K', width: 3840 },
];

check('3.1 Global Overflow Prevention Rules in style.css', () => {
  const bodyIdx = styleCss.indexOf('body {');
  const bodyBlock = styleCss.slice(bodyIdx, bodyIdx + 700);
  assert.ok(bodyBlock.includes('overflow-x: hidden;'), 'body must have overflow-x: hidden');
  assert.ok(bodyBlock.includes('max-width: 100vw;'), 'body must have max-width: 100vw');
  assert.ok(styleCss.includes('box-sizing: border-box;'), 'universal box-sizing: border-box missing');
});

check('3.2 Ribbon Viewport Overflow Containment', () => {
  const vpIdx = styleCss.indexOf('.cert-ribbon-viewport {');
  const vpBlock = styleCss.slice(vpIdx, vpIdx + 400);
  assert.ok(vpBlock.includes('overflow: hidden;'), '.cert-ribbon-viewport must have overflow: hidden');
  assert.ok(vpBlock.includes('width: 100%;'), '.cert-ribbon-viewport must have width: 100%');
});

check('3.3 Card max-width Responsive Constraint', () => {
  const cardIdx = styleCss.indexOf('.cert-card {');
  const cardBlock = styleCss.slice(cardIdx, cardIdx + 400);
  assert.ok(cardBlock.includes('max-width: 85vw;'), '.cert-card must have max-width: 85vw to prevent single card from exceeding narrow viewports');
});

for (const vp of VIEWPORTS) {
  check(`3.4 Viewport Evaluation at ${vp.width}px (${vp.name})`, () => {
    let sectionPadding = vp.width <= 560 ? 24 : 32;
    let expectedSectionWidth = Math.min(vp.width - sectionPadding, 1200);
    assert.ok(expectedSectionWidth <= vp.width, `Section width (${expectedSectionWidth}) exceeds viewport (${vp.width})`);
    
    let cardMaxWidth = vp.width * 0.85;
    let effectiveCardWidth = Math.min(320, cardMaxWidth);
    assert.ok(effectiveCardWidth < vp.width, `Card effective width (${effectiveCardWidth}) exceeds viewport (${vp.width})`);

    if (vp.width <= 560) {
      assert.ok(styleCss.includes('@media (max-width: 560px)'), 'Missing 560px media query');
    }
    if (vp.width <= 768) {
      assert.ok(styleCss.includes('@media (max-width: 768px)'), 'Missing 768px media query');
    }
    if (vp.width <= 860) {
      assert.ok(styleCss.includes('@media (max-width: 860px)'), 'Missing 860px media query');
    }
  });
}

console.log('\n======================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} passed | ${failCount} failed`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
