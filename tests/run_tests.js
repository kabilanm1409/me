#!/usr/bin/env node
/**
 * tests/run_tests.js
 * Master CLI test runner for the Portfolio Modernization Project.
 * Adheres to the 4-Tier Automated Testing Methodology.
 * Zero external npm dependencies required.
 *
 * Usage:
 *   node tests/run_tests.js                     # Run entire test suite
 *   node tests/run_tests.js --baseline          # Run in baseline mode (exit 0, records M0 status)
 *   node tests/run_tests.js --tier=1            # Run only Tier 1 Feature Coverage
 *   node tests/run_tests.js --tier=2            # Run only Tier 2 Boundary Cases
 *   node tests/run_tests.js --tier=3            # Run only Tier 3 Cross-Feature
 *   node tests/run_tests.js --tier=4            # Run only Tier 4 Real-World Workloads
 *   node tests/run_tests.js --static            # Run only Static Syntax & Asset Audits
 *   node tests/run_tests.js --milestone=M1      # Run tests for Milestone M1
 *   node tests/run_tests.js --milestone=M2      # Run tests for Milestone M2
 *   node tests/run_tests.js --milestone=M3      # Run tests for Milestone M3
 *   node tests/run_tests.js --json              # Output machine-readable JSON
 */

const { framework } = require('./helpers/test_framework');

// ── Parse Command Line Arguments ───────────────────────────────────────
const args = process.argv.slice(2);
const options = {
  tier: null,
  milestone: null,
  feature: null,
  baseline: false,
  json: false,
};

for (const arg of args) {
  if (arg === '--help' || arg === '-h') {
    console.log(`
Portfolio Automated Test Runner
Usage: node tests/run_tests.js [options]

Options:
  --tier=<static|tier1|tier2|tier3|tier4>   Filter execution by specific tier
  --static                                  Shorthand for --tier=static
  --milestone=<M1|M2|M3>                    Filter execution by target milestone
  --feature=<F1..F15>                       Filter execution by feature ID
  --baseline                                Run in M0 baseline mode (reports baseline status)
  --json                                    Output raw JSON results
  --help, -h                                Show this help message
`);
    process.exit(0);
  } else if (arg === '--baseline') {
    options.baseline = true;
  } else if (arg === '--json') {
    options.json = true;
  } else if (arg === '--static') {
    options.tier = 'static';
  } else if (arg.startsWith('--tier=')) {
    const rawTier = arg.split('=')[1].toLowerCase();
    if (rawTier === '1') options.tier = 'tier1';
    else if (rawTier === '2') options.tier = 'tier2';
    else if (rawTier === '3') options.tier = 'tier3';
    else if (rawTier === '4') options.tier = 'tier4';
    else options.tier = rawTier;
  } else if (arg.startsWith('--milestone=')) {
    options.milestone = arg.split('=')[1].toUpperCase();
  } else if (arg.startsWith('--feature=')) {
    options.feature = arg.split('=')[1].toUpperCase();
  }
}

// ── Load All Test Suites ───────────────────────────────────────────────
require('./static_integrity.test');
require('./tier1_features.test');
require('./tier2_boundaries.test');
require('./tier3_combinations.test');
require('./tier4_scenarios.test');
require('./terminal_and_security_features.test');

// ── Run Test Suite ─────────────────────────────────────────────────────
(async () => {
  try {
    const summary = await framework.run(options);
    framework.printReport(summary, options.json);

    if (options.baseline) {
      // In baseline mode, exit cleanly after recording baseline results
      process.exit(0);
    } else {
      process.exit(summary.failed === 0 ? 0 : 1);
    }
  } catch (fatalErr) {
    console.error('Fatal test runner error:', fatalErr);
    process.exit(2);
  }
})();
