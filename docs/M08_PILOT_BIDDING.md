# M08 — Pilot Bidding / Applications

**Status:** Ready for Review  
**Depends on:** M07 (Job Approval), M03 (approved pilot profile)

---

## Purpose

Approved pilots browse **open** jobs (admin-approved in M07) and submit one application per job with proposed amount, optional message, and estimated delivery date. Client bid acceptance and booking are **M09** — out of scope here.

---

## Data model

`JobApplication` (Prisma):

| Field | Notes |
|-------|--------|
| jobId, pilotProfileId | Unique together — one bid per pilot per job |
| proposedAmount, currency | Required amount |
| message | Optional; min 10 chars if provided |
| estimatedDeliveryDate | Optional |
| status | `submitted` (default); `withdrawn`, `accepted`, `rejected`, `expired` reserved for later modules |

When the first application is submitted on an `open` job, job status moves to `in_bidding`.

---

## Gates

| Requirement | Enforced |
|-------------|----------|
| Pilot role + session | API + pages |
| Onboarding complete | API + pages |
| Pilot profile `approved` | API + pages (browse/bid) |

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/pilot/jobs` | List open jobs |
| `/dashboard/pilot/jobs/[id]` | Job detail + bid form (or existing application) |
| `/dashboard/pilot/applications` | Pilot's submitted applications |
| `GET /api/pilot/jobs` | Open jobs for pilot |
| `GET /api/pilot/jobs/[id]` | Open job detail + own application if any |
| `POST /api/pilot/jobs/[id]/applications` | Submit application |
| `GET /api/pilot/applications` | List own applications |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Pilot (approved) | See seeded open job; submit bid; see on applications list |
| Pilot (not approved) | Jobs list shows approval message; APIs return 403 |
| Pilot | Cannot apply twice to same job (409) |
| Client | No client UI for offers in M08 |
| Admin | No change to approval flow |

---

## Demo flow

1. `npm run db:seed` — includes one `open` job for demo client.
2. Log in as `pilot@dronepilot.local` / `Demo123!`
3. **Find Jobs** → open job → submit bid → **My Applications**

Optional: approve `pending_approval` job as admin, then bid as pilot.

---

## Out of scope (M09+)

- Client view/accept/reject offers
- Booking creation
- Withdraw application API
- Payments / commission
