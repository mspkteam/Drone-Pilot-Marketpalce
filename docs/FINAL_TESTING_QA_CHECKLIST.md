# Final Testing QA checklist

Source: `Drone-Final Testing/DroneFinalTesting.html` (QA Bugs Report, 22 Oct 2026).  
Annotated PDF: `Final_Testing_QA_Checklist_v3 (1).pdf` (Morosoft sticky comments, 2 Nov 2026).

Marks: **Done** · **Partial** · **Blocked on client**

**Totals (v0.27.113):** Done 65 · Partial 0 · Blocked on client 8 · New verification QA covered below

---

## Client

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Password eye icon should not disappear on hover | Done | |
| 2 | New login: dashboard visible with complete-profile message | Done | Morosoft sticky: message must not vanish — home keeps persistent banner + overview while incomplete (v0.27.111–113) |
| 3 | Date format dd/mm/yyyy on date pickers | Done | |
| 4 | BILLING (payment method) | Blocked on client (Stripe) | |
| 5 | Talk to Support button radius / font color | Done | |
| 6 | Profile fields not editable by default; Edit option | Done | |
| 7 | Country / region / phone worldwide vs US | Blocked on client | |
| 8 | File upload icon + stop showing bare “Choose file” after upload | Done | Morosoft sticky reconsider — custom picker + filename list on proposal attach and post-project references (v0.27.113) |
| 9 | Post a project: hide step-bleed fields | Done | Budget min/max only when `fixed_budget`; travel amounts only when covering travel |
| 10 | Step 4 Expected Project Completion Date + date conflict | Done | Label + server/client date order check |
| 11 | Terms checkbox / popup checked state | Done | Shared `termsAcknowledged` |
| 12 | Move Back button to the right | Done | Continue/Submit left; Back `margin-left: auto` |
| 13 | Find a Pilot profile visible in dashboard | Done | Approved pilots listed for clients |
| 14 | Hire a Captain redirect | Done | Guest → register; client → find pilots; **hidden for pilots** (`hireCaptainHref` null) |
| 15 | Close icon color | Done | Job-approval modal close gold by default (v0.27.113) |
| 16 | Hire via marketplace purpose / redirect | Done | Guest register; client post-project; hire default off / pilots cannot hire |
| 17 | Browse a pilot → Find a Pilot dashboard | Done | |
| 18 | Field-level error / success under fields | Done | Under-field errors on Service, Location, Requirements, Budget (v0.27.113) |
| 19 | Button alignment | Done | Review footer: primary cluster left, Back right |
| 20 | View profile 404 | Done | Dashboard path; public `/pilots/[id]` passes `viewerRole` so clients can open approved pilots (v0.27.113) |
| 21 | Button sizes consistent | Done | Shared 2.75rem min-height |
| 22 | Revision: no prompt after submit; pilot receives request | Done | |
| 23 | Invoice PDF downloadable | Blocked on client (Stripe) | |
| 24 | Invite code copyable link + purpose copy | Done | |

### Morosoft sticky extras (Client #20 area)

| Item | Status | Notes |
|------|--------|-------|
| Admin cannot approve/activate client profile | Done | Activate profile on admin client member (v0.27.111) |
| Pilot cannot submit a proposal | Done | Block reason shown on proposal page (no silent redirect) |

---

## Pilot

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Portfolio bounce emptying fields | Done (0.27.104–106) | |
| 2 | Selecting one service chip should not auto-select another | Done | |
| 3 | Portfolio titles remain visible | Done | |
| 4 | First login: all screens visible; message to complete profile | Done | Persistent home banner + overview while incomplete |
| 5 | Popup height/width / Remove preview margin | Done | |
| 6 | Highlighted links | Done | Verification / Certificates / Wings |
| 7 | Insurance section | Done | |
| 8 | Profile strength % mismatch | Done (0.27.107) | |
| 9 | Hire via marketplace on public profile | Done | Hidden for logged-in pilots |
| 10 | Pilot cannot hire a captain | Done | |
| 11 | Where drafts are saved | Done | |
| 12 | Button margin | Done | |
| 13 | A-1 Fast Forward button disabled | Done | |
| 14 | Instructor student code | Done | |
| 15 | Negotiation vs fixed-budget accept | Done | |
| 16 | A-6 Captain profile message | Done | |
| 17 | View listing 404 | Done | |
| 18 | Mention file format | Done | |
| 19 | Add Link duplication | Done | |
| 20 | Revision View notification + Complete Job after revision | Done | |
| 21 | Dispute voting real scenarios | Done | |
| 22 | Verification file-type / remove / field errors / wing bleed / drafts | Done | |
| 23 | CSV vs earnings format | Done | |
| 24 | View profile / Need info buttons | Done | |
| 25 | Payment method realtime | Blocked on client (Stripe) | |
| 26 | View Profile 404 | Done | |
| 27 | Admin wing notification | Done | |
| 28 | Product pictures vs name | Blocked on client | Need product-specific shop assets |
| 29 | Payment + SMTP realtime | Blocked on client | |
| 30 | Support chat automated | Blocked on client | |
| 31 | Rank progress ≠ profile progress | Done (0.27.98) | |
| 32 | License number on pilot dashboard profile | Done | |
| 33 | Verification amendments vs Rejected / comments on every card | Done | |

### New verification QA (client screenshots, 2 Nov 2026)

| Item | Status | Notes |
|------|--------|-------|
| Government ID front + back (second image without pending block) | Done | Separate catalog slots; conflict scoped per slot (v0.27.112) |
| FAA vs EASA path toggle (EASA only if FAA path not chosen) | Done | Path toggle filters cards (v0.27.112) |
| A-4+ required = ID + pilot cert (FAA or EASA) + aircraft registration | Done | Progress uses 4 required units; insurance/extras optional (v0.27.112) |

---

## Admin

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Show client/pilot name, not organization | Done | |
| 2 | Edit Client Profile should not expose every feature | Done | Edit/suspend + Activate; jobs via Job Approval |
| 3 | Billing address fetch / Save error | Done | |
| 4 | Job approval notification in bar | Done | |
| 5 | Letter M cropped | Done | |
| 6 | Disabled checkbox purpose | Done | |
| 7 | Admin edit fails | Done | GET/PATCH `/api/admin/users/[id]` |
| 8 | Generate PDF scroll to pilot | Done | |
| 9 | Certificate name editable / friendlier | Done | |
| 10 | New briefing button | Done | Removed until implemented |
| 11 | A-6 Captain Aviator wing rank | Done | |
| 12 | Verification docs match uploads / preview UX | Done | |
| 13 | Request more info deletes from queue | Done | Amendments keep queue |
| 14 | Preview Pricing / Full configuration 404 | Done | |
| 15 | Delayed notifications / timezone by region | Blocked on client | |

---

When client answers Stripe / geo-phone / support automation / shop artwork, re-open Wave 5 and re-mark those rows.
