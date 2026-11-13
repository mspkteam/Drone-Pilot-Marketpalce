# Final Testing — strict audit (13 Nov 2026)

**Source:** `d:\Desktop\Drone-Final Testing\DroneFinalTesting.html` (22 Oct 2026) + 80 QA screenshots.  
**Codebase:** v0.27.129.  
**Retest sheet:** `docs/FINAL_TESTING_QA_RETEST_CHECKLIST.md`.  
**Method:** Re-read every HTML bullet; compare to code + QA screenshots. Do **not** treat prior “71 Done” checklist as proof.

## Honest bottom line

Earlier checklists over-claimed relative to the HTML extras and some screenshot UI. Several items were already fixed in code but **not** what QA’s older screenshots show (e.g. native long-form dates / bare “Choose files”). This pass **fixed real remaining gaps** listed below. Stripe / shop assets / region timezone stay **Blocked**.

## Gaps fixed in v0.27.128–0.27.129

| Area | QA ask | Fix |
|------|--------|-----|
| Client | Delete uploaded reference files | Per-file Remove on post-project |
| Client | Travel step-bleed on review | Lodging/Transport cards hidden when travel = No |
| Client | Find Pilots clear X color | Gold webkit search cancel |
| Client / Pilot | Revision UI needs refresh | Notification `router.refresh()` + delivery refetch on focus |
| Client / Pilot | “Submit for Client Review” prominence | Large primary CTA; correct label on resubmit |
| Pilot | Location missing in strength while city filled | Strength reads live location field; Country next to Location |
| Pilot | dd/mm/yyyy on bid date | `PostProjectDateField` on bid form |
| Pilot | Delivery file delete | Remove on draft/revision items + DELETE API |
| Pilot | Complete Job wrong phase | Only after resubmit (`awaiting_review`) |
| Pilot | Vote UI after casting | Buttons disabled; party disputes blocked in UI |
| Admin | Request More Info on every card | Select target document(s) before send |
| Admin | Button text “Preview Pricing” | Commissions + Subscriptions labels |
| Admin | 30-day grace then auto permanent delete | Soft deactivate on admin delete; daily cron purge; login-time purge |

## Still Blocked (client / product)

| Item | Reason |
|------|--------|
| Client BILLING / Invoice PDF | Stripe |
| Pilot payment method / SMTP realtime | Stripe / SMTP |
| Shop product pictures | Assets |
| Delayed notifications / timezone by region | Region policy deferred |

## Code already present (QA screenshots may be stale)

Treat as **Done in current code**; ask QA to retest on latest Production after deploy:

- Post-project dd/mm/yyyy (`PostProjectDateField`) — screenshot `image2` still shows OS long date + “Choose files”
- Back button on the right (review footer CSS) — screenshot `image4` shows old centered Back
- Hire a Captain: guest → register; client → find-pilots; pilot CTAs hidden
- Verification file Remove, amendments status, hire CTA tests
- Insurance block on pilot profile (upload via Verification)

## Residual / needs live click-through

| Item | Note |
|------|------|
| Onboarding toast “must not disappear instantly” | Gate stays; toast timing VISUAL |
| Profile wipe when leaving verification | Unsaved editor state — Save draft required; no autosave yet |
| Support chat “automated” | **GAP by product copy** — widget says staffed / no auto-replies (not Stripe-blocked) |
| Verification “Submit for Verification” after upload | Still auto-submits on upload |
| Certificate PDF scroll / name edit | Recipient name field exists; not re-clicked |
| Mixed button heights | Cosmetic PARTIAL |

## Automation

`npm run qa:final` covers smoke shells + unit helpers; it does **not** prove every visual HTML bullet. Use this doc + live QA, not automation alone.
