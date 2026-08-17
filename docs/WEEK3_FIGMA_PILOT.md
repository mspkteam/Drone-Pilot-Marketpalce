# Week 3 — Pilot Dashboard Figma Map

**Figma file:** [remote-air-service](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service)  
**Section label:** `PILOT DASHBOARD` (`970:4239`) — frames on the `all pages` canvas around `y ≈ 3919`  
**Workflow:** [`FIGMA_IMPLEMENTATION_WORKFLOW.md`](FIGMA_IMPLEMENTATION_WORKFLOW.md) (ADR-009)  
**Approach:** **Design first** — take **layout** from Figma (structure, hierarchy, spacing, grids). Keep the **site color scheme** from `globals.css` / dashboard tokens (do not paste Figma hex as a parallel palette).

> Current app pilot routes are functionally live but visually interim. Treat each screen as: Figma review → UI layout pass (site colors) → functionality gap-close.

---

## Screen inventory

| # | Figma frame | Node | App route | Priority | Design status | Notes |
|---|-------------|------|-----------|----------|---------------|-------|
| 1 | dashboard | [`808:16888`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-16888) / Main [`808:17230`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-17230) | `/dashboard/pilot` | **High** | **UI implemented** (Main) | Shell sidebar follow-up; functionality gaps deferred |
| 2 | Mission Marketplace | [`808:17557`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-17557) / Main [`808:17880`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-17880) | `/dashboard/pilot/jobs` | **High** | **UI implemented** (Main) | Browse approved jobs; GRADE/DISTANCE filters deferred |
| 3 | Locked Jobs | [`808:18154`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18154) / Main [`808:18477`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18477) | `/dashboard/pilot/locked-jobs` | **High** | **UI implemented** (Main) | Grade visibility countdown |
| 4 | My Proposals | [`808:18659`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18659) / Main [`808:18982`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18982) | `/dashboard/pilot/proposals` | **High** | **UI implemented** (Main) | Status tabs |
| 5 | new PROPOSAL SUBMISSION | [`1171:4339`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1171-4339) / Container [`1171:4661`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1171-4661) | `/dashboard/pilot/jobs/[id]/proposal` | **High** | **UI implemented** | Extended bid form; Submit Application opens terms overlay [`1171:5545`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1171-5545) |
| 6 | Active Contracts | [`808:19635`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-19635) | `/dashboard/pilot/contracts` | **High** | Pending review | Delivery handoff |
| 7 | Messages | [`808:20108`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-20108) | `/dashboard/pilot/messages` | Medium | Pending review | Client-initiated threads |
| 8 | Profile | [`808:19119`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-19119) / Main [`808:19441`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-19441) | `/dashboard/pilot/profile` | Medium | **UI implemented** (Main) | Extras persist (`profileExtrasJson`); gallery from `portfolioJson` |
| 9 | Portfolio | [`808:21065`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-21065) / Main [`808:21066`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-21066) | `/dashboard/pilot/portfolio` | Medium | **UI implemented** (Main) | Live gallery; linked from profile |
| 10 | reviews | [`808:23642`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-23642) / Main [`808:23643`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-23643) | `/dashboard/pilot/reviews` | Medium | **UI implemented** (Main) | Dispute → contracts; Reset → support |
| 11 | Membership | [`1160:4704`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1160-4704) / Main [`1160:4705`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1160-4705) | `/dashboard/pilot/subscription` | **High** | **UI implemented** (Main) | Unlocked at M3; Stripe still demo |
| 12 | Uniform | [`808:22234`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-22234) / Container [`808:22235`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-22235) | `/dashboard/pilot/shop` | Low | **UI implemented** (Container) | Figma SKUs + lock/cart; Stripe later |
| 13 | Support | [`808:22755`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-22755) | `/dashboard/pilot/support` | Low | **UI implemented** | Help articles + Ground Control ticket |
| 14 | SETTINGS | [`808:23194`](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-23194) | `/dashboard/pilot/settings` | Medium | **UI implemented** | 30-day reactivation; Stripe later |

**Also in Week 3 (no dedicated Figma frames found):** Verifications (`/dashboard/pilot/verifications`), Earnings (`/dashboard/pilot/payments`) — chrome aligned to marketplace headers (`PILOT / VERIFICATION`, `BUSINESS / EARNINGS`).

---

## Per-screen process (design-first)

1. Open Figma frame URL → `get_screenshot` + `get_design_context`
2. Pre-implementation review (layout, tokens, components) — **no code until review**
3. **UI pass only:** shell, typography scale, spacing, cards, empty states — **layout from Figma, colors from site tokens** (keep existing APIs)
4. Log in [`figma-implementation-log.md`](figma-implementation-log.md)
5. **Functionality pass** only for gaps found in that screen

---

## Suggested order

1. Pilot shell + **dashboard** overview  
2. Mission Marketplace → Locked Jobs  
3. My Proposals → Proposal submission  
4. Active Contracts (delivery UI)  
5. Membership  
6. Messages / Profile / Portfolio / Reviews  
7. Settings / Support / Uniform (as needed)

---

## Related

- Client Figma map: [`PHASE1_FIGMA_CHECKLIST.md`](PHASE1_FIGMA_CHECKLIST.md)  
- Admin Figma map: [`WEEK2_FIGMA_ADMIN.md`](WEEK2_FIGMA_ADMIN.md)  
- Pilot checklist: [`WEEK3_CHECKLIST.md`](WEEK3_CHECKLIST.md)
