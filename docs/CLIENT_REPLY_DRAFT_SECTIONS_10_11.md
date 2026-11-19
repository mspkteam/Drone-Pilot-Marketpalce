# Client reply pack — Sections 10 & 11 (draft)

**Purpose:** Material for one reply to the client.  
**Sources:** Original “RAS Website: Developer Tasks & Testing Notes” (13 Nov 2026) + current build (v0.27.134) + today’s open questions.

---

## A. The original nine comments (verbatim summary)

### 1. Pilot Reviews and One-Time Review Reset
Test the complete pilot review-request workflow. Add/verify a one-time paid option to remove reviews below 5★; keep 5★ unchanged; once only. Confirm price with client ($10 example). Confirm eligibility and UI placement. Test payment + admin records. Confirm original scope.

### 2. Voting System
Developer scenarios are visible; test the full process: who creates events / nominates; eligibility and limits; start/end dates; counting/results; anti-manipulation; admin permissions and audit; fix issues in agreed voting functionality.

### 3. Products, Cart and Checkout
Products not uploaded yet — full purchase untested. Once test products exist: create/edit, storefront display, cart qty/remove, shipping charges/address, checkout/payment, confirmation, refunds, admin order/transaction records. Separate product-data entry and new requests from defects.

### 4. Pilot Profiles and Regions
Profiles must show **two** pieces: **Home Region** (where the pilot belongs) and **Service Regions** (where they will work). Confirm separate DB fields; assignment/update rules; effect on search/eligibility/visibility. Review admin Regions tab and walk through purpose, management, permissions, and link to pilot coverage.

### 5. User Roles, Ranks and Account Statuses
Admin labels inconsistent (e.g. Multinational, Active Duty, Enterprise Client, Client, Squadron Lead, A1 Student, A6 Captain, A7 Senior Captain). Review all roles/statuses; explain meaning and who they apply to; classify (auth role vs plan vs org position vs rank vs affiliation vs status); valid combinations; effect on permissions/billing/workflows/public profiles; complete value list + DB origin; consistent structure; Super Admin assign/update/revoke; document process.

### 6. Subscription Plans
Plans + Edit Plan exist; full test pending payments. Editing must update public site; pricing/checkout; activation/benefits; renewals; cancellation/billing records; admin subscription info; fix defects once payments enabled.

### 7. Commission Calculation and Payment Splitting
Test against approved rules; percentages; allocation among parties; processor integration; failed/refund/reversal/cancel; reports vs actual transactions; fix calc/distribution defects.

### 8. Stripe Escrow / Payment-Holding Issue
Review ~7-day Stripe auth limit; confirm RAS hold period; whether Stripe supports longer hold; alternatives (charge now / delayed transfer / third-party escrow); feasibility, compliance, cost, limits; **recommend before implementing**.

### 9. Final Testing and Delivery
Test agreed features before approval; call out blockers (payments, missing products, pending RAS decisions); fix in-scope bugs without extra charge (subject to scope/warranty); separate genuine new features for approval; final status report per task (Status / Testing / Issues / Fixes / Client info needed).  
*Note from client:* points 6 & 9 subscription overlap; 7 & 8 commission overlap — combined to avoid duplicate work; keep Stripe holding separate.

---

## B. Status owed on comments 2, 3, 4, 5 (most urgent)

| # | Topic | Status | What we can tell the client |
|---|--------|--------|-----------------------------|
| **2** | Voting | **Done (agreed dispute squadron vote)** | A-4+ peer voting on disputes is live: party ban, one-vote lock, tallies, admin + pilot UIs, unit coverage. This is **dispute moderation**, not a separate elections product. If they meant general elections/nominations, that was never in the agreed dispute-vote scope — please confirm. |
| **3** | Shop cart/checkout | **Done (non-pay)** | Catalog CRUD, cart qty/remove, shipping estimate, demo place-order path work. **Blocked for full acceptance:** real product assets/catalog data + Stripe payment/refunds. |
| **4** | Home vs Service Regions | **Partial / still needs their model** | Admin **Operating Regions** exist and are managed in Admin → Regions. Pilots can now pick **service regions** on profile (where they will work) plus **city / state / country** as home base. We have **not** yet implemented a formal dual “Home Region” vs “Service Regions” schema as two first-class region entities wired into search/eligibility — that waited on their region model. Recent profile UX makes the distinction clearer; full search/eligibility wiring still needs their confirmation. |
| **5** | Roles / ranks / statuses | **Done for glossary + staff role change; more UI next** | We documented auth roles, account status, grades A-1–A-10, and personnel display labels (`docs/ROLES_RANKS_STATUSES.md`). Super Admin can change staff between Moderator/Admin. **Thank them for the full role list** — we will build a dedicated roles reference + admin screens from it. Labels like “Multinational / Active Duty” are **not** login roles in the app (display/affiliation confusion we cleaned up in the glossary). |

---

## C. Draft reply to the client (one message)

You can paste/adapt:

---

Hi [Name],

Thank you for the follow-ups — especially the full role list and the clarifications in today’s thread. Below is status on the earlier developer-task comments (2–5 first), then the open points we still need from you, plus a few confirmations on our side.

### 1) Status on earlier comments 2, 3, 4 and 5

**2 — Voting**  
Complete for the **agreed dispute / squadron peer-vote** flow (A-4+, parties cannot vote, one vote, tallies, admin + pilot UI). Please confirm you do **not** also need a separate elections / candidate-nomination product beyond dispute voting.

**3 — Products, cart, checkout**  
Cart, quantity, remove, shipping estimate, and demo checkout are working. Full purchase acceptance still needs **your product assets/catalog** and **Stripe** (payment + refunds).

**4 — Pilot profiles and regions**  
Admin Regions are live. Pilots can set **city/state/country** (home base) and select **service regions** (where they will take work). We still need your confirmation on the formal **Home Region vs Service Regions** model (separate fields, who assigns them, and whether they drive search/eligibility) before we wire the last mile.

**5 — Roles, ranks, statuses**  
Thank you for sending the complete role list — that answers the original Oct 10 question on our side. We have a roles/ranks/statuses glossary in place and Super Admin staff role management. **Next:** we will build the roles reference and admin screens from your list. Please treat that original roles question as closed once you confirm the list is the source of truth.

*(For completeness, the original nine task comments were: 1 Review reset · 2 Voting · 3 Shop · 4 Regions · 5 Roles · 6 Subscriptions · 7 Commission · 8 Stripe escrow hold · 9 Final testing. Happy to send a full matrix for 1 and 6–9 as well.)*

### 2) “Missing page” document

Please find the full record reattached. It is **13 pages**, including a contents list. If anything still looks truncated on your side, say which page/section number you last see and we will resend that slice.

### 3) Questions we still need answered

**21-day window**  
Please confirm measurement: we recommend **booking date → job end date**. Alternatives are posting date and/or job start date — which do you want locked in for T&Cs?

**Background check ($20)**  
Cost noted. Still needed: (a) is the $20 refundable if the pilot fails? (b) are pilots blocked from jobs until cleared? (c) is the check repeated at membership renewal?

**Roles (follow-ups from your list)**  
1. Typo check: “super admin or super admin” — please confirm intended wording.  
2. May admins create admin-level roles (e.g. Group XO), or only Super Admin?  
3. Squadron XO promotion that would change nothing — please clarify intended effect.  
4. How do units map to cities and regions?  
5. Does Wing have commanders?  
6. What do A-7–A-10 hold (marketplace same as A-6, Captain’s Club, no certificates — please confirm or correct)?  
7. What exactly do Squadron Commanders vote on (dispute peer vote only, or more)?

**Countries / currency**  
1. RAS country of incorporation?  
2. Which EU countries first after the US?  
3. USD only, or local currencies at launch?

**Reviews**  
1. Is re-rating / review-reset free or paid (and amount if paid)?  
2. Grounds for removing a review (admin policy)?

**Per-pilot commission overrides**  
Still unanswered from our original list: confirm Super Admin may set a custom % per pilot (we already have the admin capability drafted/built on the platform side — we need your business rule sign-off).

### 4) Confirmations from our side

- We will update Terms & Conditions for the **non-refundable 6% fee**, the **14-day release**, and the **21-day limit** (clauses for counsel review).  
- **Jason Maxwell** will receive a test script.  
- Background check will be **manual**: payment page + admin queue only — **no third-party integration** in this phase.  
- **All three review options** will be built.  
- **EU and progressive nations** come first after the US, subject to counsel review.

Please reply to the questions in §3 when you can — those unlock the remaining policy wording and a few admin screens.

Thanks,  
[Name]

---

## D. Suggested answers we already prefer (internal only — do not send without agreement)

| Topic | Suggested stance |
|-------|------------------|
| 21-day window | Booking date → job **end** date |
| Background check | Manual; ask refund / block / renewal |
| A-7–A-10 | Honorary; marketplace as A-6; Captain’s Club; no certificates; Super Admin invite only |
| Commission override | Yes, Super Admin only; default 15% |
| Roles admin screens | Build from their list; thank them; close Oct 10 question |

---

## E. Quick internal note on comment 4 honesty

Do **not** claim Home Region + Service Regions are fully dual-modeled in search/eligibility yet. Claim: admin regions + pilot service-region chips + city/state home base UX shipped; formal dual-region rules still need client confirmation.
