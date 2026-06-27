# New Features Comparison — Source Document Review

**Purpose:** Compare three client source PDFs against current implementation. Track conflicts, decisions, and module mapping.

**Last updated:** 2026-06-02  
**Status:** Documentation alignment — no functionality implementation in this pass.

---

## Source documents

| # | File name | Purpose | Primary topics |
|---|-----------|---------|----------------|
| 1 | `Remote Air Service Media Kit V.1 Highlighted.pdf` | Brand + platform vision | Brand identity, aviation visual style, membership grades, uniform standards, wings/awards, proposal→contract flow, contract execution, dispute escalation, certificates/ID cards, uniform shop, Remote Rescue (future) |
| 2 | `Pilot Membership and Upgrades.pdf` | Membership billing model | $99.99/year for all pilots; Fast Forward upgrades are **one-time**; separate membership from grade upgrade; upgrade **difference** billing only on later upgrades |
| 3 | `Paragraph 5 Clarifications.pdf` | Operational & governance rules | 15% default commission; Super Admin manual commission override; A-4+ commission buyout (future); membership lapse; instructor rules; uniform sanctions; grade/wings display; contract milestones; Captain's Club; Remote Rescue out of scope |

**Authoritative context doc:** [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md)

---

## Document 1 — Media Kit

### Requirements found

| Area | Requirement | Related modules |
|------|-------------|-----------------|
| Brand | Aviation visual language, uniform standards, epaulettes/wings | M17, M05, M26, design system |
| Grades | A-1 through A-10 titles (A-7–A-10 invitation/honorary later) | M11, M27 |
| Proposal flow | Client post → admin approve → grade-based visibility → proposal → client review → chat → revision → contract | M06–M09, M08, M21 |
| Contract execution | Six-stage workflow with operation planning fields | M09, new milestone module |
| Disputes | Formal mediation, evidence, escalation beyond simple ticket | M23 |
| Wings/awards | Rule-driven, admin-awarded (Senior/Master/etc.) | M15 |
| Certificates | Digital free when earned; templates TBD | M22 |
| ID cards | Mailed after 30 approved days; included in membership | M22, M11 |
| Uniform shop | Epaulettes, wings, patches, polo (Captain black polo) | M26 |
| Remote Rescue | Late 2027 concept — **not current scope** | M319 (future) |

### Conflicts with current implementation

| Topic | Current | Source doc | Priority |
|-------|---------|------------|----------|
| Grade pricing | Per-tier yearly prices derived from monthly marketing tiers ($0–$399/mo) | $99.99/year membership + one-time Fast Forward fees | **P1** |
| Visibility delays | Backend A-1–A-6 mostly aligned; marketing pricing shows wrong delays (72h, 48h, etc.) | Official delays: 48/36/24/12/6/0 hours | **P1** backend OK; **P2** marketing/Figma |
| Proposal flow | Partial API; mock client bids UI | Full revision (+20%), client-only chat initiation | **P1** |
| Contract stages | Basic booking statuses | Six named stages + planning fields | **P2** |
| Disputes | Admin dispute center UI | Squadron Vote escalation (100 leadership votes) | **P2** post-MVP |
| Wings | Admin award UI + some auto logic | Hour/certificate/contract-based rules | **P2** |
| Uniform | Shop UI only | Governance, client uniform question, admin sanctions | **P1** docs; **P2** build |

### Decisions required

| # | Question | Options | Status |
|---|----------|---------|--------|
| D1 | Fast Forward fee table per grade (A-2→A-6) | Client to confirm exact one-time amounts | **Pending** |
| D2 | Commission buyout formula | 75% of last 6 months vs flat rate | **Deferred post-launch** |
| D3 | Certificate template fonts/assets | Wait for client final assets | **Pending** |
| D4 | Figma pricing page vs new membership model | Re-align Figma then code | **In progress** (client updated Figma) |

---

## Document 2 — Pilot Membership and Upgrades

### Requirements found

| Rule | Detail |
|------|--------|
| Base membership | **$99.99/year** for every pilot regardless of grade |
| Fast Forward | A-2 through A-6 upgrades = **one-time fees**, not recurring plans |
| UI separation | Must not present A-2–A-6 as monthly subscription tiers |
| Upgrade credit | If pilot paid for A-4 then upgrades to A-6, charge **difference only** (example: $129.99 − $89.99 = $40.00) |
| Instructor add-on | Referenced in Doc 3 — $199.99/year (separate module) |

### Conflicts with current implementation

| Topic | Current | Source doc | Priority |
|-------|---------|------------|----------|
| Billing model | `SubscriptionPlan` with per-tier yearly prices; marketing `$19–$399/mo` cards | Single $99.99/yr + one-time upgrades | **P1** |
| Admin tier plans UI | Editable monthly price per A-tier plan | Membership fee vs Fast Forward fee columns | **P1** |
| Pilot subscription page | "Current Plan" tier cards | Annual membership + Fast Forward upgrade CTA | **P1** |
| Demo enroll | `POST /api/pilot/subscription` selects tier plan | Needs membership + upgrade ledger | **P2** |

### Decisions required

| # | Question | Status |
|---|----------|--------|
| D5 | Exact one-time Fast Forward fee for each grade jump | **Pending client table** |
| D6 | Automatic grade promotion vs paid Fast Forward — can pilot skip time via fee only? | **Clarify:** docs imply both time-based promotion AND paid Fast Forward |
| D7 | Stripe products: 1 membership SKU + N upgrade SKUs + instructor SKU | **Deferred** until M297–M298 |

---

## Document 3 — Paragraph 5 Clarifications

### Requirements found

| Area | Rule |
|------|------|
| Commission | **15% default** for all new pilots at sign-up; not tier-based by default |
| Commission override | Super Admin manual per-pilot adjustment (future backend) |
| Commission buyout | A-4+ may buy out later (75% of 6-month commissions or flat — TBD) |
| Membership lapse | Grade time stops; benefits inactive; verification inactive |
| Profile removal | Cancel + remove profile = lose grade; **30-day reactivation** keeps grade |
| Job visibility | Admin-approved jobs; grade delays as in M27 (48h→0h); **A-1 cannot apply** |
| Proposal revision | Revisions may increase price by **max 20%** |
| Chat | **Only clients** initiate chat with pilots |
| Contract | ~30 days typical; six milestone stages; planning fields list |
| Escrow | Collect → hold → deliver → approve → release minus commission |
| Disputes | Separate from Messages and Support; no rating/awards until resolved |
| Uniform | Policy acceptance, client review question, admin sanctions/demotion |
| Instructor | $199.99/yr add-on; min A-4; student 20% off basic membership; ceremonial promotion |
| Captain's Club | **Public page** — alphabetical active Captains (A-6) |
| Remote Rescue | **Not current scope** — late 2027, 500h + A-3+ eligibility noted |

### Conflicts with current implementation

| Topic | Current | Source doc | Priority |
|-------|---------|------------|----------|
| Commission rate | `DEFAULT_COMMISSION_RATE = 0.1` (10%) in code + docs | **15%** default | **P1** — docs + constant updated; Stripe deferred |
| Per-pilot commission | Not in schema | Super Admin override field | **P2** M309 |
| Tier-based commission | None today (good) | Must stay non-tier-based | ✅ aligned |
| A-1 apply | Backend `canApply: false` | A-1 cannot apply | ✅ aligned |
| Visibility hours | Backend 48/36/24/12/6/0 | Same | ✅ aligned |
| Client-initiated chat | Not enforced | Clients only start threads | **P1** M306 |
| Proposal +20% | Not implemented | Hard cap on revision | **P1** M305 |
| Messages vs disputes vs support | Partially separate UIs | Must remain strictly separate | **P2** verify on wire |
| Captain's Club | No public route | Required public list | **P1** M317 |
| Uniform sanctions | No admin sanction UI | Demotion, visibility, termination controls | **P2** M313 |
| Squadron Vote | Not implemented | 100-vote escalation path | **P3** post-launch |

### Decisions required

| # | Question | Status |
|---|----------|--------|
| D8 | Confirm 15% applies to gross booking amount before any discounts | **Assumed yes** — confirm with client |
| D9 | Instructor student 20% off — off $99.99 membership only? | **Per doc yes** — confirm code rules |
| D10 | ID card — "30 approved days" = calendar days since profile approved? | **Pending** |
| D11 | Automatic promotion timeline — does Fast Forward payment skip waiting period? | **Pending** |

---

## Cross-document conflict summary

| Conflict | Was | Now (source of truth) | Action |
|----------|-----|----------------------|--------|
| Platform commission | 10% Phase 1 | **15% default** | Update docs + `DEFAULT_COMMISSION_RATE`; per-pilot override later |
| Membership pricing | Monthly tier cards / per-grade yearly | **$99.99/yr + one-time upgrades** | Document + Figma realign; code in M297–M299 |
| Grade titles | Mostly aligned A-1–A-6 | A-7–A-10 documented for future | Extend docs; no code yet |
| Shop vs governance | Catalog UI | Shop + uniform compliance + sanctions | M311–M313 + M26 |
| Badges/wings | Admin award + mock cards | Rule-driven engine | M314 |
| Disputes | Admin center | Full mediation + Squadron Vote | M23 + M318 |
| Remote Rescue | N/A | Future 2027 | Docs only — M319 |
| Figma vs code | Interim foundation done | Client updated Figma — revisit | M320 after doc alignment |

---

## Priority matrix (implementation order)

| Priority | Items |
|----------|-------|
| **P0 — Docs (this task)** | NEW_FEATURES_COMPARISON, IMPLEMENTATION_CONTEXT, FUNCTIONALITY_WIRING_PLAN, BUILD_CONTROL additions, cursor business-rules module |
| **P1 — Core marketplace** | Client jobs → admin approve → pilot visibility → proposals → accept → booking (see FUNCTIONALITY_WIRING_PLAN phases 2–7) |
| **P1 — Business rules in flow** | A-1 no apply, client chat initiation, proposal +20%, 15% commission on payout |
| **P2 — Membership billing** | $99.99/yr, Fast Forward one-time, upgrade difference, lapse/reactivation |
| **P2 — Governance** | Uniform policy, sanctions, Captain's Club page |
| **P3 — Post-launch** | Commission buyout, Squadron Vote, Remote Rescue, A-7–A-10 |

---

## Related module IDs (new)

See [`BUILD_CONTROL.md`](BUILD_CONTROL.md) rows **M295–M320**.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-02 | Initial comparison from three source PDFs |
