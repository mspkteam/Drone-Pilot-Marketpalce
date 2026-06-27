# Implementation Context — Remote Air Service Business Rules

**Purpose:** Single source of truth for agents and developers during functionality wiring. Supersedes informal 10% commission and monthly-tier assumptions in older docs until those files are updated.

**Last updated:** 2026-06-02  
**Source PDFs:** Media Kit V.1 · Pilot Membership and Upgrades · Paragraph 5 Clarifications

---

## Platform identity

Remote Air Service is a **marketplace + membership + remote aviation reputation platform** — not a generic freelance/gig clone. Preserve the dark aviation design system and completed dashboard UI; align **behavior and billing** to these rules.

---

## 1. Commission

| Rule | Value |
|------|--------|
| Default rate | **15%** of gross on completed contracts (all new pilots at sign-up) |
| Tier-based commission | **No** — not tied to A-1–A-6 by default |
| Pilot net | `gross − (gross × commissionRate)` |
| Super Admin override | Per-pilot manual commission rate (future — store on pilot profile or admin config) |
| A-4+ buyout | Future post-launch — e.g. 75% of last 6 months commissions paid, or flat rate (client may simplify) |
| Stripe | Do not implement payment/commission collection until escrow milestone |

**Code note:** `DEFAULT_COMMISSION_RATE` in `src/lib/commission/constants.ts` target = **0.15**. Per-pilot override not in schema yet.

---

## 2. Membership model

### Base membership

- **$99.99 per year** for every pilot, regardless of grade (A-1 through A-6).
- Includes platform access per grade rules; **ID card** mailed after 30 approved days (included in membership cost).
- **Epaulettes and wings are NOT included** in membership — purchased via uniform shop.

### Fast Forward (grade upgrades)

- A-2 through A-6 upgrade fees are **one-time** Fast Forward payments.
- **Not** recurring monthly/annual tier subscriptions.
- UI must **not** show A-2–A-6 as separate monthly membership plans.

### Upgrade difference (credit)

When pilot already paid for a lower Fast Forward upgrade and buys a higher one:

```
additionalDue = newUpgradeFee − priorUpgradeFeePaid
```

Example: A-4 fee paid $89.99 → A-6 fee $129.99 → charge **$40.00** only.

### Instructor add-on

- **$199.99/year** optional add-on.
- Minimum grade: **A-4 Senior Flight Officer**.
- Instructor discount code for students: **20% off basic membership ($99.99) only**.
- Instructor may buy student epaulettes/wings at discount.
- Ceremonial promotion after Part 107 + certificate (future Instructor module — M316).

---

## 3. Grade structure

### Primary member grades (A-1 – A-6)

| Code | Title | Auto-promotion tenure (active, good standing) |
|------|-------|-----------------------------------------------|
| A-1 | Student | New member |
| A-2 | Junior Flight Officer | 6 months |
| A-3 | Flight Officer | 1 year |
| A-4 | Senior Flight Officer | 18 months |
| A-5 | First Officer | 2 years |
| A-6 | Captain | 3 years |

### Honorary / leadership (later)

| Code | Title |
|------|-------|
| A-7 | Senior Captain |
| A-8 | Master Captain |
| A-9 | Fleet Captain |
| A-10 | Commodore |

Invitation/honorary advancement — **not in current build scope**.

---

## 4. Membership lapse & reactivation

### Lapse

When annual membership expires without renewal:

- Grade **time stops accumulating** toward next promotion.
- Membership **benefits inactive**.
- **Verification inactive**.
- No progress toward next grade while lapsed.

### Profile removal / cancellation

- Pilot cancels membership and removes profile → **all grade lost**.
- Show **account deletion warning** in UI.
- **30-day reactivation window:** if reactivated within 30 days, **grade retained**.
- After 30 days: account/profile/grade may be **permanently deleted**.

---

## 5. Job visibility & proposal eligibility

Jobs require **admin approval** before marketplace release (when approval flow enabled).

| Grade | Visibility delay after approval | Can apply / propose |
|-------|--------------------------------|---------------------|
| A-1 Student | 48 hours | **No** |
| A-2 Junior Flight Officer | 36 hours | Yes |
| A-3 Flight Officer | 24 hours | Yes |
| A-4 Senior Flight Officer | 12 hours | Yes |
| A-5 First Officer | 6 hours | Yes |
| A-6 Captain | Immediate | Yes |

Formula: `visibleAt = job.approvedAt + tier.jobVisibilityDelayHours`

Pilot may apply only when: job visible + grade allows apply + credentials valid.

**Backend:** `MEMBERSHIP_TIER_DEFINITIONS` + `membership.ts` — delays and A-1 `canApply: false` already match. Marketing/Figma pricing copy may still conflict — realign separately.

---

## 6. Proposal → contract flow

```
Client posts job
  → Admin approves job
  → Job visible per grade delay
  → Eligible pilot submits proposal
  → Client reviews proposal
  → Client may start chat with pilot (CLIENT INITIATES ONLY)
  → Proposal may be revised
  → Revision price increase capped at +20%
  → Scope / date / time accepted
  → Booking / contract created
```

- Typical contract completion: **~30 days** (guideline, not strict enforcement in v1).
- Pilots must **not** initiate client chat first.

---

## 7. Contract execution (six stages — future booking module)

1. Revised contract accepted  
2. Tentative planning and coordination  
3. Final timeline and concept of operation  
4. Execute contract  
5. Objective completion / quality review / dispute escalation  
6. Payments, commissions, ratings, awards/promotions  

### Operation planning fields (store on booking/contract later)

Flight times · flight sequences · camera angles · resolutions · locations · video/photo modes · travel/accommodation notes · delivery options

**Do not implement** until booking/contract milestone work (Phase 7+).

---

## 8. Escrow & payout

After contract acceptance:

1. Client payment collected  
2. Held in **escrow**  
3. Pilot performs contract  
4. Client approves completion (or dispute)  
5. Payment released to pilot **minus 15% commission** (and fees)  
6. Ratings after successful completion  
7. Awards/promotions assessed (if not blocked by dispute)

---

## 9. Disputes

**Separate systems — never merge:**

| System | Purpose |
|--------|---------|
| **Messages** | Client–pilot job threads; admin/moderator **read-only** tracking (no composer for staff) |
| **Support Chat** | Real support communication (existing) |
| **Disputes** | Formal contract quality / mediation workflow |

### Dispute rules

- Timeline, comments, evidence uploads  
- Moderator/admin review → mediation  
- **Squadron Vote** escalation (future): 50 Squadron Commanders + 50 Executive Officers = 100 votes; majority; Wing Commander tie-break  
- Payment/refund/payout adjustment after resolution  
- **Disputed contracts:** no ratings or normal awards/promotions until resolved  

---

## 10. Uniform policy & sanctions

- Signup/profile activation requires **uniform policy acceptance**.  
- Client post-job review: **Did pilot perform in proper uniform?**  
- Client may report uniform/appearance issues.  
- Admin controls: sanctions, demotion, profile visibility, job visibility, access termination.  
- Repeated violations → escalating sanctions.

---

## 11. Wings, badges, achievements

Pilot public profile displays:

- Grade + epaulette icon  
- Wings awarded  
- Profile photo · bio · FAA certificate info  
- Completed contracts · awards/certificates  

Wings are **rule-driven** and **admin-awarded** (examples):

| Wing | Criteria (summary) |
|------|-------------------|
| Basic / Senior / Master / Recreational / Remote Aviation Crew | Per Media Kit rules |
| Senior Wings | 500 remote flight hours OR FAA Recreational Pilot cert OR 5 perfect RAS contracts |
| Master Wings | 1,000 hours OR FAA Private Pilot cert AND 5 perfect RAS contracts |

Do not fake final certificate/wing artwork — client supplying templates/fonts.

---

## 12. Certificates & ID cards

| Item | Rule |
|------|------|
| Digital certificates | **Free** when earned; templates/fonts TBD |
| Physical ID card | Mailed after **30 approved days**; cost included in membership |
| Lead time | Allows pilot to obtain uniform + headshot |
| Not included in membership | Epaulettes, wings (shop purchase) |

---

## 13. Uniform shop

Products: epaulettes, wings, patches, uniform items, accessories, **Captain black polo** (unlocked at A-6 Captain — may be worn on jobs instead of white pilot shirt).

Certificates free when earned · ID card in membership · epaulettes/wings sold separately.

---

## 14. Captain's Club

- **Public route** (marketing) — alphabetical list of **active Captains (A-6)**.  
- Visible to visitors and clients.  
- Captain unlocks black polo customization (wings + name).

**Module:** M317 — not built yet.

---

## 15. Remote Rescue Guidance Squadron

- **Out of scope** until ~late 2027.  
- Document only in roadmap.  
- Eligibility note: 500 hours + A-3+ (subject to change).  
- **Do not implement.**

---

## 16. Figma re-alignment

Client has **updated Figma**. After this documentation pass:

1. Reconcile Figma with rules in this doc (membership, pricing, delays, Captain's Club).  
2. Record screen-by-screen in `figma-implementation-log.md`.  
3. Do not bulk-redesign code until functionality wiring milestones allow.

---

## Task list — where to update

### Documentation ✅ (this pass)

- [x] `NEW_FEATURES_COMPARISON.md`
- [x] `IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md` (this file)
- [x] `FUNCTIONALITY_WIRING_PLAN.md`
- [x] `BUILD_CONTROL.md` (M295+)
- [x] `dashboard-implementation-log.md` (source alignment entry)
- [x] `.cursor/rules/business-rules-ras.mdc` (agent module)

### Code — commission (safe updates)

- [x] `DEFAULT_COMMISSION_RATE` → 0.15
- [x] Hardcoded "10%" UI copy → use constant / 15%
- [ ] Per-pilot commission override (schema + admin UI) — M309

### Code — membership (deferred)

- [ ] Separate Product: annual $99.99 membership — M297
- [ ] Fast Forward one-time upgrade SKUs — M298
- [ ] Upgrade difference ledger — M299
- [ ] Remove monthly tier pricing from pilot subscription UI — M297
- [ ] Admin tier plans: split membership vs upgrade fees — M297
- [ ] Marketing/pricing page + Figma — M320

### Code — marketplace flow (next sprints)

- [ ] My Projects real data — M51
- [ ] Project bids wire + accept — M52–M55
- [ ] Client-initiated chat enforcement — M306
- [ ] Proposal +20% revision cap — M305
- [ ] Contract milestone fields — M307
- [ ] Escrow + 15% payout — M308

### Code — governance (later)

- [ ] Uniform policy acceptance — M311
- [ ] Client uniform review question — M312
- [ ] Admin sanctions — M313
- [ ] Grade promotion engine — M302
- [ ] Lapse + 30-day reactivation — M300–M301
- [ ] Captain's Club page — M317
- [ ] Instructor module — M316
- [ ] Squadron Vote disputes — M318

---

## Client clarifications still needed

1. Exact Fast Forward one-time fee table (A-2 through A-6).  
2. Fast Forward vs automatic time-based promotion — interaction rules.  
3. Commission buyout: 75% formula vs flat rate (post-launch).  
4. ID card: definition of "30 approved days."  
5. Final certificate template assets and fonts.  
6. Figma priority screens after membership model change.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-02 | Initial context from three source PDFs |
