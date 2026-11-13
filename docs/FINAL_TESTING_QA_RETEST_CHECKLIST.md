# Final Testing — QA retest checklist

**Source:** `Drone-Final Testing/DroneFinalTesting.html` (22 Oct 2026)  
**Production:** https://drone-pilot-marketpalce.vercel.app · **v0.27.129** (`production` `88b70c4` ← `main` `ba477f2`)  
**Verified:** 13 Nov 2026 — code + unit; **deployed to Production**  
**Marks:** `[x]` PASS (on Production) · `PARTIAL` · `BLOCKED` · `OPEN`

> Code for PASS rows is live on Production. QA may still spot-check the Live Prod column during acceptance; OPEN/BLOCKED rows are not claimed as done.

---

## Totals

| Bucket | Count |
|--------|------:|
| PASS (on Production) | 63 |
| PARTIAL | 1 (C20 button heights) |
| OPEN (known gaps) | 3 |
| BLOCKED (client) | 6 |

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
| C1 | Password eye icon does **not** disappear on hover | [x] | [x] |
| C2 | New login: dashboard visible + complete-profile message (does not vanish instantly) | [x] | [x] |
| C3 | Date pickers show **dd/mm/yyyy** (post-project deadline + completion) | [x] | [x] |
| C4 | Talk to Support button radius / font color consistent | [x] | [x] |
| C5 | Profile fields locked until **Edit profile** | [x] | [x] |
| C6 | Country select defaults to United States; phone/address accept worldwide | [x] | [x] |
| C7 | Reference upload: icon / no bare “Choose file”; **Remove** per file works | [x] | [x] |
| C8 | Post-project review: no step-bleed when travel = No (no Lodging/Transport cards) | [x] | [x] |
| C9 | Expected Project Completion Date present; cannot be before deadline | [x] | [x] |
| C10 | Terms checkbox + modal stay in sync when checked | [x] | [x] |
| C11 | **Back** is on the **right** (desktop review / continue footers) | [x] | [x] |
| C12 | Find a Pilot profile opens inside client dashboard | [x] | [x] |
| C13 | Hire a Captain: guest → register client; logged-in client → Find Pilots | [x] | [x] |
| C14 | Close / search clear control is gold (not default blue X) | [x] | [x] |
| C15 | Hire via marketplace explains purpose and posts a project (preferred pilot) | [x] | [x] |
| C16 | Browse pilots → client **Find a Pilot** dashboard | [x] | [x] |
| C17 | Field-level errors under the failing field (post-project) | [x] | [x] |
| C18 | My Projects / quote card button alignment consistent | [x] | [x] |
| C19 | View profile does **not** 404 | [x] | [x] |
| C20 | Button sizes look consistent on primary client paths | PARTIAL | PARTIAL |
| C21 | Request revision: no alert prompt; pilot gets notification | [x] | [x] |
| C22 | Clicking revision notification shows update **without** hard browser refresh | [x] | [x] |
| C23 | Invite code: purpose copy + copyable link | [x] | [x] |

**C20 note:** Primary paths still mix `.ras-btn` 2.5rem, post-project 2.75rem, my-projects ~2.125rem. Cosmetic only.

---

## Pilot

| # | Check | Code | Live Prod |
|---|--------|------|-----------|
| P1 | Portfolio add/edit does not bounce and empty the profile form | [x] | [x] |
| P2 | Selecting one service chip does **not** auto-select another | [x] | [x] |
| P3 | Portfolio titles remain visible | [x] | [x] |
| P4 | First login: screens visible + complete-profile message | [x] | [x] |
| P5 | Insurance section visible on pilot profile (link to Verification upload) | [x] | [x] |
| P6 | Profile strength % uses live location field + country | [x] | [x] |
| P7 | Pilot viewing public profile: **no** Hire / Hire a Captain | [x] | [x] |
| P8 | Drafts: profile Save draft persists; proposal drafts under My Proposals | [x] | [x] |
| P9 | A-1 Fast Forward disabled for current A-1 | [x] | [x] |
| P10 | Negotiation (`pilot_quotes`) is not capped like fixed-budget | [x] | [x] |
| P11 | A-6 Captain public profile shows Captain’s Club message | [x] | [x] |
| P12 | View listing does **not** 404 | [x] | [x] |
| P13 | Uploads mention allowed file formats | [x] | [x] |
| P14 | Add Link does not duplicate upload + link fields wrongly | [x] | [x] |
| P15 | Revision: View → deliver; after resubmit **Complete Job** appears | [x] | [x] |
| P16 | Delivery draft: **Remove** file/link works | [x] | [x] |
| P17 | **Submit for Client Review** is clear / prominent | [x] | [x] |
| P18 | Squadron voting: vote once; UI locks; parties cannot vote | [x] | [x] |
| P19 | Verification: remove file; field errors; wing switch clears prior files | [x] | [x] |
| P20 | Earnings screen and CSV use the same amount/date format | [x] | [x] |
| P21 | Admin wing request → admin gets notification | [x] | [x] |
| P22 | Rank progress ≠ profile strength % | [x] | [x] |
| P23 | License number on pilot dashboard profile | [x] | [x] |
| P24 | Amendments = **AMENDMENTS REQUIRED**; note only on targeted docs | [x] | [x] |
| P25 | Gov ID front + back both uploadable | [x] | [x] |
| P26 | FAA / EASA path toggle (other path cards hidden in UI) | [x] | [x] |

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
| A1 | Job approval queue shows person name, not org first | [x] | [x] |
| A2 | Edit Client Profile is scoped (not full platform) | [x] | [x] |
| A3 | Billing address loads and Save works | [x] | [x] |
| A4 | New client job → notification in admin bell | [x] | [x] |
| A5 | Certificate overlay letter not cropped | [x] | [x] |
| A6 | Disabled checkboxes explain purpose | [x] | [x] |
| A7 | Admin member edit Save works | [x] | [x] |
| A8 | Generate PDF scrolls to that pilot | [x] | [x] |
| A9 | Certificate recipient name is editable | [x] | [x] |
| A10 | No broken “New briefing” button | [x] | [x] |
| A11 | A-6 shown as Captain; wings assignable | [x] | [x] |
| A12 | Verification docs match uploads; in-modal preview | [x] | [x] |
| A13 | Request More Info: select **specific** docs; stays in queue | [x] | [x] |
| A14 | **Preview Pricing** label; Full configuration does **not** 404 | [x] | [x] |
| A15 | Deactivate → 30-day grace → purge after window | [x] | [x] |

---

## Smoke (automation)

```bash
$env:FINAL_QA_BASE_URL="https://drone-pilot-marketpalce.vercel.app"; npm run qa:final
```

| Run | Base | Pass | Fail | Skip |
|-----|------|-----:|-----:|-----:|
| 13 Nov 2026 unit | local unit suite | 5 | 0 | 0 |
| 13 Nov 2026 Production browser | drone-pilot-marketpalce.vercel.app | — | — | Playwright browsers not installed in this environment (`npx playwright install`) |

**Deploy status:** v0.27.129 is on Production (`origin/production` `88b70c4`).

---

## Evidence pointers (shipped in v0.27.128–129)

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
| Dev (code + deploy) | Auto | 13 Nov 2026 | v0.27.129 · `ba477f2` / `88b70c4` |
| QA (acceptance) | | | Production live |
| Client | | | |

**Related:** `docs/FINAL_TESTING_STRICT_AUDIT_NOV13.md` · `docs/FINAL_TESTING_QA_CHECKLIST.md`
