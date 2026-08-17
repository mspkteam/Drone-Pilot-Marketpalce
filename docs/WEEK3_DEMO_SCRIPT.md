# Week 3 — Pilot demo script

Run locally after `npm run db:setup` (or `db:push` + `db:seed`).

**Demo accounts** (password `Demo123!` for all):

| Role | Email | Notes |
|------|-------|-------|
| Super admin | `admin@dronepilot.local` | Job approval |
| Client | `client@dronepilot.local` | Accept bids, approve deliverables |
| Pilot (Captain) | `pilot@dronepilot.local` | A-6 tier — immediate job visibility, can bid |
| Pilot (Student) | `pilot-a1@dronepilot.local` | A-1 — view only, cannot bid |

---

## 1. Marketplace (live data)

1. Log in as **pilot@dronepilot.local**.
2. Open **Mission Marketplace** (`/dashboard/pilot/jobs`).
3. Confirm jobs load from API — **no** “Showing sample missions” banner.
4. If empty: as **admin**, approve a client job in **Job approval** first, then refresh marketplace.
5. Open **Locked Jobs** (`/dashboard/pilot/jobs/locked`) — tier-delayed jobs show countdown (or empty state, not mock cards).

**Pass:** Live jobs from `GET /api/pilot/jobs`; empty states when none available.

---

## 2. Submit proposal (extended form)

1. As **pilot@dronepilot.local**, open an unlocked job → **Submit Proposal** (`/dashboard/pilot/jobs/[id]/proposal`).
2. Complete:
   - Proposed amount + estimated hours/days + delivery date
   - Deliverables, crew, equipment
   - Operational plan / approach
   - Travel, flight time, compliance Yes/No fields
   - Pricing breakdown (must match proposed amount)
   - Off-platform terms checkbox
3. **Submit Application** → Terms overlay → check acknowledgment → **Confirm & Submit**.
4. Redirected to **My Proposals** with success.

**Pass:** `POST /api/pilot/jobs/[id]/applications` returns 201; proposal appears in Pending tab.

---

## 3. My Proposals — detail & withdraw

1. Open **My Proposals** (`/dashboard/pilot/proposals`).
2. Click **VIEW →** on a pending proposal → detail page (`/dashboard/pilot/proposals/[id]`).
3. Confirm operational plan, pricing breakdown, and cover message display.
4. (Optional) **Withdraw proposal** → moves to Withdrawn tab; cannot re-bid same job.

**Pass:** Detail loads from `GET /api/pilot/applications/[id]`; withdraw via `POST .../withdraw`.

---

## 4. Client shortlist & accept

1. Log in as **client@dronepilot.local**.
2. Open **Project Quotes** for a job with bids (`/dashboard/client/jobs/[jobId]/bids`).
3. **Shortlist** a bid → pilot sees **Revised** tab (shortlisted).
4. **Accept** bid → booking created; client redirected to booking detail.

**Pass:** `POST /api/client/jobs/[id]/applications/[applicationId]/accept` returns booking; other pending bids rejected.

---

## 5. Active contract & booking lifecycle

1. As **pilot@dronepilot.local**, open **Active Contracts** (`/dashboard/pilot/contracts`).
2. Confirm contract card from live booking (no sample banner).
3. Click **Deliver Work** → booking detail (`/dashboard/pilot/bookings/[id]`).
4. As **client**, open the same booking → **Confirm booking**.
5. As **pilot**, **Start work** (status → in progress).

**Pass:** Status actions on `PATCH /api/pilot/bookings/[id]/status`; no mock contract IDs.

---

## 6. Deliver work & client approval

1. As **pilot** (work in progress), scroll to **Deliver work** section.
2. Upload a file (PDF/image) or add a deliverable link + notes.
3. **Submit for client review**.
4. Log in as **client** → same booking → **Approve deliverables** (or request revisions with feedback).
5. On approve: booking status → **completed**; payment/commission records created.

**Pass:** `BookingDelivery` status `submitted` → `approved`; booking completes without direct “Mark completed” button.

---

## 7. Membership (Fast Forward)

1. As **pilot@dronepilot.local**, open **Membership** (`/dashboard/pilot/subscription`).
2. Confirm **$99.99/year** base + Fast Forward upgrade cards (A-1 → A-6).
3. (Optional) Enroll or upgrade — tier affects marketplace visibility delay.

**Pass:** `POST /api/pilot/subscription` returns enrolled tier; marketplace tier note updates.

---

## 8. A-1 bidding blocked (optional)

1. Log in as **pilot-a1@dronepilot.local**.
2. Browse marketplace — jobs visible after 48h delay.
3. Confirm **Submit Proposal** is blocked with upgrade message (A-2+ required).

**Pass:** `requirePilotEligibleToBid` / tier `canApply` enforced.

---

## Verification commands

```bash
npm run test:all
npm run build
npm run qa
```

**Expected:** 91+ tests pass; build succeeds; QA security checks pass.

**Sign-off date:** 2026-06-02 (core loop)
