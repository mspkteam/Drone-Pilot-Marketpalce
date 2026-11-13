# Final Testing QA checklist

Source: `Drone-Final Testing/DroneFinalTesting.html` (QA Bugs Report, 22 Oct 2026).  
Annotated PDF: `Final_Testing_QA_Checklist_v3 (1).pdf` (Morosoft sticky comments, 2 Nov 2026).

Marks: **Done** · **Partial** · **Blocked on client**

**Totals (v0.27.123 re-verify):** Done 71 · Partial 0 · Blocked on client 6

### Re-verification restart (Nov 2026)

Code pass across Client / Pilot / Admin paths. Shipped fixes through v0.27.123 for:

- Pilot #33 — amendments status + admin comments on cards
- Client #9 — no budget/travel step-bleed in payload/review (+ normalized persist)
- Client #10 — server-side completion vs deadline check
- Pilot #2 — Custom chip no longer auto-lights from specialty fold
- Admin #1 / #12 — job queue prefers contact name; verification cards use catalog titles
- Client #2 — empty overview before ClientProfile exists
- Client #14 / #16 — marketing Hire CTAs hidden for pilots
- Client #20 — public Find Pilots uses `/pilots/[id]`
- Pilot #4 — incomplete-pilot deep links stay visible under OnboardingGate
- Pilot #21 — pilot squadron voting + seeded ballot scenario script

Still open / deferred:

| Item | Status | Notes |
|------|--------|-------|
| Client 4, 23 · Pilot 25, 28, 29 · Admin 15 | Blocked on client | Stripe / shop assets / timezone |

### First 11 Client checklist rows (pages/items 1–11)

| # | Item | Status |
|---|------|--------|
| 1–3, 5–6, 7–11 | Password eye, onboarding banner, dates, support button, profile edit, country default US (global select), file picker, step-bleed, completion date, terms | **Done** |
| 4 | BILLING (payment method) | **Blocked on client (Stripe)** — schedule 30‑min payments call |

Proposal submit blocker from Morosoft sticky extras: fixed in v0.27.114 (drafts no longer lock the form).

---

## Client

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Password eye icon should not disappear on hover | Done | |
| 2 | New login: dashboard visible with complete-profile message | Done | Banner + empty overview (stats / recommended pilots) before ClientProfile (v0.27.122) |
| 3 | Date format dd/mm/yyyy on date pickers | Done | |
| 4 | BILLING (payment method) | Blocked on client (Stripe) | |
| 5 | Talk to Support button radius / font color | Done | |
| 6 | Profile fields not editable by default; Edit option | Done | |
| 7 | Country / region / phone worldwide vs US | Done | Global CountrySelect; defaults to United States |
| 8 | File upload icon + stop showing bare “Choose file” after upload | Done | |
| 9 | Post a project: hide step-bleed fields | Done | UI + payload + normalized server persist (v0.27.122) |
| 10 | Step 4 Expected Project Completion Date + date conflict | Done | Client + server date order check (v0.27.121) |
| 11 | Terms checkbox / popup checked state | Done | |
| 12 | Move Back button to the right | Done | |
| 13 | Find a Pilot profile visible in dashboard | Done | |
| 14 | Hire a Captain redirect | Done | Guest/client only; marketing Hire CTAs hidden for pilots (v0.27.122) |
| 15 | Close icon color | Done | |
| 16 | Hire via marketplace purpose / redirect | Done | Guest/client only; marketing Hire CTAs hidden for pilots (v0.27.122) |
| 17 | Browse a pilot → Find a Pilot dashboard | Done | |
| 18 | Field-level error / success under fields | Done | |
| 19 | Button alignment | Done | |
| 20 | View profile 404 | Done | Dashboard client route + public `/pilots/[id]` directory links (v0.27.122) |
| 21 | Button sizes consistent | Done | Primary paths use shared heights; some legacy `.ras-btn` remain 2.5rem |
| 22 | Revision: no prompt after submit; pilot receives request | Done | |
| 23 | Invoice PDF downloadable | Blocked on client (Stripe) | |
| 24 | Invite code copyable link + purpose copy | Done | |

### Morosoft sticky extras (Client #20 area)

| Item | Status | Notes |
|------|--------|-------|
| Admin cannot approve/activate client profile | Done | |
| Pilot cannot submit a proposal | Done | |

---

## Pilot

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Portfolio bounce emptying fields | Done | |
| 2 | Selecting one service chip should not auto-select another | Done | Specialty fold no longer lights Custom (v0.27.121) |
| 3 | Portfolio titles remain visible | Done | |
| 4 | First login: all screens visible; message to complete profile | Done | Deep links keep screens visible; OnboardingGate overlay (v0.27.122) |
| 5 | Popup height/width / Remove preview margin | Done | |
| 6 | Highlighted links | Done | |
| 7 | Insurance section | Done | |
| 8 | Profile strength % mismatch | Done | |
| 9 | Hire via marketplace on public profile | Done | |
| 10 | Pilot cannot hire a captain | Done | |
| 11 | Where drafts are saved | Done | |
| 12 | Button margin | Done | |
| 13 | A-1 Fast Forward button disabled | Done | Disabled when current grade is A-1 |
| 14 | Instructor student code | Done | |
| 15 | Negotiation vs fixed-budget accept | Done | |
| 16 | A-6 Captain profile message | Done | |
| 17 | View listing 404 | Done | |
| 18 | Mention file format | Done | Core verification/proposal/portfolio covered |
| 19 | Add Link duplication | Done | |
| 20 | Revision View notification + Complete Job after revision | Done | |
| 21 | Dispute voting real scenarios | Done | Pilot A-4+ squadron voting UI + evidence + seed script (v0.27.123) |
| 22 | Verification file-type / remove / field errors / wing bleed / drafts | Done | |
| 23 | CSV vs earnings format | Done | |
| 24 | View profile / Need info buttons | Done | |
| 25 | Payment method realtime | Blocked on client (Stripe) | |
| 26 | View Profile 404 | Done | |
| 27 | Admin wing notification | Done | |
| 28 | Product pictures vs name | Blocked on client | Need product-specific shop assets |
| 29 | Payment + SMTP realtime | Blocked on client | |
| 30 | Support chat automated | Done | |
| 31 | Rank progress ≠ profile progress | Done | |
| 32 | License number on pilot dashboard profile | Done | |
| 33 | Verification amendments vs Rejected / comments on every card | Done | Distinct **AMENDMENTS REQUIRED** status + admin note (v0.27.121) |

### New verification QA (client screenshots, 2 Nov 2026)

| Item | Status | Notes |
|------|--------|-------|
| Government ID front + back (second image without pending block) | Done | |
| FAA vs EASA path toggle (EASA only if FAA path not chosen) | Done | |
| A-4+ required = ID + pilot cert (FAA or EASA) + aircraft registration | Done | |

---

## Admin

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Show client/pilot name, not organization | Done | Job approval queue prefers contactName (v0.27.121) |
| 2 | Edit Client Profile should not expose every feature | Done | |
| 3 | Billing address fetch / Save error | Done | |
| 4 | Job approval notification in bar | Done | |
| 5 | Letter M cropped | Done | Overlay overflow visible |
| 6 | Disabled checkbox purpose | Done | |
| 7 | Admin edit fails | Done | |
| 8 | Generate PDF scroll to pilot | Done | |
| 9 | Certificate name editable / friendlier | Done | |
| 10 | New briefing button | Done | Removed until implemented |
| 11 | A-6 Captain Aviator wing rank | Done | Grade title + Captain’s Club copy |
| 12 | Verification docs match uploads / preview UX | Done | Catalog slot titles in admin cards (v0.27.121) |
| 13 | Request more info deletes from queue | Done | Amendments keep queue |
| 14 | Preview Pricing / Full configuration 404 | Done | |
| 15 | Delayed notifications / timezone by region | Blocked on client | |

---

When client answers Stripe bank details / shop artwork / remaining phone formatting / timezone policy, re-open Wave 5 and re-mark those rows.

---

## Automation (regression)

Playwright + focused unit suite for **Done** rows (Blocked Stripe/shop/timezone are skipped).

```bash
# App must be running (local or remote)
npm run dev
# other terminal:
npm run qa:final
```

Optional env:

| Variable | Default | Purpose |
|----------|---------|---------|
| `FINAL_QA_BASE_URL` | `http://localhost:3000` | Target site |
| `FINAL_QA_SUITES` | `unit,marketing,client,pilot,admin` | Subset to run |
| `FINAL_QA_CLIENT_EMAIL` | `client@dronepilot.local` | Seed client |
| `FINAL_QA_PILOT_EMAIL` | `pilot@dronepilot.local` | Seed captain |
| `FINAL_QA_PILOT_A1_EMAIL` | `pilot-a1@dronepilot.local` | A-1 Fast Forward check |
| `FINAL_QA_ADMIN_EMAIL` | `admin@dronepilot.local` | Seed admin |
| `FINAL_QA_PASSWORD` | `Demo123!` | Shared demo password |

Example against Production after deploy:

```bash
FINAL_QA_BASE_URL=https://YOUR-VERCEL-DOMAIN npm run qa:final
```

JSON report: `.tmp-final-qa/report-*.json`
