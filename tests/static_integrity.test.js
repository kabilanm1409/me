/**
 * tests/static_integrity.test.js
 * Static syntax verification via `node -c` and Certificate Assets physical audit.
 * Authoritative sources: ORIGINAL_REQUEST.md R3/AC, PROJECT.md F4/F15, explorer_system_01/report.md §5, §8.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { describe, test, assert } = require('./helpers/test_framework');
const { ROOT_DIR, CERTIFICATE_FILES, JAVASCRIPT_FILES } = require('./helpers/test_fixtures');

describe('Static Integrity & Assets Audit', () => {

  JAVASCRIPT_FILES.forEach(file => {
    test(`Syntax validation: node -c ${file}`, () => {
      const fullPath = path.join(ROOT_DIR, file);
      assert.ok(fs.existsSync(fullPath), `JavaScript target file does not exist: ${file}`);
      
      try {
        execFileSync(process.execPath, ['-c', fullPath], {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      } catch (err) {
        assert.fail(`Syntax error detected in ${file}:\n${err.stderr || err.message}`);
      }
    }, { tier: 'static', featureId: 'F15', milestone: 'M3', description: `Parse syntax of ${file} with zero syntax errors` });
  });

  CERTIFICATE_FILES.forEach(cert => {
    test(`Certificate Asset Audit: ${cert.id} (${cert.award})`, () => {
      const fullPath = path.join(ROOT_DIR, cert.relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Certificate file missing on disk: ${cert.relPath} (expected for ${cert.title})`
      );

      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `Certificate file is 0 bytes: ${cert.relPath}`);
      assert.ok(
        stat.size >= cert.minSizeBytes,
        `Certificate file ${cert.relPath} is unexpectedly small: ${stat.size} bytes < minimum ${cert.minSizeBytes} bytes`
      );
    }, { tier: 'static', featureId: 'F4', milestone: 'M2', description: `Audit physical asset presence & size for ${cert.title}` });
  });

  test('Certificate Directory Spelling: assets/cerificates/ (strictly preserved)', () => {
    const certDirPath = path.join(ROOT_DIR, 'assets', 'cerificates');
    assert.ok(
      fs.existsSync(certDirPath),
      'Directory assets/cerificates does not exist. Do not rename or alter spelling!'
    );

    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const hasCorruptSpelling = /assets\/certificates\//i.test(indexHtml);
    assert.equal(
      hasCorruptSpelling,
      false,
      'index.html contains typo "assets/certificates/" with extra "t". Must use "assets/cerificates/".'
    );
  }, { tier: 'static', featureId: 'F4', milestone: 'M2', description: 'Ensure no broken links from folder renaming' });

});
