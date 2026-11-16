# QA Audit Report — Drone Pilot Marketplace

Generated from a **real Playwright run** (`reports/playwright-report.json`).  
Do not treat this document as authoritative if the JSON artifact is missing or older than the run claimed below.

| Field | Value |
|------|-------|
| Target | `https://drone-pilot-marketpalce.vercel.app` |
| Run start | 2026-11-16T05:01:23.868Z |
| Duration (s) | 104.4 |
| Browsers / projects | chromium, firefox, webkit, mobile-chrome, mobile-safari |
| Framework | Playwright + POM (`e2e/`) |

## Overview

| Metric | Count |
|--------|------:|
| Total results | 165 |
| Passed | 165 |
| Failed / timed out | 0 |
| Skipped | 0 |
| Flaky (if reported) | 0 |
| Pass % | **100.0%** |

## Modules covered

| Module / area | Spec location | Notes |
|---------------|---------------|-------|
| Homepage | `e2e/tests/smoke/homepage.spec.ts` | Hero, nav, console/network soft checks |
| Marketing / public routes | `e2e/tests/smoke/marketing-pages.spec.ts` | All discovered public paths |
| Auth | `e2e/tests/smoke/auth.spec.ts` | Login, invalid creds, role redirects |
| Marketplace browse/search | `e2e/tests/functional/marketplace.spec.ts` | Pilots + jobs |
| Profiles / onboarding | `e2e/tests/functional/profiles-onboarding.spec.ts` | Client + pilot |
| Jobs / proposals | `e2e/tests/functional/jobs-proposals.spec.ts` | Includes A-1 restriction smoke |
| Messaging | `e2e/tests/functional/messaging-notifications.spec.ts` | Client/pilot/admin inboxes |
| Bookings / payments (demo) | `e2e/tests/functional/bookings-payments.spec.ts` | **No real payments** |
| Dashboards | `e2e/tests/functional/dashboards.spec.ts` | Route sweep |
| Admin | `e2e/tests/functional/admin.spec.ts` | Skips if no credentials |
| Client / Pilot / Admin E2E | `e2e/tests/e2e/*.spec.ts` | Role journeys |
| Responsive | `e2e/tests/responsive/viewports.spec.ts` | 1920, 1366, 768, 390, 375 |

## Results by spec file

| File | Total | Passed | Failed | Skipped |
|------|------:|-------:|-------:|--------:|
| `e2e/admin-journey.spec.ts` | 1 | 1 | 0 | 0 |
| `e2e/client-journey.spec.ts` | 1 | 1 | 0 | 0 |
| `e2e/pilot-journey.spec.ts` | 1 | 1 | 0 | 0 |
| `functional/admin.spec.ts` | 2 | 2 | 0 | 0 |
| `functional/bookings-payments.spec.ts` | 4 | 4 | 0 | 0 |
| `functional/dashboards.spec.ts` | 2 | 2 | 0 | 0 |
| `functional/jobs-proposals.spec.ts` | 3 | 3 | 0 | 0 |
| `functional/marketplace.spec.ts` | 3 | 3 | 0 | 0 |
| `functional/messaging-notifications.spec.ts` | 3 | 3 | 0 | 0 |
| `functional/profiles-onboarding.spec.ts` | 5 | 5 | 0 | 0 |
| `responsive/viewports.spec.ts` | 5 | 5 | 0 | 0 |
| `smoke/auth.spec.ts` | 35 | 35 | 0 | 0 |
| `smoke/homepage.spec.ts` | 5 | 5 | 0 | 0 |
| `smoke/marketing-pages.spec.ts` | 95 | 95 | 0 | 0 |

## Bugs by severity

_No failing tests in the final run — no automation-detected product bugs to classify as CRITICAL/HIGH/MEDIUM/LOW failures._

### Observations (non-failing)

| ID | Severity | Note |
|----|----------|------|
| OBS-001 | LOW | Mobile homepage hides **Log in** behind the hamburger (`Open menu`). Automation opens the menu; not treated as a defect. |
| OBS-002 | LOW | `/dashboard/*/onboarding` for completed demo users redirects to profile — expected for seeded accounts. |
| OBS-003 | — | Real Stripe checkout not present on payments surfaces (demo-only) — confirmed by journey guardrail. |

### Severity counts

| Severity | Count |
|----------|------:|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 0 (observations only; see above) |

## UI / API / Console / Responsive / Browser

- **UI:** Module + journey tests assert headings, navigation, and crash-free renders.
- **API:** Observed via page network monitors (same-origin 5xx flagged in homepage smoke). No destructive write APIs exercised beyond normal UI navigation.
- **Console:** Homepage smoke collects console errors; fatal `pageerror` fails the test. Third-party noise filtered when possible.
- **Responsive:** Dedicated viewport matrix on key marketing/auth pages; horizontal overflow threshold &lt; 40px.
- **Browsers:** Chromium, Firefox, WebKit + Pixel 7 + iPhone 13 device projects.

## Intentionally untested / skipped

- **Real Stripe / escrow charges** — product constraint; demo payment UI only.
- **SMTP / real email delivery** — demo logs only on deploy.
- **Registration signup mutations** — public registration is closed (`REGISTRATION_ENABLED=false`); register page reachability is tested only.
- **Creating live jobs/proposals that alter shared demo state beyond safe UI fills** — journeys open wizards but avoid incomplete multi-step submits that could spam production demo data.
- **Admin journey** — skipped only when admin credentials are unavailable (demo seed email is used when present in docs).

## Recommendations

1. Wire `npm run test:smoke` into PR CI against Preview URLs.
2. Add API-level contract tests for booking/payment state machines before Stripe launch.
3. Persist Playwright traces for failed CI jobs (7-day retention).
4. Isolate ephemeral QA users (`npm run qa:users`) for write-path E2E instead of shared demo emails when registration reopens.
5. Track horizontal overflow failures per viewport as UI bugs, not flakes — fix CSS once.

## How to re-run

See `docs/PLAYWRIGHT_QA.md`. Quick start:

```bash
export BASE_URL=https://drone-pilot-marketpalce.vercel.app
npm run test:smoke
npm run test
npm run test:report          # regenerates local reports/html (not shipped to Vercel)
node scripts/generate-qa-audit-report.mjs
```

Note: `reports/html/` is gitignored and `.vercelignore`d — keep `QA-AUDIT-REPORT.md` + `playwright-report.json` in git; open HTML via `npm run test:report` after a local run.

---
*Report generated at 2026-11-16T05:03:23.611Z*
