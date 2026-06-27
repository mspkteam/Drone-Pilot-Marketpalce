# Functionality Wiring Plan

**Status:** UI/design phase complete (interim foundation). Next phase: wire real data, APIs, persistence, and marketplace flows.

**Last updated:** 2026-06-02 (source document alignment)

**Related:** [`BUILD_CONTROL.md`](BUILD_CONTROL.md) · [`dashboard-implementation-log.md`](dashboard-implementation-log.md) · [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md) · [`NEW_FEATURES_COMPARISON.md`](NEW_FEATURES_COMPARISON.md) · [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md)

---

## Legend

| Tag | Meaning |
|-----|---------|
| **WIRED** | Uses real API + Prisma persistence |
| **PARTIAL** | API exists but UI still uses mock/fallback, or UI calls API but fields/flow incomplete |
| **MOCK** | Static arrays, local React state only, or dedicated `*-mock.ts` file |
| **PREVIEW** | In-memory store; resets on server restart |
| **PLACEHOLDER** | Button/UI present; no backend action |
| **DEFER** | Explicitly scheduled for later phase |

---

## Phase order (agreed — updated after source PDFs)

| Phase | Focus | BUILD IDs |
|-------|--------|-----------|
| **1** | Documentation alignment + functionality audit | M295 |
| **2** | Client post project (real save) + My Projects (real data) | M51, M06 |
| **3** | Admin job approval + approved project release | M07 |
| **4** | Pilot marketplace visibility by grade | M08, M27, M303 |
| **5** | Pilot proposal submission (A-2+; A-1 blocked) | M08, M304 |
| **6** | Client bid review, shortlist, accept | M52–M55, M96 |
| **7** | Booking / contract creation + milestone fields (later) | M09, M307 |
| **8** | Escrow / payment + **15%** commission | M12, M308, M56 |
| **9** | Ratings, disputes, awards, uniform sanctions | M10, M23, M311–M314 |
| **10** | Membership billing, Fast Forward upgrades, instructor add-on | M297–M299, M316 |

**Deferred:** Stripe until Phase 8 · Commission buyout (M310) · Squadron Vote (M318) · Remote Rescue (M319) · Figma re-align pass (M320)

---

## Business rules (source PDFs — must hold during wiring)

Authoritative detail: [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md)

| Rule | Requirement | Wiring module |
|------|-------------|---------------|
| Commission | **15% default** (not tier-based); per-pilot override later | M12, M309 |
| Membership | **$99.99/year** all pilots; Fast Forward = **one-time** upgrades | M297–M299 |
| Upgrade credit | Charge difference only on later Fast Forward | M299 |
| Instructor | **$199.99/year** add-on; min A-4 | M316 |
| Lapse | Grade time stops; benefits/verification inactive | M300 |
| Reactivation | **30-day** window retains grade after cancel | M301 |
| Grade promotion | Auto A-1→A-6 by tenure (active, good standing) | M302 |
| Visibility | 48/36/24/12/6/0 hours; admin-approved jobs only | M303 |
| A-1 | Can see (after delay) but **cannot apply** | M304 |
| Proposal revision | Max **+20%** price increase | M305 |
| Chat | **Client initiates** chat with pilot only | M306 |
| Contract | Six stages + planning fields on booking | M307 |
| Escrow | Collect → hold → release minus 15% | M308 |
| Disputes | Separate from Messages & Support; block ratings until resolved | M23, M318 |
| Uniform | Policy acceptance + client review + admin sanctions | M311–M313 |
| Wings | Rule-driven + admin awarded | M314 |
| ID card | After 30 approved days; in membership | M315 |
| Captain's Club | Public A-6 list page | M317 |
| Remote Rescue | **Future only** (~2027) | M319 |

---

## Legacy phase order (UI milestone buckets)

1. **Functionality audit** (this document) ✅
2. **Core marketplace flow** (phases 2–7 above)
3. **Client modules** — Post Project polish → My Projects → Project Bids → Find Pilots → Billing later
4. **Pilot modules** — Marketplace → Proposals → Contracts → Handoff
5. **Payments & subscriptions** — no fakes; Stripe + escrow in Phase 8–10
6. **Uploads & storage** — existing patterns only
7. **Admin persistence** — CMS, config, permissions, shop, certificates/badges
8. **Final polish** — Figma re-align (M320), visual QA, SEO, E2E

---

## 2. Core marketplace flow (wire first)

End-to-end path every module below must eventually support:

```
Client posts project
  → saves to DB (Job draft)
  → client submits for approval
  → admin approves/rejects
  → approved job visible in pilot marketplace (tier delay respected)
  → pilot submits bid/proposal (JobApplication)
  → client may start chat with pilot (client initiates only)
  → proposal revision capped at +20% increase
  → booking/contract created
  → payment held in escrow (later)
  → pilot delivers work
  → client approves handoff OR dispute
  → payout calculated (gross − 15% platform commission)
  → ratings / awards (blocked if dispute open)
  → notifications at each step
```

### Current state per step

| Step | Status | Notes | BUILD IDs |
|------|--------|-------|-----------|
| Post project → DB | **PARTIAL** | Wizard calls `POST /api/client/jobs` + `POST …/submit`. Wizard metadata (quote type, priority, multi-location, reference files) folded into description text only — not first-class fields | M06, M43–M45 |
| My Projects list | **MOCK** | `ClientMyProjects` reads `my-projects-mock.ts`; `GET /api/client/jobs` exists but not integrated | M51 |
| Admin approval | **WIRED** | `GET/POST /api/admin/jobs`, approve/reject routes; queue uses Prisma; **mock rows when queue empty** | M07 |
| Pilot marketplace | **PARTIAL** | `PilotMissionMarketplace` fetches `GET /api/pilot/jobs`; falls back to `marketplace-mock.ts` when empty; filter pills are local only | M08, M80–M81 |
| Pilot bid submit | **WIRED** | `PilotBidForm` on `/dashboard/pilot/jobs/[id]` → `POST /api/pilot/applications` | M08, M83 |
| Client bid review | **MOCK** | `/dashboard/client/quotes` uses `project-bids-mock.ts`; shortlist/accept are local React state | M39, M52–M54, M96 |
| Accept → booking | **PARTIAL** | `POST /api/client/jobs/[id]/applications/[applicationId]/accept` exists; **not called from new bids UI** | M55, M98 |
| Payment / escrow | **DEFER** | No Stripe on accept; booking payment routes exist for demo flow | M12, M56, M65 |
| Handoff / delivery | **PARTIAL** | Booking status actions exist; new contracts UI not fully wired to deliver/upload | M102–M103 |
| Dispute | **PARTIAL** | Prisma disputes + admin center wired; client dashboard disputes UI newer | M23, M104 |
| Commission 15% | **PARTIAL** | `DEFAULT_COMMISSION_RATE` = 15%; commission records on booking complete; per-pilot override not built; admin ledger has mock fallback | M12, M309 |
| Notifications | **PARTIAL** | In-app bell + event triggers exist; bid/accept/handoff email flows incomplete | M16, M57, M99 |

**Tomorrow start:** Audit sign-off → wire **My Projects** to `GET /api/client/jobs` → then **Project Bids** to applications API → connect accept to booking.

---

## 3. Client modules

| Route / module | Status | Mock / gap | API / lib to wire | Priority |
|----------------|--------|------------|-------------------|----------|
| `/dashboard/client` overview | **MOCK** | Hardcoded name "John"; stats/activity/projects from `dashboard-overview-mock.ts` | M38 — aggregate jobs, bids, bookings | P2 (after core flow) |
| Post project wizard | **PARTIAL** | Saves primary location only; reference files = filenames only; deliverables/quote/priority in text | Extend `postProjectToJobPayload` + Job model or metadata JSON | **P1** |
| `/dashboard/client/jobs` My Projects | **MOCK** | `my-projects-mock.ts` | `GET /api/client/jobs` | **P1** |
| `/dashboard/client/quotes` Project Bids | **MOCK** | `project-bids-mock.ts`; accept modal says "payment later" | `GET …/applications`, PATCH status, accept route | **P1** |
| `/dashboard/client/find-pilots` | **MOCK** | `find-pilots-mock.ts` | Pilot directory API from profiles | P1 |
| `/dashboard/client/messages` | **MOCK** | `client-messages-mock.ts` for thread list | `GET /api/client/conversations` | P2 |
| `/dashboard/client/payments` Billing | **PARTIAL** | Fetches `GET /api/client/payments`; invoice list + payment method from `billing-mock.ts` when empty | M65 Stripe later | DEFER |
| `/dashboard/client/settings` | **PARTIAL** | Notification toggles in `localStorage` via `settings-notifications.ts` | M68 persist prefs | P2 |
| `/dashboard/client/profile` | **PARTIAL** | Extended fields + logo = local preview only | M111–M113 | P2 |
| `/dashboard/client/disputes` | **PARTIAL** | New UI; check API integration vs `client/disputes` routes | M23 | P2 |
| Onboarding | **WIRED** | Profile API + redirect guard | M04 | Done |

### Client mock files (remove after wiring)

- `src/lib/client/my-projects-mock.ts`
- `src/lib/client/project-bids-mock.ts`
- `src/lib/client/find-pilots-mock.ts`
- `src/lib/client/dashboard-overview-mock.ts`
- `src/lib/client/client-messages-mock.ts`
- `src/lib/client/billing-mock.ts` (keep fallbacks until Stripe)

---

## 4. Pilot modules

| Route / module | Status | Mock / gap | API / lib to wire | Priority |
|----------------|--------|------------|-------------------|----------|
| `/dashboard/pilot` overview | **PARTIAL** | `getPilotDashboardPageData` uses Prisma; recommended jobs, locked jobs, reviews, activity fall back to `dashboard-overview-mock.ts` | M70–M75 | P2 |
| `/dashboard/pilot/jobs` Marketplace | **PARTIAL** | Live `GET /api/pilot/jobs` + mock fallback; filters local only | M80–M81 | **P1** |
| `/dashboard/pilot/jobs/[id]` + bid | **WIRED** | `PilotBidForm` → applications API | M83 | Done |
| `/dashboard/pilot/proposals` | **PARTIAL** | `GET /api/pilot/applications` + `proposals-mock.ts` fallback; SHORTLISTED status mock-only | M93–M95 | **P1** |
| `/dashboard/pilot/contracts` | **PARTIAL** | `GET /api/pilot/bookings` + `active-contracts-mock.ts` fallback | M100–M101 | **P1** |
| `/dashboard/pilot/locked-jobs` | **PARTIAL** | From jobs API locked list + `locked-jobs-mock.ts` | M87–M88 | P2 |
| `/dashboard/pilot/messages` | **MOCK** | `pilot-messages-mock.ts` | `GET /api/pilot/conversations` | P2 |
| `/dashboard/pilot/portfolio` | **MOCK** | `portfolio-mock.ts`; add = local append | M122–M125 | Later |
| `/dashboard/pilot/verifications` | **PARTIAL** | `GET /api/pilot/verifications`; upload uses existing verification API | M14, M115–M119 | P2 |
| `/dashboard/pilot/payments` | **PARTIAL** | Maps payment API; polish/mock gaps | M78 | Later |
| `/dashboard/pilot/shop` | **PARTIAL** | Catalog from API; checkout pay = placeholder | M258 | Later |
| `/dashboard/pilot/subscription` | **PARTIAL** | Demo enroll; no real Stripe | M90–M91 | Later |
| `/dashboard/pilot/reviews` | **PARTIAL** | API + mock fallback in mapper | M79 | P2 |
| `/dashboard/pilot/support` | **PARTIAL** | Static help articles from `help-articles.ts` | M266 CMS later | P2 |
| `/dashboard/pilot/settings` | **PARTIAL** | Account panel shared; pilot-specific TBD | M25 | P2 |
| Profile / onboarding | **WIRED** | Profile API | M03 | Done |

### Pilot mock files

- `src/lib/pilot/marketplace-mock.ts`
- `src/lib/pilot/proposals-mock.ts`
- `src/lib/pilot/active-contracts-mock.ts`
- `src/lib/pilot/locked-jobs-mock.ts`
- `src/lib/pilot/dashboard-overview-mock.ts`
- `src/lib/pilot/pilot-messages-mock.ts`
- `src/lib/pilot/portfolio-mock.ts`

---

## 5. Admin / moderator modules

| Route / module | Status | Mock / gap | Notes | Priority |
|----------------|--------|------------|-------|----------|
| Operations dashboard | **WIRED** | Prisma stats | Minor polish only | Done |
| Reports & analytics | **WIRED** | Prisma payments/bookings | — | Done |
| Fleet & personnel | **PARTIAL** | `personnel-directory.ts` mock roster when empty | M221+ | P2 |
| Job approval queue | **PARTIAL** | Prisma pending jobs; **MOCK_ROWS when empty** | Remove mock in prod wiring | P1 |
| Messages tracking | **WIRED** | Read-only conversation list | — | Done |
| Support chat | **WIRED** | Real support API + redesigned UI | — | Done |
| Dispute center | **PARTIAL** | Prisma disputes; mock stats when empty | M23 | P2 |
| Subscriptions / tier plans | **PARTIAL** | Prisma plans; mock churn stats | M91 later | P2 |
| Commissions ledger | **PARTIAL** | Prisma commissions; `usingMockLedger` fallback | M12 | P2 |
| Certificate engine | **PARTIAL** | DB templates; `MOCK_CERTIFICATE_TEMPLATES` when empty | M22 | Later |
| Badges & wings | **PARTIAL** | DB wings; `MOCK_BADGE_CARDS` when empty | M15 | Later |
| Uniform shop admin | **PARTIAL** | DB products/orders; mock inventory/orders when empty | M26, M258 | Later |
| CMS collections | **PREVIEW** | `cms-store.ts` in-memory | M259–M265 | Later |
| Platform configuration | **PREVIEW** | `configuration-data.ts`; save = preview modal only | M270–M274 | Later |
| Moderator permissions | **PREVIEW** | `moderator-permissions-store.ts` in-memory; PATCH preview API | M281–M287 | Later |
| Users / pilots / verifications | **WIRED** | Prisma + admin APIs | — | Done |
| Payments admin | **WIRED** | Prisma payments | — | Done |

### Preview / in-memory stores (persist later)

| Store | File | API prefix |
|-------|------|------------|
| CMS articles/resources | `src/lib/cms/cms-store.ts` | `/api/admin/cms/*` |
| Platform config | `src/lib/admin/configuration-data.ts` | `/api/admin/configuration` |
| Moderator permissions | `src/lib/auth/moderator-permissions-store.ts` | `/api/admin/permissions/*` |

---

## 6. Payments & subscriptions (DEFER — no fakes)

| Item | Status | Rule |
|------|--------|------|
| Stripe client billing | **NOT STARTED** | Do not show fake "card saved" — M65 |
| Booking payment / escrow | **NOT STARTED** | Use existing Payment model; wire after accept flow — M56 |
| Pilot tier upgrades | **NOT STARTED** | Demo enroll only today — M91 |
| Uniform shop checkout | **NOT STARTED** | Placeholder pay route — M258 |
| 15% commission | **PARTIAL** | `lib/commission/constants.ts` (15%); per-pilot override — M309; enforce on escrow payout — M308 | M12 |
| Pilot payout | **PARTIAL** | `amountNet` on Payment; verify end-to-end | M12 |

---

## 7. Uploads & storage (DEFER — use existing patterns)

| Item | Status | Existing pattern |
|------|--------|------------------|
| Verification documents | **WIRED** | `POST /api/pilot/verifications`, admin approve/reject, `support/files` |
| Profile avatar | **PLACEHOLDER** | Local preview only — M108 |
| Portfolio media | **PLACEHOLDER** | Local preview — M109, M122 |
| Job reference files | **PLACEHOLDER** | Filename list in wizard only — M44 |
| Message attachments | **PLACEHOLDER** | Paperclip UI — M62 |
| Dispute evidence | **PARTIAL** | Dispute entries API exists |
| CMS featured images | **PLACEHOLDER** | URL field only — M262 |

**Rule:** Extend `support/files` or verification upload helpers — do not invent a new storage system.

---

## 8. Notifications & permissions gaps

| Gap | Status |
|-----|--------|
| Bid accepted/declined emails | **NOT STARTED** (M57, M99) |
| Job unlock alerts | **NOT STARTED** (M92) |
| Message push / real-time | **NOT STARTED** (M64) |
| Moderator permissions DB + API enforcement | **PREVIEW** — client/layout guards only (M281–M287) |
| Action-level API permission checks | **NOT STARTED** (M287) |

---

## 9. Public / marketing (no work tomorrow)

Marketing pages use static/content modules. **Do not touch** during functionality phase unless a wired feature needs a public surface (e.g. CMS-driven resources later).

Deferred: final Figma alignment (M294), SEO (M19), E2E (M20).

---

## 10. Sprint 1 wiring checklist (tomorrow)

### Day 1 — Audit + Client projects

- [ ] Review this document; confirm priorities with team
- [ ] Wire `ClientMyProjects` → `GET /api/client/jobs` (status tabs, empty state, no mock)
- [ ] Verify post-project submit → job appears in My Projects after refresh
- [ ] Map job statuses to UI tabs (draft, pending_approval, open, etc.)
- [ ] Remove or gate `my-projects-mock.ts` behind dev-only flag

### Day 2 — Client bids (start)

- [ ] Wire `ClientProjectBids` → applications per job
- [ ] Server-side shortlist / decline / accept (replace local state)
- [ ] Call existing accept route → create booking
- [ ] Success/error states + notifications stub

### Subsequent days

- [ ] Pilot marketplace: remove mock when live jobs exist; server filters
- [ ] Proposal status + shortlisted schema (M95)
- [ ] Contracts list handoff to booking detail actions
- [ ] Admin: remove job-approval mock rows in production path

---

## 11. Do not do in functionality phase

- Redesign UI or revisit theme tokens (except M320 Figma pass when scheduled)
- New storage providers
- Fake Stripe / fake payment success
- Duplicate job/bid/booking models
- Public marketing page edits (except Captain's Club M317 when scheduled)
- Prisma schema changes without updating `DATA_MODEL_OVERVIEW.md`
- Remote Rescue implementation (M319 — future only)
- Present A-2–A-6 as monthly subscription tiers (use $99.99/yr + one-time Fast Forward)

---

## 13. New modules from source PDFs (M295–M320)

Full task list — see [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md) § Task list.

| Module | Task | Phase |
|--------|------|-------|
| M297 | Annual membership $99.99/yr billing | 10 |
| M298 | Fast Forward one-time upgrade fees | 10 |
| M299 | Upgrade difference calculation | 10 |
| M300–M301 | Lapse + 30-day reactivation | 10 |
| M302 | Automatic grade promotion engine | 10 |
| M303–M304 | Visibility delay + A-1 no apply | 4–5 |
| M305 | Proposal +20% revision cap | 6 |
| M306 | Client-initiated chat only | 6 |
| M307 | Contract milestone / planning fields | 7 |
| M308 | Escrow + 15% payout | 8 |
| M309–M310 | Per-pilot commission override + buyout | 8+ (buyout post-launch) |
| M311–M313 | Uniform policy + sanctions | 9 |
| M314 | Rule-driven wings engine | 9 |
| M315 | Certificate + ID card (30 days) | 9–10 |
| M316 | Instructor $199.99/yr add-on | 10 |
| M317 | Captain's Club public page | 9 |
| M318 | Squadron Vote disputes | Post-MVP |
| M319 | Remote Rescue roadmap only | Never (2027) |
| M320 | Figma re-alignment | After Phase 10 prep |

---

## 12. Existing APIs reference (already built)

Use these — do not rebuild:

| Area | Routes |
|------|--------|
| Client jobs | `GET/POST /api/client/jobs`, `GET/PATCH /api/client/jobs/[id]`, `POST …/submit` |
| Client applications | `GET /api/client/jobs/[id]/applications`, `POST …/[applicationId]/accept` |
| Pilot jobs | `GET /api/pilot/jobs`, `GET /api/pilot/jobs/[id]` |
| Pilot applications | `GET/POST /api/pilot/applications` |
| Admin jobs | `GET /api/admin/jobs`, approve/reject |
| Bookings | Client + pilot booking routes under `/api/client/bookings`, `/api/pilot/bookings` |
| Payments | `/api/client/payments`, `/api/pilot/bookings/[id]/payment` |
| Disputes | Client, pilot, admin dispute routes |
| Messaging | `/api/client/conversations`, `/api/pilot/conversations` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-02 | Initial audit after UI/design phase complete (Phases 1–41) |
| 2026-06-02 | Source PDF alignment — 15% commission, membership model, phases 1–10, M295–M320 |
