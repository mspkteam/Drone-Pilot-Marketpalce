# Week 3 — Pilot Checklist

**Week 3 status:** **Complete** — signed off 2026-08-18  
**Active milestone:** Week 4 / Milestone 4 — Bug Fixes & Hardening (`ACTIVE_MILESTONE = 4`)  
**Plan reference:** [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 3  
**Figma map:** [`WEEK3_FIGMA_PILOT.md`](WEEK3_FIGMA_PILOT.md)  
**Demo script:** [`WEEK3_DEMO_SCRIPT.md`](WEEK3_DEMO_SCRIPT.md)

---

## Scope summary

Pilots discover approved jobs, submit proposals, manage contracts, deliver work, and receive client handoff approval. Client accept → booking → deliver → approve completes the marketplace loop (payment/commission logic only — Stripe in Week 4).

**Demo chain:** Admin approves job (M2) → Pilot sees job on tier → Submit proposal → Client accepts → Active contract → Deliver → Client approves → Booking complete.

---

## Checklist

| # | Work item | Priority | Status |
|---|-----------|----------|--------|
| 3.0 | `ACTIVE_MILESTONE = 3`; remaining Week 3 pilot screens unlocked and Figma-aligned | **High** | Done |
| 3.1 | Marketplace — live jobs API (no mock fallback) | **High** | Done |
| 3.2 | Marketplace server filters | Medium | Done (`q`, `category`, `budgetMin`, `budgetMax`) |
| 3.3 | Locked jobs — server-authoritative countdown | **High** | Done (live API; no mock fallback) |
| 3.4 | Tier / cert eligibility enforcement on cards | Medium | Done (tier block reason on cards) |
| 3.5 | Submit proposal — Figma `1171:4661` + terms popup `1171:5545` | **High** | Done |
| 3.6 | My Proposals — status tabs + Revised (shortlisted) | **High** | Done |
| 3.7 | Proposal detail route `/dashboard/pilot/proposals/[id]` | **High** | Done |
| 3.8 | Withdraw proposal — UI + API | **High** | Done |
| 3.9 | Active contracts — bookings API only (no mock) | **High** | Done |
| 3.10 | Deliver work / upload handoff | **High** | Done |
| 3.11 | Client handoff approval | **High** | Done |
| 3.12 | Contract disputes + messages deep link | Medium | Done (`#dispute` + conversation id) |
| 3.13 | Pilot dashboard overview — live stats; no mock widgets | **High** | Done |
| 3.14 | Membership redesign (Figma 808:2478) — $99.99 + Fast Forward | **High** | Done |
| 3.15 | Messages UI — conversations API | Medium | Done (no mock fallback) |
| 3.16 | Portfolio gallery — CRUD + persistence | Medium | Done (`portfolioJson` + API) |
| 3.17 | Verifications grid — full catalog | Medium | Done (catalog always; no mock statuses) |
| 3.18 | Profile strength — live portfolio count | Medium | Done (`portfolioJson`; extras avatar in `profileExtrasJson`) |
| 3.19 | Reviews · shop polish | Low | Done (Figma `808:22235` shop + live catalog) |
| 3.20 | Contract planning screen (6 stages, M307) | Low | Deferred (Phase 7+ per ADR) |
| 3.21 | Instructor dashboard / Request Wings / add-on (M316) | **High** | Done (instructor Figma `808:3626`; Request Wings Figma `1229:6885`) |

---

## Implementation log

| Date | Item | Status |
|------|------|--------|
| 2026-08-18 | Request Wings Figma `1229:6885` — admin-reviewed aviator wing evidence | Done |
| 2026-08-18 | Instructor Membership Dashboard Figma `808:3626` — activate, discount code, student wings | Done |
| 2026-08-17 | Profile extras persist + shop Figma `808:22235` | Done |
| 2026-08-17 | Submit Proposal Figma `1171:4661` + terms overlay `1171:5545` | Done |
| 2026-06-02 | Submit Proposal flow (Figma 808:3828, 808:4459) | Done |
| 2026-06-02 | My Proposals Revised tab; proposal metadata + validation | Done |
| 2026-06-02 | Membership redesign — catalog, Fast Forward, pay-the-difference | Done |
| 2026-06-02 | Extended bid form (808:9084) — operational, compliance, pricing | Done |
| 2026-06-02 | Proposal detail + withdraw API/UI | Done |
| 2026-06-02 | `BookingDelivery` model + deliver/upload + client approval | Done |
| 2026-06-02 | Remove mock fallbacks: marketplace, proposals, contracts, dashboard | Done |
| 2026-06-02 | Week 3 checklist + demo script | Done |
| 2026-06-02 | Messages, portfolio API, reviews/shop/verifications mock removal | Done |
| 2026-06-02 | Marketplace server filters + tier eligibility on cards | Done |
| 2026-06-02 | Contract message deep links + live portfolio strength | Done |

---

## Week 3 sign-off criteria

- [x] All **High** core-loop items **Done**
- [x] End-to-end: marketplace → proposal → accept → contract → deliver → approve → complete
- [x] No mock fallbacks on marketplace, proposals, contracts, dashboard, messages, reviews, shop, verifications
- [x] Pilot demo script documented ([`WEEK3_DEMO_SCRIPT.md`](WEEK3_DEMO_SCRIPT.md))
- [x] `npm run test:all` and `npm run build` pass

---

## Deferred to Week 4 / later

- Contract planning six-stage UI (M307)
- Instructor dashboard, Request Wings, instructor add-on (M316) — **done 2026-08-18** (Stripe still later)
- Profile avatar upload / CDN (M107–M110)
- Job cert-requirement matching beyond tier gate (M119)
- Stripe payments; production file/CDN storage for uploads
- Full mock file deletion (`*-mock.ts`) — Week 4 hardening

---

## Handoff to Week 4

Focus: cross-role regressions, security, performance, Stripe prep, remaining mock file cleanup, and polish on deferred pilot modules. See [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 4.
