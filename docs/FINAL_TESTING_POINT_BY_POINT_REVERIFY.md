# Final Testing — point-by-point re-verify (13 Nov 2026)

**Sources:** `d:\Desktop\Drone-Final Testing\DroneFinalTesting.html` (QA Bugs Report, 22 Oct 2026) · sticky PDF comments · `docs/FINAL_TESTING_QA_CHECKLIST.md` · codebase @ v0.27.126 · Production `qa:final` (37 pass / 0 fail / 6 skip).

**Method:** Code + unit/automation evidence for each consolidated checklist row. HTML has more narrative bullets than checklist numbers; extras called out at the end.

**Legend:** `DONE` code/automation evidence · `BLOCKED` waiting on client · `SMOKE` covered by Production `qa:final` · `VISUAL` Done by prior fix; not re-clicked visually this pass · `GAP` missing or incomplete vs HTML.

---

## Totals

| Bucket | Count |
|--------|------:|
| Checklist Done | 71 |
| Checklist Blocked | 6 |
| Production automation pass | 37 |
| Production automation skip (Blocked) | 6 |
| HTML-only extras (not on checklist) | see § Extras |

---

## Client (checklist #1–24)

| # | Item | Verdict | Evidence / note |
|---|------|---------|-----------------|
| 1 | Password eye hover | DONE · VISUAL | `PasswordField` gold eye, `z-10`, no hide-on-hover |
| 2 | New login dashboard + complete-profile | DONE · SMOKE | `OnboardingGate` + empty overview; C2 pass |
| 3 | Date format dd/mm/yyyy | DONE · SMOKE | `formatIsoDateForDisplay`; C3-unit pass |
| 4 | BILLING payment method | BLOCKED | Stripe — skipped |
| 5 | Talk to Support radius/color | DONE · VISUAL | Shared support button styles |
| 6 | Profile not editable; Edit option | DONE · SMOKE | C6 pass |
| 7 | Country/region/phone (US default) | DONE · SMOKE | Global `CountrySelect`; C7 pass |
| 8 | File upload icon / no bare Choose file | DONE · VISUAL | Proposal/post-project upload UX |
| 9 | Post-project step-bleed | DONE · SMOKE | normalize persist + C9-unit |
| 10 | Expected completion + date conflict | DONE | Client + server date order check |
| 11 | Terms checkbox / popup state | DONE | Shared `termsAcknowledged` |
| 12 | Back button to the right | DONE · SMOKE | C12 pass |
| 13 | Find a Pilot profile in dashboard | DONE · SMOKE | C13 pass |
| 14 | Hire a Captain redirect | DONE · SMOKE | C14 / C14-guest / hire-cta |
| 15 | Close icon color | DONE · VISUAL | Job-approval modal gold |
| 16 | Hire via marketplace purpose | DONE · SMOKE | Guest/client only; C16-pilot |
| 17 | Browse a pilot → Find Pilots | DONE · SMOKE | C17 pass |
| 18 | Field-level error/success | DONE · VISUAL | Budget/post-project field errors |
| 19 | Button alignment | DONE · VISUAL | Post-project footer spacing |
| 20 | View profile 404 | DONE · SMOKE | `/pilots/[id]` + client find-pilots; C20 |
| 21 | Button sizes consistent | DONE · VISUAL | Shared heights; some legacy `.ras-btn` |
| 22 | Revision: no prompt; pilot receives | DONE | Delivery revision workflow + notifications |
| 23 | Invoice PDF | BLOCKED | Stripe — skipped |
| 24 | Invite code copyable + purpose | DONE · SMOKE | Client settings invite link; C24 |

**Sticky extras (near Client #20–21):** Admin can approve client (`AdminClientsPanel` / personnel) · Pilot proposal submit (v0.27.114 drafts) — DONE.

---

## Pilot (checklist #1–33)

| # | Item | Verdict | Evidence / note |
|---|------|---------|-----------------|
| 1 | Portfolio bounce emptying fields | DONE | Portfolio editor persistence (0.27.104–106) |
| 2 | Service chips no auto-select | DONE · SMOKE | P2-unit |
| 3 | Portfolio titles remain visible | DONE · VISUAL | 2-line gallery captions |
| 4 | First login screens + complete profile | DONE · SMOKE | OnboardingGate; P4 / P4-deep |
| 5 | Popup height/width / remove margin | DONE · VISUAL | Modal CSS polish |
| 6 | Highlighted links | DONE · VISUAL | Correct hrefs |
| 7 | Insurance section | DONE | Pilot profile insurance fields |
| 8 | Profile strength % mismatch | DONE | Shared `computePilotProfileStrength*` |
| 9 | Hire on public profile (pilot viewer) | DONE · SMOKE | `canHirePilot`; P9 |
| 10 | Pilot cannot hire captain | DONE · SMOKE | P10 |
| 11 | Where drafts saved | DONE · SMOKE | Proposals; P11 |
| 12 | Button margin | DONE · VISUAL | |
| 13 | A-1 Fast Forward disabled | DONE · SMOKE | P13 |
| 14 | Instructor student code | DONE | Instructor dashboard + student section |
| 15 | Negotiation vs fixed-budget | DONE | Quotes not capped by fixed max (changelog) |
| 16 | A-6 Captain profile message | DONE | Grade/Captain’s Club copy |
| 17 | View listing 404 | DONE | Listing routes fixed |
| 18 | Mention file format | DONE | `accept=` + copy on uploads |
| 19 | Add Link duplication | DONE | Portfolio/link UX |
| 20 | Revision View + Complete Job | DONE | Contract actions + messages intent |
| 21 | Dispute / squadron voting | DONE · SMOKE | P21 + admin squadron |
| 22 | Verification file-type/remove/errors/wing/drafts | DONE | Verification views + wing draft clear |
| 23 | CSV vs earnings format | DONE | Earnings export aligned |
| 24 | View profile / Need info buttons | DONE | Admin/pilot verification actions |
| 25 | Payment method realtime | BLOCKED | Stripe |
| 26 | View Profile 404 | DONE | Public + dashboard profiles |
| 27 | Admin wing notification | DONE | `triggerWingRequestSubmitted` |
| 28 | Product pictures vs name | BLOCKED | Shop assets |
| 29 | Payment + SMTP realtime | BLOCKED | Stripe/SMTP prod |
| 30 | Support chat automated | DONE | Support chat flows |
| 31 | Rank ≠ profile progress | DONE · SMOKE | P31 |
| 32 | License on pilot dashboard | DONE · SMOKE | P32 |
| 33 | Amendments vs Rejected / comments | DONE · SMOKE | AMENDMENTS REQUIRED; P33 |

**New verification QA:** Gov ID front/back · FAA/EASA toggle · A-4+ required docs — DONE (catalog + workflow).

---

## Admin (checklist #1–15)

| # | Item | Verdict | Evidence / note |
|---|------|---------|-----------------|
| 1 | Name not organization | DONE · SMOKE | `contactName ?? companyName`; A1 |
| 2 | Edit Client Profile limited | DONE | Scoped admin client edit |
| 3 | Billing address fetch / Save | DONE | User-edit / client profile save |
| 4 | Job approval notification bar | DONE | `triggerJobSubmitted` → admins |
| 5 | Letter M cropped | DONE · VISUAL | Overlay overflow |
| 6 | Disabled checkbox purpose | DONE | Preview-only helper copy |
| 7 | Admin edit fails | DONE | Personnel/user-edit paths |
| 8 | Generate PDF scroll to pilot | DONE | Certificate issue scroll |
| 9 | Certificate name editable | DONE | Certificate engine fields |
| 10 | New briefing button | DONE | Removed until M168 |
| 11 | A-6 Captain Aviator wing | DONE | Grade + wing labels |
| 12 | Verification docs match / preview | DONE | In-modal preview + catalog titles |
| 13 | Request more info keeps queue | DONE | Amendments status |
| 14 | Preview Pricing / Full config 404 | DONE · SMOKE | Settings + `/configuration` alias; A14 |
| 15 | Delayed notifications / timezone | BLOCKED | Regions have timezone fields; delivery policy TBD |

**Note on A14 “Preview Pricing” label:** Full configuration 404 is fixed. Exact button string `Preview Pricing` is not present in commissions UI (rate edit + “Full configuration →”). Treat label rename as cosmetic / residual if client still wants that exact copy.

---

## HTML extras not on the consolidated checklist

These appear in `DroneFinalTesting.html` but are **not** numbered rows in `FINAL_TESTING_QA_CHECKLIST.md`:

| HTML theme | Status |
|------------|--------|
| Client: onboarding message must not disappear instantly | PARTIAL / VISUAL — gate stays until profile complete; toast timing not re-verified |
| Client: delete uploaded file in post-project | UNCERTAIN — verify UX on attach fields |
| Client: revision notification needs refresh | UNCERTAIN — may need live click-through |
| Client: “Submit for Client Review” prominence | UNCERTAIN — visual |
| Admin: 30-day grace then **auto permanent delete** | GAP vs HTML — soft deactivate + 30-day reactivate exists; **no auto hard-delete cron** (by design earlier) |
| Admin: profile fields wiped when leaving verification | UNCERTAIN — needs repro |
| Pilot verification “Suggested Solutions” bullets | Folded into Pilot #22 / #33 — DONE for core amendments path |

---

## Production automation coverage (`qa:final`)

Covered: unit helpers, hire CTAs, public pilots, client/pilot/admin dashboard shells, config alias, squadron voting page, license/verification reachability.

Not covered by automation: most pure visual polish, full revision E2E, Stripe/shop, every admin certificate click-path.

---

## Bottom line

- Consolidated checklist **71 Done / 6 Blocked** still matches code + Production smoke.
- Re-verify did **not** find a new functional regression in the Done set that failed Production automation.
- Open work remains: **6 Blocked**, optional HTML extras (esp. auto hard-delete after 30 days, any residual visual/revision refresh), and optional “Preview Pricing” copy if client insists.
