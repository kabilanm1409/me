/**
 * tests/helpers/test_framework.js
 * Zero-dependency automated test harness for the portfolio modernization project.
 * Uses Node.js built-in assert/strict.
 */

const assert = require('node:assert/strict');

class TestFramework {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = [];
    this.startTime = 0;
    this.endTime = 0;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  test(name, fn, meta = {}) {
    const testCase = {
      name,
      fn,
      tier: meta.tier || 'tier1',
      featureId: meta.featureId || null,
      milestone: meta.milestone || 'M0',
      description: meta.description || '',
    };
    if (this.currentSuite) {
      this.currentSuite.tests.push(testCase);
    } else {
      if (!this.defaultSuite) {
        this.defaultSuite = { name: 'Default Suite', tests: [] };
        this.suites.push(this.defaultSuite);
      }
      this.defaultSuite.tests.push(testCase);
    }
  }

  async run(options = {}) {
    const filterTier = options.tier || null;
    const filterMilestone = options.milestone || null;
    const filterFeature = options.feature || null;
    const isBaseline = Boolean(options.baseline);

    this.results = [];
    this.startTime = Date.now();

    for (const suite of this.suites) {
      for (const t of suite.tests) {
        if (filterTier && t.tier.toLowerCase() !== filterTier.toLowerCase()) {
          continue;
        }
        if (filterMilestone && t.milestone.toLowerCase() !== filterMilestone.toLowerCase()) {
          continue;
        }
        if (filterFeature && t.featureId && t.featureId.toLowerCase() !== filterFeature.toLowerCase()) {
          continue;
        }

        const start = Date.now();
        const testResult = {
          suite: suite.name,
          name: t.name,
          tier: t.tier,
          featureId: t.featureId,
          milestone: t.milestone,
          description: t.description,
          durationMs: 0,
          status: 'PENDING',
          error: null,
        };

        try {
          const res = t.fn();
          if (res && typeof res.then === 'function') {
            await res;
          }
          testResult.status = 'PASS';
        } catch (err) {
          testResult.status = 'FAIL';
          testResult.error = err;
        }
        testResult.durationMs = Date.now() - start;
        this.results.push(testResult);
      }
    }

    this.endTime = Date.now();
    return this.getSummary(isBaseline);
  }

  getSummary(isBaseline = false) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const durationMs = this.endTime - this.startTime;

    const tierBreakdown = {};
    for (const r of this.results) {
      if (!tierBreakdown[r.tier]) {
        tierBreakdown[r.tier] = { total: 0, passed: 0, failed: 0 };
      }
      tierBreakdown[r.tier].total++;
      if (r.status === 'PASS') tierBreakdown[r.tier].passed++;
      else tierBreakdown[r.tier].failed++;
    }

    const featureBreakdown = {};
    for (const r of this.results) {
      if (r.featureId) {
        if (!featureBreakdown[r.featureId]) {
          featureBreakdown[r.featureId] = { total: 0, passed: 0, failed: 0, milestone: r.milestone };
        }
        featureBreakdown[r.featureId].total++;
        if (r.status === 'PASS') featureBreakdown[r.featureId].passed++;
        else featureBreakdown[r.featureId].failed++;
      }
    }

    return {
      total,
      passed,
      failed,
      durationMs,
      tierBreakdown,
      featureBreakdown,
      results: this.results,
      isBaseline,
    };
  }

  printReport(summary, isJson = false) {
    if (isJson) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    const c = {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
    };

    console.log(`\n${c.bold}${c.cyan}======================================================================${c.reset}`);
    console.log(`${c.bold}${c.cyan} PORTFOLIO AUTOMATED 4-TIER TEST SUITE RUNNER${c.reset}`);
    console.log(`${c.bold}${c.cyan}======================================================================${c.reset}`);

    let currentSuite = '';
    for (const r of summary.results) {
      if (r.suite !== currentSuite) {
        currentSuite = r.suite;
        console.log(`\n${c.bold}${c.yellow}► ${currentSuite}${c.reset}`);
      }

      const icon = r.status === 'PASS' ? `${c.green}✔ PASS${c.reset}` : `${c.red}✖ FAIL${c.reset}`;
      const featTag = r.featureId ? ` [${r.featureId}|${r.milestone}]` : '';
      console.log(`  ${icon} [${r.tier}] ${r.name}${featTag} ${c.gray}(${r.durationMs}ms)${c.reset}`);

      if (r.status === 'FAIL') {
        const errMsg = r.error ? (r.error.message || String(r.error)) : 'Unknown failure';
        console.log(`    ${c.red}↳ ${errMsg}${c.reset}`);
      }
    }

    console.log(`\n${c.bold}----------------------------------------------------------------------${c.reset}`);
    console.log(`${c.bold}TIER SUMMARY BREAKDOWN:${c.reset}`);
    console.log(`${c.bold}----------------------------------------------------------------------${c.reset}`);
    for (const [tier, stats] of Object.entries(summary.tierBreakdown)) {
      const pct = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
      const statusColor = stats.failed === 0 ? c.green : (stats.passed > 0 ? c.yellow : c.red);
      console.log(`  - ${tier.padEnd(12)}: ${statusColor}${stats.passed}/${stats.total} passed (${pct}%)${c.reset}`);
    }

    console.log(`\n${c.bold}----------------------------------------------------------------------${c.reset}`);
    console.log(`${c.bold}FEATURE COVERAGE INVENTORY (F1 to F15):${c.reset}`);
    console.log(`${c.bold}----------------------------------------------------------------------${c.reset}`);
    for (let i = 1; i <= 15; i++) {
      const fid = `F${i}`;
      const stats = summary.featureBreakdown[fid];
      if (stats) {
        const status = stats.failed === 0 ? `${c.green}PASS${c.reset}` : `${c.yellow}PENDING / FAIL${c.reset}`;
        console.log(`  - ${fid.padEnd(4)} (${stats.milestone.padEnd(3)}): ${stats.passed}/${stats.total} tests passed -> ${status}`);
      } else {
        console.log(`  - ${fid.padEnd(4)}: No tests registered`);
      }
    }

    console.log(`\n${c.bold}======================================================================${c.reset}`);
    const overallColor = summary.failed === 0 ? c.green : c.yellow;
    console.log(`TOTAL: ${summary.total} tests | ${c.green}${summary.passed} passed${c.reset} | ${summary.failed > 0 ? c.red : c.green}${summary.failed} failed${c.reset} | Duration: ${summary.durationMs}ms`);
    if (summary.failed > 0) {
      console.log(`${overallColor}ℹ Baseline Note: Failures in unreleased milestones (M1/M2/M3) represent pending implementation.${c.reset}`);
    }
    console.log(`${c.bold}${c.cyan}======================================================================${c.reset}\n`);
  }
}

const frameworkInstance = new TestFramework();

module.exports = {
  framework: frameworkInstance,
  describe: (name, fn) => frameworkInstance.describe(name, fn),
  test: (name, fn, meta) => frameworkInstance.test(name, fn, meta),
  it: (name, fn, meta) => frameworkInstance.test(name, fn, meta),
  assert,
};
