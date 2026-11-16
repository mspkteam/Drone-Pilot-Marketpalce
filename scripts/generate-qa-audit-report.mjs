#!/usr/bin/env node
/**
 * Builds reports/QA-AUDIT-REPORT.md from Playwright JSON output.
 * Never fabricates results — requires reports/playwright-report.json from a real run.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, "reports/playwright-report.json");
const OUT_PATH = path.join(ROOT, "reports/QA-AUDIT-REPORT.md");

if (!fs.existsSync(JSON_PATH)) {
  console.error(`Missing ${JSON_PATH}. Run Playwright first.`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

function walkSuites(suites, acc = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          acc.push({
            title: spec.title,
            fullTitle: [...(suite.title ? [suite.title] : []), spec.title].join(
              " › ",
            ),
            file: spec.file || suite.file,
            project: test.projectName,
            status: result.status,
            duration: result.duration,
            error: result.error?.message || result.errors?.[0]?.message,
            tags: spec.tags ?? [],
          });
        }
      }
    }
    if (suite.suites?.length) walkSuites(suite.suites, acc);
  }
  return acc;
}

const tests = walkSuites(report.suites ?? []);
const total = tests.length;
const passed = tests.filter((t) => t.status === "passed").length;
const failed = tests.filter((t) => t.status === "failed" || t.status === "timedOut").length;
const skipped = tests.filter(
  (t) => t.status === "skipped" || t.status === "interrupted",
).length;
const flaky = tests.filter((t) => t.status === "flaky").length;
const passPct = total ? ((passed / total) * 100).toFixed(1) : "0.0";

const byFile = new Map();
for (const t of tests) {
  const key = t.file || "unknown";
  if (!byFile.has(key)) byFile.set(key, { passed: 0, failed: 0, skipped: 0, total: 0 });
  const row = byFile.get(key);
  row.total += 1;
  if (t.status === "passed") row.passed += 1;
  else if (t.status === "skipped" || t.status === "interrupted") row.skipped += 1;
  else row.failed += 1;
}

const failures = tests.filter(
  (t) => t.status === "failed" || t.status === "timedOut",
);

/** Heuristic severity from failure text / area */
function severityFor(t) {
  const msg = `${t.fullTitle} ${t.error || ""}`.toLowerCase();
  if (/login|auth|500|crash|application error|middleware/i.test(msg)) {
    return "CRITICAL";
  }
  if (/dashboard|redirect|payment|booking|proposal|admin/i.test(msg)) {
    return "HIGH";
  }
  if (/overflow|console|responsive|search|filter/i.test(msg)) {
    return "MEDIUM";
  }
  return "LOW";
}

const bugs = failures.map((t, i) => ({
  id: `BUG-${String(i + 1).padStart(3, "0")}`,
  severity: severityFor(t),
  title: t.fullTitle,
  project: t.project,
  error: (t.error || "Unknown failure").slice(0, 1200),
  file: t.file,
}));

const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
bugs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

const baseURL =
  report.config?.metadata?.baseURL ||
  process.env.BASE_URL ||
  "https://drone-pilot-marketpalce.vercel.app";

const started = report.stats?.startTime
  ? new Date(report.stats.startTime).toISOString()
  : "unknown";
const durationSec = report.stats?.duration
  ? (report.stats.duration / 1000).toFixed(1)
  : "unknown";

const md = `# QA Audit Report — Drone Pilot Marketplace

Generated from a **real Playwright run** (\`reports/playwright-report.json\`).  
Do not treat this document as authoritative if the JSON artifact is missing or older than the run claimed below.

| Field | Value |
|------|-------|
| Target | \`${baseURL}\` |
| Run start | ${started} |
| Duration (s) | ${durationSec} |
| Browsers / projects | chromium, firefox, webkit, mobile-chrome, mobile-safari |
| Framework | Playwright + POM (\`e2e/\`) |

## Overview

| Metric | Count |
|--------|------:|
| Total results | ${total} |
| Passed | ${passed} |
| Failed / timed out | ${failed} |
| Skipped | ${skipped} |
| Flaky (if reported) | ${flaky} |
| Pass % | **${passPct}%** |

## Modules covered

| Module / area | Spec location | Notes |
|---------------|---------------|-------|
| Homepage | \`e2e/tests/smoke/homepage.spec.ts\` | Hero, nav, console/network soft checks |
| Marketing / public routes | \`e2e/tests/smoke/marketing-pages.spec.ts\` | All discovered public paths |
| Auth | \`e2e/tests/smoke/auth.spec.ts\` | Login, invalid creds, role redirects |
| Marketplace browse/search | \`e2e/tests/functional/marketplace.spec.ts\` | Pilots + jobs |
| Profiles / onboarding | \`e2e/tests/functional/profiles-onboarding.spec.ts\` | Client + pilot |
| Jobs / proposals | \`e2e/tests/functional/jobs-proposals.spec.ts\` | Includes A-1 restriction smoke |
| Messaging | \`e2e/tests/functional/messaging-notifications.spec.ts\` | Client/pilot/admin inboxes |
| Bookings / payments (demo) | \`e2e/tests/functional/bookings-payments.spec.ts\` | **No real payments** |
| Dashboards | \`e2e/tests/functional/dashboards.spec.ts\` | Route sweep |
| Admin | \`e2e/tests/functional/admin.spec.ts\` | Skips if no credentials |
| Client / Pilot / Admin E2E | \`e2e/tests/e2e/*.spec.ts\` | Role journeys |
| Responsive | \`e2e/tests/responsive/viewports.spec.ts\` | 1920, 1366, 768, 390, 375 |

## Results by spec file

| File | Total | Passed | Failed | Skipped |
|------|------:|-------:|-------:|--------:|
${[...byFile.entries()]
  .map(
    ([file, row]) =>
      `| \`${file}\` | ${row.total} | ${row.passed} | ${row.failed} | ${row.skipped} |`,
  )
  .join("\n")}

## Bugs by severity

${
  bugs.length === 0
    ? "_No failing tests in this run — no automation-detected bugs to classify._"
    : bugs
        .map(
          (b) => `### ${b.id} — ${b.severity}

- **Title:** ${b.title}
- **Project:** ${b.project}
- **Spec:** \`${b.file}\`
- **Repro:** Run \`npx playwright test ${b.file || ""} --project=${b.project || "chromium"}\` against \`${baseURL}\` with demo credentials from README.
- **Evidence:** See \`test-results/\` screenshots/videos/traces for this failure and HTML report \`reports/html/index.html\`.
- **Error:**
\`\`\`
${b.error}
\`\`\`
`,
        )
        .join("\n")
}

### Severity counts

| Severity | Count |
|----------|------:|
| CRITICAL | ${bugs.filter((b) => b.severity === "CRITICAL").length} |
| HIGH | ${bugs.filter((b) => b.severity === "HIGH").length} |
| MEDIUM | ${bugs.filter((b) => b.severity === "MEDIUM").length} |
| LOW | ${bugs.filter((b) => b.severity === "LOW").length} |

## UI / API / Console / Responsive / Browser

- **UI:** Module + journey tests assert headings, navigation, and crash-free renders.
- **API:** Observed via page network monitors (same-origin 5xx flagged in homepage smoke). No destructive write APIs exercised beyond normal UI navigation.
- **Console:** Homepage smoke collects console errors; fatal \`pageerror\` fails the test. Third-party noise filtered when possible.
- **Responsive:** Dedicated viewport matrix on key marketing/auth pages; horizontal overflow threshold &lt; 40px.
- **Browsers:** Chromium, Firefox, WebKit + Pixel 7 + iPhone 13 device projects.

## Intentionally untested / skipped

- **Real Stripe / escrow charges** — product constraint; demo payment UI only.
- **SMTP / real email delivery** — demo logs only on deploy.
- **Registration signup mutations** — public registration is closed (\`REGISTRATION_ENABLED=false\`); register page reachability is tested only.
- **Creating live jobs/proposals that alter shared demo state beyond safe UI fills** — journeys open wizards but avoid incomplete multi-step submits that could spam production demo data.
- **Admin journey** — skipped only when admin credentials are unavailable (demo seed email is used when present in docs).

## Recommendations

1. Wire \`npm run test:smoke\` into PR CI against Preview URLs.
2. Add API-level contract tests for booking/payment state machines before Stripe launch.
3. Persist Playwright traces for failed CI jobs (7-day retention).
4. Isolate ephemeral QA users (\`npm run qa:users\`) for write-path E2E instead of shared demo emails when registration reopens.
5. Track horizontal overflow failures per viewport as UI bugs, not flakes — fix CSS once.

## How to re-run

See \`docs/PLAYWRIGHT_QA.md\`. Quick start:

\`\`\`bash
export BASE_URL=https://drone-pilot-marketpalce.vercel.app
npm run test:smoke
npm run test
npm run test:report
node scripts/generate-qa-audit-report.mjs
\`\`\`

---
*Report generated at ${new Date().toISOString()}*
`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, md);
console.log(`Wrote ${OUT_PATH}`);
console.log(
  `Summary: total=${total} passed=${passed} failed=${failed} skipped=${skipped} pass%=${passPct}`,
);
