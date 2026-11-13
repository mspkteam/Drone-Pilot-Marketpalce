# Final Testing — QA retest checklist

**Source:** `Drone-Final Testing/DroneFinalTesting.html` (22 Oct 2026)  
**Build verified:** v0.27.129 (local `main`, uncommitted/unpushed vs Production `v0.27.127`)  
**Verified:** 13 Nov 2026 — **code + unit** (`npm run qa:final` unit suite **5 pass / 0 fail**)  
**Marks:** `[x]` code PASS · `PARTIAL` · `BLOCKED` · `OPEN` · `[ ]` not live-clicked on Production yet

> **Honesty:** Rows marked `[x]` are verified in **current local source**. They are **not** yet confirmed on Production until you push/deploy v0.27.129 and QA re-clicks. Live Production column left blank for QA.

---

## Totals (code verification)

| Bucket | Count |
|--------|------:|
| PASS (code) | 63 |
| PARTIAL | 1 (C20 button heights) |
| OPEN (known gaps) | 3 |
| BLOCKED (client) | 6 |
| Unit smoke | 5 pass / 0 fail |

---

## Blocked (do not fail the build on these)

| # | Item | Owner | Verified |
|---|------|--------|----------|
| B1 | Client BILLING — add / manage payment method | Stripe | BLOCKED |
| B2 | Client Invoice PDF download | Stripe | BLOCKED |
| B3 | Pilot payment method realtime | Stripe | BLOCKED |
| B4 | Pilot payment + SMTP realtime | Stripe / SMTP | BLOCKED |
| B5 | Shop product pictures match product names | Client assets | BLOCKED |
| B6 | Notifications delayed / timezone by region | Region policy | BLOCKED |

---

## Client

| # | Check | Code | Live Prod |
|---|--------|------|-----------|
| C1 | Password eye icon does **not** disappear on hover | [x] | [ ] |
| C2 | New login: dashboard visible + complete-profile message (does not vanish instantly) | [x] | [ ] |
| C3 | Date pickers show **dd/mm/yyyy** (post-project deadline + completion) | [x] | [ ] |
| C4 | Talk to Support button radius / font color consistent | [x] | [ ] |
| C5 | Profile fields locked until **Edit profile** | [x] | [ ] |
| C6 | Country select defaults to United States; phone/address accept worldwide | [x] | [ ] |
| C7 | Reference upload: icon / no bare “Choose file”; **Remove** per file works | [x] | [ ] |
| C8 | Post-project review: no step-bleed when travel = No (no Lodging/Transport cards) | [x] | [ ] |
| C9 | Expected Project Completion Date present; cannot be before deadline | [x] | [ ] |
| C10 | Terms checkbox + modal stay in sync when checked | [x] | [ ] |
| C11 | **Back** is on the **right** (desktop review / continue footers) | [x] | [ ] |
| C12 | Find a Pilot profile opens inside client dashboard | [x] | [ ] |
| C13 | Hire a Captain: guest → register client; logged-in client → Find Pilots | [x] | [ ] |
| C14 | Close / search clear control is gold (not default blue X) | [x] | [ ] |
| C15 | Hire via marketplace explains purpose and posts a project (preferred pilot) | [x] | [ ] |
| C16 | Browse pilots → client **Find a Pilot** dashboard | [x] | [ ] |
| C17 | Field-level errors under the failing field (post-project) | [x] | [ ] |
| C18 | My Projects / quote card button alignment consistent | [x] | [ ] |
| C19 | View profile does **not** 404 | [x] | [ ] |
| C20 | Button sizes look consistent on primary client paths | PARTIAL | [ ] |
| C21 | Request revision: no alert prompt; pilot gets notification | [x] | [ ] |
| C22 | Clicking revision notification shows update **without** hard browser refresh | [x] | [ ] |
| C23 | Invite code: purpose copy + copyable link | [x] | [ ] |

**C20 note:** Primary paths still mix `.ras-btn` 2.5rem, post-project 2.75rem, my-projects ~2.125rem. Cosmetic only.

---

## Pilot

| # | Check | Code | Live Prod |
|---|--------|------|-----------|
| P1 | Portfolio add/edit does not bounce and empty the profile form | [x] | [ ] |
| P2 | Selecting one service chip does **not** auto-select another | [x] | [ ] |
| P3 | Portfolio titles remain visible | [x] | [ ] |
| P4 | First login: screens visible + complete-profile message | [x] | [ ] |
| P5 | Insurance section visible on pilot profile (link to Verification upload) | [x] | [ ] |
| P6 | Profile strength % uses live location field + country | [x] | [ ] |
| P7 | Pilot viewing public profile: **no** Hire / Hire a Captain | [x] | [ ] |
| P8 | Drafts: profile Save draft persists; proposal drafts under My Proposals | [x] | [ ] |
| P9 | A-1 Fast Forward disabled for current A-1 | [x] | [ ] |
| P10 | Negotiation (`pilot_quotes`) is not capped like fixed-budget | [x] | [ ] |
| P11 | A-6 Captain public profile shows Captain’s Club message | [x] | [ ] |
| P12 | View listing does **not** 404 | [x] | [ ] |
| P13 | Uploads mention allowed file formats | [x] | [ ] |
| P14 | Add Link does not duplicate upload + link fields wrongly | [x] | [ ] |
| P15 | Revision: View → deliver; after resubmit **Complete Job** appears | [x] | [ ] |
| P16 | Delivery draft: **Remove** file/link works | [x] | [ ] |
| P17 | **Submit for Client Review** is clear / prominent | [x] | [ ] |
| P18 | Squadron voting: vote once; UI locks; parties cannot vote | [x] | [ ] |
| P19 | Verification: remove file; field errors; wing switch clears prior files | [x] | [ ] |
| P20 | Earnings screen and CSV use the same amount/date format | [x] | [ ] |
| P21 | Admin wing request → admin gets notification | [x] | [ ] |
| P22 | Rank progress ≠ profile strength % | [x] | [ ] |
| P23 | License number on pilot dashboard profile | [x] | [ ] |
| P24 | Amendments = **AMENDMENTS REQUIRED**; note only on targeted docs | [x] | [ ] |
| P25 | Gov ID front + back both uploadable | [x] | [ ] |
| P26 | FAA / EASA path toggle (other path cards hidden in UI) | [x] | [ ] |

### Pilot — still OPEN

| # | Item | Status | Notes |
|---|------|--------|-------|
| P-OPEN1 | Support chat “automated” | OPEN | Staffed chat; no auto-replies by design |
| P-OPEN2 | Leave profile → Verification without Save draft | OPEN | No autosave |
| P-OPEN3 | Manual “Submit for Verification” after upload | OPEN | Upload still submits immediately |

---

## Admin

| # | Check | Code | Live Prod |
|---|--------|------|-----------|
| A1 | Job approval queue shows person name, not org first | [x] | [ ] |
| A2 | Edit Client Profile is scoped (not full platform) | [x] | [ ] |
| A3 | Billing address loads and Save works | [x] | [ ] |
| A4 | New client job → notification in admin bell | [x] | [ ] |
| A5 | Certificate overlay letter not cropped | [x] | [ ] |
| A6 | Disabled checkboxes explain purpose | [x] | [ ] |
| A7 | Admin member edit Save works | [x] | [ ] |
| A8 | Generate PDF scrolls to that pilot | [x] | [ ] |
| A9 | Certificate recipient name is editable | [x] | [ ] |
| A10 | No broken “New briefing” button | [x] | [ ] |
| A11 | A-6 shown as Captain; wings assignable | [x] | [ ] |
| A12 | Verification docs match uploads; in-modal preview | [x] | [ ] |
| A13 | Request More Info: select **specific** docs; stays in queue | [x] | [ ] |
| A14 | **Preview Pricing** label; Full configuration does **not** 404 | [x] | [ ] |
| A15 | Deactivate → 30-day grace → purge after window | [x] | [ ] |

---

## Smoke (automation)

```bash
# Unit only (ran 13 Nov 2026):
$env:FINAL_QA_SUITES="unit"; npm run qa:final
# → 5 pass · 0 fail · 0 skip

# After deploy to Production:
$env:FINAL_QA_BASE_URL="https://drone-pilot-marketpalce.vercel.app"; npm run qa:final
```

| Run | Base | Pass | Fail | Skip |
|-----|------|-----:|-----:|-----:|
| 13 Nov 2026 unit | localhost (unit suite) | 5 | 0 | 0 |
| Full browser vs Production | — | — | — | pending deploy of v0.27.129 |

---

## Evidence pointers (new in v0.27.128–129)

| Fix | Evidence |
|-----|----------|
| Reference file Remove | `PostProjectStepRequirements.tsx` |
| Travel No hides lodging/transport | `buildPostProjectTravelSummary` in `post-project.ts` |
| Gold search clear | `client-find-pilots.css` `::-webkit-search-cancel-button` |
| Notification refresh | `NotificationBell.tsx` `router.refresh()` |
| Delivery Remove | `removeDeliveryItem` + DELETE `/api/pilot/.../files/[fileId]` |
| Complete Job phase | `contract-actions.ts` `awaiting_review` |
| Request More Info select docs | `AdminVerificationPortal.tsx` `targetDocIds` |
| Preview Pricing | `AdminCommissionsPortal.tsx`, `AdminTierPlansPortal.tsx` |
| 30-day purge | `deactivation.ts` + `/api/cron/purge-deactivated` |

---

## Sign-off

| Role | Name | Date | Build / commit |
|------|------|------|----------------|
| Dev (code verify) | Auto | 13 Nov 2026 | v0.27.129 local |
| QA (live Prod) | | | after push |
| Client | | | |

**Related:** `docs/FINAL_TESTING_STRICT_AUDIT_NOV13.md` · `docs/FINAL_TESTING_QA_CHECKLIST.md`
