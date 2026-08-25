# Week 3 — Pilot Checklist

**Schedule:** 7 Jul – 11 Jul 2026 (Milestone 3 — Pilot)  
**Source:** Remote Air Service Weekly Delivery Schedule (5 weeks to launch)  
**Active milestone:** Week 4 / Milestone 4 — Bug Fixes & Hardening (`ACTIVE_MILESTONE = 4`)  
**Week 3 status:** **Signed off** (2026-08-18)  
**Plan reference:** [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 3  
**Figma map:** [`WEEK3_FIGMA_PILOT.md`](WEEK3_FIGMA_PILOT.md)  
**Demo script:** [`WEEK3_DEMO_SCRIPT.md`](WEEK3_DEMO_SCRIPT.md)

---

## Scope summary

Pilots browse approved jobs, submit proposals, manage contracts, deliver work, and receive client approval. That closes the live marketplace loop (commission is calculated on complete — Stripe is Week 4).

**Demo chain:** Client posts (M1) → Admin approves (M2) → Pilot bids (M3) → Client accepts → Pilot delivers → Client approves → Commission recorded.

**Schedule goal:** Full loop is live — job posted → admin approves → pilot bids → client accepts → pilot delivers → client approves → commission calculated.

---

## Checklist

Items **3.1–3.17** match the weekly schedule. **3.5** is included here because the schedule jumps 3.4 → 3.6; submit proposal is required for the loop.

| # | Feature | What gets done | Priority | Status |
|---|---------|----------------|----------|--------|
| 3.1 | Marketplace — job listings | Pilots browse approved, live jobs | **High** | Done |
| 3.2 | Marketplace filters | Filter by type, location, and related criteria | Medium | Done (`q`, `category`, `budgetMin`, `budgetMax`) |
| 3.3 | Locked jobs & countdown | Grade-based unlock with server countdown | **High** | Done |
| 3.4 | Eligibility on job cards | Card shows whether the pilot qualifies | Medium | Done |
| 3.5 | Submit proposal | Bid form + terms (schedule omitted this row) | **High** | Done |
| 3.6 | My Proposals | Track bids with live status (submitted, shortlisted, accepted) | **High** | Done |
| 3.7 | Proposal detail page | Full detail view per proposal | **High** | Done |
| 3.8 | Withdraw proposal | Pilot can withdraw a bid they no longer want | **High** | Done |
| 3.9 | Active contracts | View and manage accepted bookings | **High** | Done |
| 3.10 | Deliver work | Submit deliverables to the client on-platform | **High** | Done |
| 3.11 | Client approval of delivery | Client approves work; commission is calculated | **High** | Done (15% platform commission; Stripe in Week 4) |
| 3.12 | Raise a dispute | Pilot can open a dispute from a contract | Medium | Done |
| 3.13 | Pilot dashboard | Earnings, proposals, and upcoming jobs | **High** | Done |
| 3.14 | Messages | Conversations with clients on live messaging | Medium | Done |
| 3.15 | Portfolio gallery | Upload and show past work | Medium | Done |
| 3.16 | Verifications | Licences, certificates, and compliance documents | Medium | Done |
| 3.17 | Profile & strength score | Profile checklist for visibility | Medium | Done |

---

## Implementation log

| Date | Item | Status |
|------|------|--------|
| 2026-08-18 | Week 3 sign-off; `ACTIVE_MILESTONE = 4` | Done |
| 2026-08-18 | Request Wings + instructor membership dashboard | Done |
| 2026-08-17 | Submit proposal Figma + terms overlay | Done |
| 2026-08-17 | Profile extras persist; shop / reviews / verifications live | Done |
| 2026-06-02 | Marketplace, proposals, contracts, delivery, dashboard — no mock fallbacks | Done |
| 2026-06-02 | `BookingDelivery` + client approve/reject | Done |
| 2026-06-02 | Week 3 checklist + demo script | Done |

---

## Week 3 sign-off criteria

- [x] All **High** items **Done**
- [x] End-to-end: marketplace → proposal → accept → contract → deliver → approve → complete
- [x] No mock fallbacks on marketplace, proposals, contracts, dashboard, messages, reviews, shop, verifications
- [x] Pilot demo script documented ([`WEEK3_DEMO_SCRIPT.md`](WEEK3_DEMO_SCRIPT.md))
- [x] `npm run test:all` and `npm run build` pass

---

## Deferred to Week 4 / later

From the 5-week schedule, these belong in **Week 4** (bug fixes & hardening) or **Week 5** (launch), not Week 3:

- Stripe payments (schedule 4.6)
- Production file/CDN hardening (schedule 4.7 — Blob uploads now exist; further hardening in M4)
- Remaining mock file deletion (`*-mock.ts`)
- Contract planning six-stage UI (M307)
- SEO, analytics, load testing, launch checklist (Week 5)

---

## Handoff to Week 4

Milestone 3 is signed off. Week 4 focus: cross-role bugs, security, performance, Stripe, upload hardening, and mock cleanup. See [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 4.
