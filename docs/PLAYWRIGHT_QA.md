# Playwright QA audit — how to re-run

End-to-end Playwright suite lives under `e2e/`. Config: `playwright.config.ts`.

## Prerequisites

```bash
npm install
npx playwright install chromium firefox webkit
```

## Target URL

Defaults to the live Vercel site:

```bash
export BASE_URL=https://drone-pilot-marketpalce.vercel.app
```

Override for Preview / local:

```bash
export BASE_URL=http://localhost:3000
```

## Demo credentials

From README / `docs/DEMO_DEPLOY.md` (seeded on deploy):

| Role | Email | Password |
|------|-------|----------|
| Client | `client@dronepilot.local` | `Demo123!` |
| Pilot | `pilot@dronepilot.local` | `Demo123!` |
| Admin | `admin@dronepilot.local` | `Demo123!` |

Overrides: `E2E_CLIENT_EMAIL`, `E2E_PILOT_EMAIL`, `E2E_ADMIN_EMAIL`, `E2E_PASSWORD`.

If admin credentials are unavailable, Admin journey tests skip with a reason (they do not invent credentials).

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run test` | Full Playwright suite (headless) |
| `npm run test:headed` | Headed browsers |
| `npm run test:smoke` | `@smoke` tests only |
| `npm run test:functional` | `@functional` tests |
| `npm run test:e2e` | `@e2e` role journeys |
| `npm run test:report` | Open HTML report |
| `npm run test:unit` | Existing Node unit tests (`src/lib/**/*.test.ts`) |
| `npm run test:qa-audit-report` | Regenerate `reports/QA-AUDIT-REPORT.md` from JSON |

## Artifacts

| Path | Contents |
|------|----------|
| `reports/QA-AUDIT-REPORT.md` | Human QA audit summary (committed) |
| `reports/playwright-report.json` | Machine-readable results (committed) |
| `reports/html/` | Playwright HTML report (**local only** — regenerate after a run; excluded from Vercel deploy) |
| `test-results/` | Screenshots, videos, traces on failure (gitignored) |

Regenerate the HTML report after any run:

```bash
npm run test
npm run test:report   # opens reports/html
```

`e2e/`, `playwright.config.ts`, and `reports/html` are listed in `.vercelignore` so Preview/Production installs stay lean and do not ship QA tooling.

## Safety

- No real payment credentials or Stripe charges.
- Prefer demo accounts; do not delete production users.
- Registration is closed on the live site — do not force signup flows.
