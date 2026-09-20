## 2026-09-17T10:13:43Z
You are test_writer_01 (teamwork_preview_test_writer).
Your working directory is: c:\Users\ELCOT\portfolio\.agents\test_writer_01
The workspace directory is: c:\Users\ELCOT\portfolio
Authoritative user request file: c:\Users\ELCOT\portfolio\ORIGINAL_REQUEST.md
Project plan file: c:\Users\ELCOT\portfolio\.agents\orchestrator_1\PROJECT.md

MANDATORY FIRST STEP:
Read c:\Users\ELCOT\portfolio\ORIGINAL_REQUEST.md and c:\Users\ELCOT\portfolio\.agents\orchestrator_1\PROJECT.md before doing anything else.

ADDITIONAL INPUT CONTEXT:
Read survey reports:
- c:\Users\ELCOT\portfolio\.agents\explorer_design_01\report.md
- c:\Users\ELCOT\portfolio\.agents\explorer_ribbon_01\report.md
- c:\Users\ELCOT\portfolio\.agents\explorer_system_01\report.md

YOUR TASK (Milestone M0: E2E Test Suite & Test Runner):
Design and build an automated test harness for the portfolio project adhering to the 4-tier methodology:
1. Write a standalone Node.js test suite in `tests/` (e.g. `tests/e2e_suite.js` or `tests/run_tests.js`) that runs with `node tests/run_tests.js` (no external npm dependencies required; use Node.js built-in fs, path, assert, child_process, or node:test).
2. Test coverage must include:
   - Static integrity: `node -c` syntax validation on all js files (`script.js`, `tracker.js`, `firebase-config.js`, `portfolio-cms.js`, `server.js`).
   - Certificate assets audit: all certificate files exist on disk under `assets/cerificates/*` and are non-empty.
   - Tier 1 (Feature Coverage): Tests verifying all 15 features in PROJECT.md (design tokens, cards, typography/pills, ribbon markup, lightbox markup, terminal ID, etc.).
   - Tier 2 (Boundary & Corner Cases): Tests for missing attributes, small viewport checks, long text, theme attribute presence/absence (`body[data-theme='dark']` vs light mode absence), invalid terminal commands.
   - Tier 3 (Cross-Feature Combinations): Tests checking ribbon presence under achievements, theme toggle compatibility with glassmorphism classes, lightbox dual-mode img/iframe handling.
   - Tier 4 (Real-World Workload Scenarios): Tests validating end-to-end integration scenarios (navigation flow, certificate inspection, theme persistence).
3. Execute your test suite via terminal command and verify its output format and baseline results.
4. Create `c:\Users\ELCOT\portfolio\TEST_INFRA.md` at project root documenting the test architecture and coverage matrix.
5. Create `c:\Users\ELCOT\portfolio\TEST_READY.md` at project root summarizing the test runner command, tier breakdown, and passing status.
6. Write your report and handoff to `c:\Users\ELCOT\portfolio\.agents\test_writer_01\handoff.md`.
When finished, send a message to the orchestrator with the path to TEST_READY.md and handoff.md.
