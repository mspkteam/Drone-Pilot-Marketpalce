# E2E Automation (Playwright)

Isolated from application source. Does **not** modify `src/`.

## Prerequisites

1. App running locally: `npm run dev -- --hostname 127.0.0.1 --port 3000`
2. Local DB seeded (see project `docs/LOCAL_DEV.md`)
3. Copy `e2e/.env.example` → `e2e/.env`

## Commands

```bash
# Exploration (Phase 2)
HEADED=1 npx tsx e2e/exploration/explore.ts

# Full suite (all projects)
npx playwright test --config=e2e/playwright.config.ts

# Chromium only (faster)
npx playwright test --config=e2e/playwright.config.ts --project=chromium

# HTML report
npx playwright show-report e2e/playwright-report
```

## Layout

- `pages/` — Page Object Model
- `helpers/` — env, users, monitors
- `tests/` — specs by role/journey
- `fixtures/files/` — upload samples
- `exploration/` — interactive crawler
- `artifacts/` — screenshots / JSON results
