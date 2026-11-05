# BUG_REPORT.md — E2E Automation Findings

**Run date:** 2026-11-02 (Asia/Karachi)  
**Environment:** Local `http://127.0.0.1:3000` (SQLite QA DB for runtime; app source not modified in git)  
**Suite:** `e2e/` Playwright  
**Chromium:** 38/38 passed  
**Firefox + WebKit + Mobile Chrome:** 99 passed / 15 failed (mostly WebKit timing)

---

## Application bugs

### BUG-001 — Public `/resources` returns HTTP 500

| Field | Detail |
|-------|--------|
| Bug ID | BUG-001 |
| Module | CMS / Marketing resources |
| Page URL | `http://127.0.0.1:3000/resources` |
| Test scenario | Phase 2 exploration crawler + guest public pages |
| Steps to reproduce | 1. Start local app with incomplete CMS seed 2. Open `/resources` |
| Expected result | 200 with resources list or empty state |
| Actual result | **HTTP 500**; exploration logged `failNet=1` and console errors |
| Severity | **High** (public marketing page broken locally when CMS seed fails) |
| Evidence | `e2e/artifacts/exploration/exploration-report.json`; screenshot `explore_resources.png` |
| Console/network | 500 on document navigation |
| Classification | **Application / environment seed defect** |
| Notes | `prisma/seed.ts` → `seedCmsContent()` throws on SQLite: `Unknown argument skipDuplicates`. Seed aborts after users are created; resources page then errors. Production Neon may not show this if CMS rows exist. |

### BUG-002 — Client onboarding route is a redirect-only legacy path

| Field | Detail |
|-------|--------|
| Bug ID | BUG-002 |
| Module | Client onboarding |
| Page URL | `/dashboard/client/onboarding` |
| Test scenario | C-03 onboarding |
| Steps | Navigate to `/dashboard/client/onboarding` |
| Expected (docs/older UX) | Dedicated multi-step onboarding wizard |
| Actual | Server `redirect("/dashboard/client/profile")` — profile completion UI |
| Severity | **Low** (intentional code path; documentation/sitemap drift) |
| Classification | **Product behavior / docs mismatch** (not a crash) |
| Notes | Tests updated to use profile completion (`Save Profile`). Track as docs debt, not a defect unless product still expects `/onboarding` wizard. |

---

## Test script / automation issues (not app bugs)

### TS-001 — WebKit login / navigation timeouts under parallel load

| Field | Detail |
|-------|--------|
| ID | TS-001 |
| Module | Auth / Pilot / Client (WebKit project) |
| Scenario | Several WebKit specs failed waiting for `/dashboard/*` after login |
| Actual | `page.waitForURL` timeout 45s |
| Severity | Medium (CI flake risk) |
| Classification | **Test script / browser flake** |
| Mitigation | Retry already enabled; consider serial auth setup + storageState; lower WebKit workers |

### TS-002 — Firefox intermittent Save Profile / job wizard readiness

| Field | Detail |
|-------|--------|
| ID | TS-002 |
| Module | Client journey (Firefox) |
| Scenario | C-03 / C-10 / C-20 |
| Classification | **Test flake** |
| Mitigation | Explicit wait for `#contactName` enabled + network idle after save |

---

## Environment / configuration issues

### ENV-001 — Local Postgres incompatible with Neon Prisma adapter

| Field | Detail |
|-------|--------|
| ID | ENV-001 |
| Issue | `createPrismaClient()` uses `@prisma/adapter-neon` for all non-SQLite URLs; local PostgreSQL connection fails with `ErrorEvent` |
| Impact | Cannot use local Postgres without app adapter changes |
| Classification | **Environment / architecture** |
| Workaround used | Temporary SQLite provider for QA runtime only (not committed) |

### ENV-002 — CMS seed `skipDuplicates` unsupported on SQLite

| Field | Detail |
|-------|--------|
| ID | ENV-002 |
| Issue | Seed fails at CMS article insert on SQLite |
| Linked | BUG-001 |
| Classification | **Environment + application seed code** |

---

## Not bugs / out of scope

| Item | Reason |
|------|--------|
| Stripe card checkout | Stubbed / demo only |
| Approving production users | Forbidden; admin write tests used local seed only |
| Real SMTP verification | `@example.test` auto-verifies |
| Full proposal→booking spine deep asserts | Soft-covered; wizard multi-step continues as follow-up |

---

## Severity summary

| Severity | App bugs | Test/env issues |
|----------|----------|-----------------|
| Critical | 0 | 0 |
| High | 1 (BUG-001) | 0 |
| Medium | 0 | 2 (TS-001, ENV-001) |
| Low | 1 (BUG-002) | 2 |

---

*No application source was changed to hide failures.*
