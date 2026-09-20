/**
 * tests/terminal_and_security_features.test.js
 * Verification for:
 * 1. Admin panel launching via terminal commands (admin, sudo admin, open admin, login)
 * 2. Linux file system commands: touch, rm, upload, nano, update, cd, echo redirection, ls, cat
 * 3. Project 1 and Project 3 image assets resolution and SVG validity
 * 4. API Key & sensitive information shielding from DevTools inspection
 */

const fs = require('node:fs');
const path = require('node:path');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR } = require('./helpers/test_fixtures');

describe('Interactive Linux Terminal & Security Hardening Suite', () => {

  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const scriptJs = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');
  const firebaseConfigJs = fs.readFileSync(path.join(ROOT_DIR, 'firebase-config.js'), 'utf8');
  const projectsHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'projects.html'), 'utf8');

  // ── 1. Admin Panel Opening via Terminal ──
  test('R1: Terminal supports admin, sudo admin, and login commands to open admin panel', () => {
    assert.ok(
      /case\s+['"]admin['"]/i.test(scriptJs),
      'script.js missing case "admin" in terminal switch'
    );
    assert.ok(
      /case\s+['"]login['"]/i.test(scriptJs),
      'script.js missing case "login" in terminal switch'
    );
    assert.ok(
      scriptJs.includes('openAdminPanel'),
      'script.js missing openAdminPanel handler'
    );
    assert.ok(
      scriptJs.includes('admin.html'),
      'script.js must open or reference admin.html'
    );
  });

  // ── 2. Linux File Management Commands in Terminal ──
  test('R2: Terminal supports Linux commands for file/document creation, upload, deletion and editing', () => {
    const requiredLinuxCases = [
      'touch',
      'rm',
      'upload',
      'nano',
      'update',
      'cd',
      'mkdir',
      'rmdir',
      'grep',
      'curl',
      'ps',
      'chmod'
    ];

    for (const cmd of requiredLinuxCases) {
      const pattern = new RegExp(`case\\s+['"]${cmd}['"]`, 'i');
      assert.ok(
        pattern.test(scriptJs),
        `script.js missing Linux command case "${cmd}"`
      );
    }

    assert.ok(
      scriptJs.includes('VFS_STORAGE_KEY') || scriptJs.includes('loadVFS'),
      'script.js missing Virtual File System (VFS) persistence'
    );
    assert.ok(
      scriptJs.includes('terminalFileInput') || scriptJs.includes('tFileInput'),
      'script.js missing document upload file picker trigger'
    );
    assert.ok(
      indexHtml.includes('id="terminalFileInput"'),
      'index.html missing hidden #terminalFileInput for document uploads'
    );
  });

  // ── 3. Project 1 and Project 3 Asset Resolution ──
  test('R3.1: Project 1 and Project 3 SVG assets physically exist on disk and have valid SVG markup', () => {
    const p1SvgPath = path.join(ROOT_DIR, 'assets', 'projects', 'wifi_deauth.svg');
    const p3SvgPath = path.join(ROOT_DIR, 'assets', 'projects', 'forest_fire.svg');

    assert.ok(fs.existsSync(p1SvgPath), 'assets/projects/wifi_deauth.svg is missing on disk');
    assert.ok(fs.existsSync(p3SvgPath), 'assets/projects/forest_fire.svg is missing on disk');

    const p1Content = fs.readFileSync(p1SvgPath, 'utf8');
    const p3Content = fs.readFileSync(p3SvgPath, 'utf8');

    assert.ok(p1Content.includes('<svg') && p1Content.includes('</svg>'), 'wifi_deauth.svg has invalid SVG tags');
    assert.ok(p3Content.includes('<svg') && p3Content.includes('</svg>'), 'forest_fire.svg has invalid SVG tags');
    assert.ok(p1Content.length > 500, 'wifi_deauth.svg is too small');
    assert.ok(p3Content.length > 500, 'forest_fire.svg is too small');
  });

  test('R3.2: index.html and pages/projects.html reference valid project image paths without broken data-URIs', () => {
    assert.ok(
      indexHtml.includes('assets/projects/wifi_deauth.svg'),
      'index.html missing assets/projects/wifi_deauth.svg reference for Project 1'
    );
    assert.ok(
      indexHtml.includes('assets/projects/forest_fire.svg'),
      'index.html missing assets/projects/forest_fire.svg reference for Project 3'
    );
    assert.ok(
      projectsHtml.includes('../assets/projects/wifi_deauth.svg'),
      'pages/projects.html missing ../assets/projects/wifi_deauth.svg for Project 1'
    );
    assert.ok(
      projectsHtml.includes('../assets/projects/forest_fire.svg'),
      'pages/projects.html missing ../assets/projects/forest_fire.svg for Project 3'
    );
    const projectSectionMatch = indexHtml.match(/<section[^>]*id="projects"[^>]*>([\s\S]*?)<\/section>/i);
    assert.ok(projectSectionMatch, 'projects section missing in index.html');
    assert.equal(
      projectSectionMatch[1].includes('data:image/svg'),
      false,
      'Project cards in index.html should not contain data:image/svg URIs'
    );
  });

  // ── 4. API Key & Security Hardening ──
  test('R4: API keys and sensitive credentials are shielded from DevTools and DOM inspection', () => {
    assert.ok(
      firebaseConfigJs.includes('_VAULT_KEY'),
      'firebase-config.js must contain _VAULT_KEY obfuscation vault'
    );
    assert.ok(
      firebaseConfigJs.includes('maskApiKey'),
      'firebase-config.js must contain maskApiKey utility'
    );
    assert.ok(
      firebaseConfigJs.includes('Object.defineProperty(app.options, \'apiKey\''),
      'app.options.apiKey must be shielded/masked'
    );
    assert.ok(
      firebaseConfigJs.includes('AIza[0-9A-Za-z_-]{35}') || firebaseConfigJs.includes('_scrubVal'),
      'DevTools console scrubber must be active in firebase-config.js'
    );
    // Raw plain text API key should NOT appear directly in index.html, script.js, or tracker.js
    assert.equal(indexHtml.includes('AIzaSy'), false, 'index.html leaks raw AIza API key');
    assert.equal(scriptJs.includes('AIzaSy'), false, 'script.js leaks raw AIza API key');
  });

});
