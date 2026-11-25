# RAS Website — Developer Tasks & Testing Notes (status)

**Source:** Client feedback 13 Nov 2026  
**Codebase:** v0.27.139  
**Scope cut (confirmed):** no Stripe/escrow · no Milestone 5 launch package  
**Client reply pack:** `docs/CLIENT_REPLY_DRAFT_SECTIONS_10_11.md`

| # | Task | Status | Testing / notes | Client still needed |
|---|------|--------|-----------------|---------------------|
| 1 | Pilot review reset | **Completed** (non-pay) | Lifetime once after approve; 5★ untouched; admin audit; fee note TBD | Confirm fee amount when payments enabled |
| 2 | Voting (dispute squadron) | **Completed** | A-4+, party ban, one vote lock, tallies, admin/pilot UIs + unit tests | Confirm no separate elections product |
| 3 | Shop catalog/cart/checkout | **Completed** (non-pay) | Qty/remove, shipping estimate, demo place order; catalog CRUD exists | Product assets / real catalog data |
| 4 | Home vs Service Regions | **Partial** | Admin Operating Regions; pilot city/state + service-region chips on profile; not full dual-region search/eligibility yet | Formal Home vs Service model + search rules |
| 5 | Roles / ranks / statuses | **Completed** (glossary) · **Next:** admin screens from their list | Glossary doc; display labels; Super Admin staff role change | Confirm their full role list is source of truth |
| 6 | Subscription plans | **Completed** (non-pay) | Admin plan edits sync to public `/pricing` | Stripe for paid lifecycle later |
| 7 | Commission calc / split | **Completed** (calc only) | 15% + override path + unit tests; no processor | Stripe escrow/payouts later |
| 8 | Stripe escrow hold | **Blocked** | Research only — not implemented | Recommended approach approval |
| 9 | Final testing / delivery | **In Progress** | Final QA B6 timezone done; 5 Blocked remain (Stripe/shop) | Unblock Stripe / shop assets |

## Not in this release

- Stripe / Connect / escrow / paid review-reset charge  
- Home Region vs Service Regions  
- Milestone 5 (SEO, a11y program, launch checklist packaging)
