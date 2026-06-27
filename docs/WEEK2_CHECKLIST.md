# Week 2 — Admin & Moderator Checklist

**Active milestone:** Week 3 / Milestone 3 — Pilot (`ACTIVE_MILESTONE = 3`)  
**Week 2 status:** **Signed off** (2026-06-02)  
**Branch:** `week-two` (from `week-one`)  
**Plan reference:** [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 2  
**Demo script:** [`WEEK2_DEMO_SCRIPT.md`](WEEK2_DEMO_SCRIPT.md)

---

## Scope summary

Platform operators control the marketplace: job approval, fleet, disputes, commissions, permissions, CMS, configuration, certificates, badges, shop, and subscriptions.

**Demo chain:** Client posts (M1) → Admin approves (M2) → Pilot sees job after tier delay (M3).

---

## Checklist

| # | Work item | Priority | Status |
|---|-----------|----------|--------|
| 2.0 | Bump `ACTIVE_MILESTONE` to 2; Week 1 marked complete | **High** | Done |
| 2.0b | Admin shell + ops dashboard aligned to Figma `808:24076` | **High** | Done |
| 2.1 | Job approval queue — production path only (no demo rows) | **High** | Done |
| 2.2 | Approve / reject API + tier delay + notifications verified | **High** | Done |
| 2.3 | Operations dashboard KPI accuracy | Medium | Deferred (M4 QA) |
| 2.4 | Reports & analytics — commission / revenue charts | Medium | Deferred (M4 QA) |
| 2.5 | Fleet & personnel — real roster only | **High** | Done |
| 2.6 | Dispute center — remove mock stats/rows | **High** | Done |
| 2.7 | Commissions ledger — live data only (15% default rate) | **High** | Done |
| 2.8 | Moderator permissions — Prisma persistence | **High** | Done |
| 2.9 | CMS articles & resources — Prisma + public pages | Medium | Done |
| 2.10 | Platform configuration — persist fees/settings | Medium | Done |
| 2.11 | Certificates engine — DB-only templates | Low | Done |
| 2.12 | Badges & wings — DB-only definitions | Low | Done |
| 2.13 | Uniform shop admin — DB products/orders only | Low | Done |
| 2.14 | Subscriptions admin — tier edit + real churn stats | Low | Done |
| 2.15 | Support chat & messages — regression pass | Low | Deferred (M4 QA) |
| 2.16 | Action-level API guards on all admin mutations | **High** | Done |

---

## Implementation log

| Date | Item | Status |
|------|------|--------|
| 2026-06-02 | Branch `week-two`; `ACTIVE_MILESTONE = 2` | Done |
| 2026-06-02 | Remove mock fallbacks: job approval, fleet, disputes, commissions | Done |
| 2026-06-02 | `requireAdminPermission` + job approve/reject API guards | Done |
| 2026-06-02 | Prisma: permissions, CMS, platform config, regions, squadron voting | Done |
| 2026-06-02 | Action-level guards on ~45 admin mutation routes | Done |
| 2026-06-02 | Commission rate from persisted platform config; real subscription churn | Done |
| 2026-06-02 | Job approval workflow tests + demo script documented | Done |
| 2026-06-02 | Week 2 sign-off; `ACTIVE_MILESTONE = 3` (Pilot unlocked) | Done |

---

## Week 2 sign-off criteria

- [x] All **High** items **Done**
- [x] No demo/mock fallbacks on critical admin paths (job approval, fleet, disputes, commissions)
- [x] Moderator permissions persisted + enforced on API mutations
- [x] Admin demo script documented ([`WEEK2_DEMO_SCRIPT.md`](WEEK2_DEMO_SCRIPT.md))
- [x] `npm run test:all` and `npx next build` pass

---

## Handoff to Week 3

Pilot routes are unlocked (`ACTIVE_MILESTONE = 3`). Focus: marketplace live data, proposals, contracts, delivery loop — see [`PLATFORM_MILESTONE_PLAN.md`](PLATFORM_MILESTONE_PLAN.md) § Milestone 3.
