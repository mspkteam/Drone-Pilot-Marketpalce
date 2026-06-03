# M09 — Booking Workflow

**Status:** Ready for Review  
**Depends on:** M08 (Pilot Bidding / Applications)

---

## Purpose

After pilots submit bids, the **client accepts one application**, creating a **Booking**. Client and pilot advance the booking through a basic fulfillment lifecycle. One booking per job (Phase 1).

---

## Data model

`Booking`:

| Field | Notes |
|-------|--------|
| jobId | Unique — one booking per job |
| jobApplicationId | Unique — accepted application |
| pilotProfileId, clientProfileId | Parties |
| agreedAmount, currency | From accepted bid |
| status | See lifecycle below |

**Side effects on accept:**

- Application → `accepted`; other `submitted` → `rejected`
- Job → `assigned`
- Booking created with status `pending`

---

## Status lifecycle

| Status | Meaning |
|--------|---------|
| `pending` | Created on accept; awaiting client confirmation |
| `confirmed` | Client confirmed; pilot can start |
| `in_progress` | Pilot started work |
| `completed` | Work done; job → `closed` |
| `cancelled` | Cancelled by client or pilot |

### Allowed transitions

| Actor | From | To |
|-------|------|-----|
| Client | `pending` | `confirmed`, `cancelled` |
| Client | `confirmed` | `cancelled` |
| Client | `in_progress` | `completed`, `cancelled` |
| Pilot | `confirmed` | `in_progress`, `cancelled` |
| Pilot | `in_progress` | `completed`, `cancelled` |

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/client/jobs/[id]/offers` | Review and accept pilot bids |
| `/dashboard/client/bookings` | Client booking list |
| `/dashboard/client/bookings/[id]` | Client booking detail + actions |
| `/dashboard/pilot/bookings` | Pilot booking list |
| `/dashboard/pilot/bookings/[id]` | Pilot booking detail + actions |
| `GET /api/client/jobs/[id]/applications` | List offers |
| `POST /api/client/jobs/[id]/applications/[applicationId]/accept` | Accept bid |
| `GET/PATCH /api/client/bookings/[id]/status` | List / update (client) |
| `GET/PATCH /api/pilot/bookings/[id]/status` | List / update (pilot) |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Client | See seeded offer on open job; accept → booking `pending` |
| Client | Confirm → `confirmed`; pilot starts → `in_progress`; complete → `completed`, job `closed` |
| Pilot | See booking after accept; start and complete work |
| Pilot | Cannot accept bids (client only) |

---

## Demo flow

1. `npm run db:seed` — demo pilot bid on open Lake Travis job.
2. **client@dronepilot.local** → job → **Review pilot offers** → Accept.
3. Confirm booking (client) → **Start work** (pilot) → **Mark completed** (either party).

---

## Out of scope (M10+)

- Payments and commission records (M12)
- Reviews (M10)
- Email notifications (M16)
- Admin booking management UI (M13)
