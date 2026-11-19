# QA_TEST_PLAN.md — Drone Pilot Marketplace E2E Automation

**Application:** Remote Air Service / Drone Pilot Marketplace  
**Live reference:** https://drone-pilot-marketpalce.vercel.app/  
**Automation base URL (local):** `http://127.0.0.1:3000`  
**App version:** `0.27.110`  
**Plan date:** 2026-11-02 (Asia/Karachi)  
**Source of truth:** Code under `/workspace` (`src/app`, `src/lib`, `prisma/schema.prisma`) — not page-name assumptions.

**Constraints**

- Automation lives under `e2e/` (separate from application source).
- Do not modify application source to hide failures.
- Client/Pilot: register fresh `@example.test` users (auto-verify).
- Admin/Moderator: seeded local accounts only (`admin@dronepilot.local` / `Demo123!`) — staff cannot self-register.
- Stripe / real payments / real SMTP: out of scope / stubbed — use demo/internal paths only.
- Destructive admin actions only against local seeded/test data, never production users.

---

## 1. Application understanding (verified)

### 1.1 Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 App Router, React 19, Tailwind 4 |
| Auth | Auth.js (NextAuth v5) Credentials + JWT (30d) |
| Backend | Next.js Route Handlers (`src/app/api/**`) |
| DB | Prisma 7 + PostgreSQL (local QA DB / Neon prod) |
| Uploads | Vercel Blob or local `/public` + `storage/` |
| E2E | Playwright (TypeScript) under `e2e/` |

### 1.2 Roles

| Role | Registerable? | Dashboard |
|------|---------------|-----------|
| Guest | — | Public marketing |
| Client | Yes | `/dashboard/client` |
| Pilot | Yes | `/dashboard/pilot` |
| Moderator | No (staff) | `/dashboard/admin` (ACL) |
| Admin | No | `/dashboard/admin` |
| Super Admin | No | `/dashboard/admin` (+ `/permissions`) |

### 1.3 Primary routes (canonical)

**Public:** `/`, `/for-clients`, `/for-pilots`, `/pricing`, `/how-it-works`, `/about`, `/contact`, `/jobs`, `/jobs/[id]`, `/pilots`, `/pilots/[id]`, `/resources`, `/resources/[slug]`, `/reputation`, `/safety`, `/captains-club`, `/privacy`, `/terms`, `/cookies`, `/launch`

**Auth:** `/login`, `/register`, `/verify-email`, `/waitlist`

**Client:** `/dashboard/client`, `/onboarding`, `/profile`, `/settings`, `/jobs`, `/jobs/new`, `/jobs/[id]`, `/jobs/[id]/offers`, `/quotes`, `/find-pilots`, `/find-pilots/[id]`, `/bookings`, `/bookings/[id]`, `/messages`, `/messages/[id]`, `/payments`, `/reviews`, `/disputes`, `/disputes/[id]`

**Pilot:** `/dashboard/pilot`, `/onboarding`, `/profile`, `/portfolio`, `/jobs`, `/jobs/[id]`, `/jobs/[id]/proposal`, `/locked-jobs`, `/applications`, `/proposals`, `/bookings`, `/contracts`, `/messages`, `/payments`, `/reviews`, `/disputes`, `/subscription`, `/achievements`, `/certificates`, `/verifications`, `/verifications/request-wings`, `/instructor`, `/students`, `/shop`, `/shop/orders`, `/support`, `/settings`

**Admin:** `/dashboard/admin` and modules: users, pilots, clients, jobs, applications, bookings, verifications, messages, support, disputes, squadron-voting, payments, subscriptions, certificates, achievements, shop, cms, reviews, waitlist, regions, reports, permissions, settings

### 1.4 Core marketplace flow (exists in code)

```
Client onboarding → post job → submit → admin approve
→ grade-based visibility → pilot proposal (A-2+)
→ client review / start chat → revise (+20% cap)
→ accept → booking → delivery → approve
→ internal payment + 15% commission → reviews
```

### 1.5 Key validation rules (from `src/lib`)

| Area | Rules |
|------|-------|
| Register | Email format; password ≥10 + upper/lower/digit/special; role client\|pilot |
| Client onboarding | contactName ≥2; optional phone `^[\d\s+().-]{7,20}$` |
| Job | title ≥5; description ≥20; category allowlist; location required; budget min≤max |
| Proposal | amount >0; breakdown; message 10–1000; deliverables; operational/compliance; accuracyConfirmed; revise ≤+20% |
| Verification upload | ≤5MB; pdf/jpeg/png/webp; types license\|insurance\|identity\|other |
| Membership | $99.99/yr + Fast Forward; A-1 cannot bid; visibility delays 48→0h |

### 1.6 Explicit non-features / stubs

- No Stripe card capture (demo pay / internal ledger).
- No client-initiated “hire invitation” separate from marketplace accept flow — client starts **messages** after proposals; hire CTAs route to find-pilots / register.
- Staff cannot public-register.
- Squadron Vote: admin tooling present; treat as limited coverage.

---

## 2. Test strategy

| Layer | Tooling | Location |
|-------|---------|----------|
| Exploration | Playwright headed crawler | `e2e/exploration/` |
| E2E journeys | Playwright TS + POM | `e2e/tests/` |
| API checks | Playwright `request` fixture | `e2e/tests/api/` |
| Unit (existing app) | `npm run test:all` | untouched |

**Browsers:** Chromium, Firefox, WebKit  
**Viewports:** Desktop 1440×900 + Mobile Pixel 5  
**Artifacts:** screenshots on fail, video on fail, traces on retry, HTML report under `e2e/playwright-report/`

---

## 3. Module test catalog

### M01 — Guest / marketing

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| G-01 | Homepage loads without console errors | Smoke | P0 |
| G-02 | Nav opens for-clients, for-pilots, pricing, how-it-works, about, contact | Functional | P0 |
| G-03 | Public pilots list + open profile | Functional | P0 |
| G-04 | Public jobs list (+ detail if seeded) | Functional | P1 |
| G-05 | Hire CTA guest → register | Functional | P0 |
| G-06 | Login/Register links reachable | Smoke | P0 |
| G-07 | Legal pages privacy/terms/cookies | Smoke | P2 |
| G-08 | Contact form empty/invalid/valid (no real email req for `.test`) | Negative+Pos | P1 |
| G-09 | Broken link / 404 detection on public nav | Regression | P1 |

### M02 — Auth

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| A-01 | Register client happy path | E2E | P0 |
| A-02 | Register pilot happy path | E2E | P0 |
| A-03 | Empty register submit | Negative | P0 |
| A-04 | Invalid email | Negative | P0 |
| A-05 | Weak password variants | Negative | P0 |
| A-06 | Password mismatch confirm | Negative | P0 |
| A-07 | Duplicate email | Negative | P0 |
| A-08 | Login success after register | E2E | P0 |
| A-09 | Invalid credentials | Negative | P0 |
| A-10 | Guest cannot open `/dashboard/client` (redirect login) | AuthZ | P0 |
| A-11 | Client cannot open `/dashboard/pilot` | AuthZ | P0 |
| A-12 | Client cannot open `/dashboard/admin` | AuthZ | P0 |
| A-13 | Logout returns to public/login | E2E | P0 |

### M03 — Client onboarding & profile

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| C-01 | New client redirected to onboarding | E2E | P0 |
| C-02 | Empty onboarding blocked | Negative | P0 |
| C-03 | Complete onboarding with valid contactName | E2E | P0 |
| C-04 | Invalid phone rejected | Negative | P1 |
| C-05 | Profile edit mode / save | Functional | P1 |
| C-06 | Settings + logout | Functional | P1 |

### M04 — Client jobs (missions)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| C-10 | Create job draft via `/jobs/new` multi-step | E2E | P0 |
| C-11 | Empty/invalid job fields | Negative | P0 |
| C-12 | Edit draft job | E2E | P0 |
| C-13 | Submit job → pending_approval | E2E | P0 |
| C-14 | View job detail | Functional | P0 |
| C-15 | Cannot edit after approved (expect deny) | Negative | P1 |

### M05 — Client find pilots / offers / messaging

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| C-20 | Find pilots page + filters/search | Functional | P0 |
| C-21 | Open pilot profile in dashboard | Functional | P0 |
| C-22 | Review offers on job | E2E | P0 |
| C-23 | Accept proposal → booking | E2E | P0 |
| C-24 | Reject / shortlist where UI exists | Functional | P1 |
| C-25 | Client initiates conversation | E2E | P1 |
| C-26 | Notifications list reachable | Smoke | P2 |

### M06 — Client bookings / disputes / reviews

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| C-30 | Booking list + detail | E2E | P0 |
| C-31 | Confirm booking status transition | E2E | P0 |
| C-32 | Delivery review approve/revision | E2E | P1 |
| C-33 | Payments ledger page | Smoke | P1 |
| C-34 | Reviews after complete | E2E | P1 |
| C-35 | Open dispute (non-destructive local) | Functional | P2 |

### M07 — Pilot onboarding / profile / verification

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| P-01 | Register + onboarding gate | E2E | P0 |
| P-02 | Complete pilot onboarding (name, location, services, acknowledgments) | E2E | P0 |
| P-03 | Upload verification doc valid PDF/PNG | E2E | P0 |
| P-04 | Reject oversize / bad MIME | Negative | P0 |
| P-05 | Portfolio add (if unlocked) | Functional | P1 |
| P-06 | Subscription page + plans visible | Functional | P0 |
| P-07 | A-1 cannot submit proposal (after enroll) | AuthZ | P0 |

### M08 — Pilot jobs / proposals

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| P-10 | Jobs list / locked-jobs | Functional | P0 |
| P-11 | Open job detail when visible | E2E | P0 |
| P-12 | Submit valid proposal (A-2+ seeded or upgraded) | E2E | P0 |
| P-13 | Invalid proposal fields | Negative | P0 |
| P-14 | Withdraw / revise ≤20% | E2E | P1 |
| P-15 | Applications list | Functional | P0 |

### M09 — Pilot bookings / shop / support

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| P-20 | Booking detail start work | E2E | P1 |
| P-21 | Delivery upload submit | E2E | P1 |
| P-22 | Shop catalog page | Smoke | P2 |
| P-23 | Support chat open | Functional | P2 |
| P-24 | Settings + logout | Functional | P1 |

### M10 — Admin (local seed only)

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| AD-01 | Login super admin | E2E | P0 |
| AD-02 | Dashboard stats load | Smoke | P0 |
| AD-03 | Users / pilots / clients lists | Functional | P0 |
| AD-04 | Approve pending job (test-created) | E2E | P0 |
| AD-05 | Reject job with reason (test-created) | E2E | P1 |
| AD-06 | Verifications queue + approve test doc | E2E | P0 |
| AD-07 | Applications / bookings views | Smoke | P1 |
| AD-08 | Permissions page (super admin only) | AuthZ | P1 |
| AD-09 | Moderator denied permissions path | AuthZ | P1 |
| AD-10 | Messages read-only (no staff composer) | Functional | P1 |
| AD-11 | Support inbox reachable | Smoke | P2 |
| AD-12 | Logout | Functional | P0 |

### M11 — Cross-cutting negative / security

| ID | Scenario | Type | Priority |
|----|----------|------|----------|
| N-01 | Direct URL to foreign booking → 403/redirect | AuthZ | P0 |
| N-02 | API without session → 401 | API | P0 |
| N-03 | Client POST `/api/pilot/applications` → 403 | API | P0 |
| N-04 | Empty search results UX | Functional | P2 |
| N-05 | Waitlist without Turnstile (expect fail if enabled) | Negative | P2 |

---

## 4. End-to-end journey scripts (Phase 3 mapping)

| Journey | Steps covered by tests |
|---------|------------------------|
| Guest | G-01…G-09 |
| Client | A-01, A-08, C-01…C-35, A-13 |
| Pilot | A-02, P-01…P-24 |
| Admin | AD-01…AD-12 |
| Marketplace spine | C-10→AD-04→P-12→C-23→C-31→P-21→C-32→C-34 |

---

## 5. Exploration checklist (Phase 2)

For every reachable page under guest + each role session:

1. Screenshot → `e2e/artifacts/exploration/`
2. Inventory buttons, links, inputs, selects, tabs
3. Click safe navigational controls
4. Capture console errors + failed network (≥400)
5. Record broken links / unexpected 404/500
6. Skip irreversible deletes, production payouts, real email blasts

Explorer script: `e2e/exploration/explore.ts`

---

## 6. Test data

| Kind | Source |
|------|--------|
| Client/Pilot emails | `qa.{role}.{timestamp}@example.test` |
| Passwords | Generated strong secrets in runtime / `e2e/.env` |
| Admin | `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` (local seed defaults documented in `e2e/.env.example` only) |
| Upload fixtures | `e2e/fixtures/files/` (small pdf/png + invalid exe/oversize) |
| Cleanup | Prefer isolating by unique emails; delete only test-owned rows via admin APIs when safe |

---

## 7. Environments

| Env | URL | Use |
|-----|-----|-----|
| Local QA | `http://127.0.0.1:3000` | Full E2E including admin write |
| Production | vercel.app | Guest smoke only — no approve/reject real users |

Default Playwright `baseURL` = local.

---

## 8. Exit criteria

- POM framework committed under `e2e/`
- Exploration inventory + screenshots produced
- P0 scenarios automated and executed
- HTML report generated
- `BUG_REPORT.md` + `QA_SUMMARY.md` published
- Failed tests classified (app vs script vs env)

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Onboarding / job wizard selectors drift | Prefer roles/labels/`#id` from source components |
| Membership gates block pilot bid | Enroll/upgrade via UI or seed A-2+ for spine test |
| Email verification | Use `@example.test` auto-verify |
| Flaky network on Vercel | Prefer local baseURL |

---

*Phase 1 complete — proceed to local app bring-up + `e2e/` framework scaffolding.*
