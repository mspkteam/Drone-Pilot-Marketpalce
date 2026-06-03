# M23 — Dispute Resolution

**Version:** 0.21.0  
**Depends on:** M09 (Bookings), M12 (Payments/commission), M13 (Admin)

## Overview

Clients and pilots can open **one dispute per booking** for confirmed, in-progress, or completed work. The booking moves to `disputed`. Both parties add **notes**, **evidence** (URL reference, same pattern as M14 until P4 uploads), and **comments**. **Moderators** start review (`open` → `under_review`). **Super Admins** resolve with **full payout**, **partial payout**, or **refund**, updating internal payment records when present.

## Data model

- `Dispute` — linked 1:1 to `Booking`
- `DisputeEntry` — timeline rows (`note` | `evidence` | `comment`)

Statuses: `open` | `under_review` | `resolved`

Resolution types: `full_payout` | `partial_payout` | `refund`

## APIs

| Method | Path | Role |
|--------|------|------|
| GET/POST | `/api/client/bookings/[id]/dispute` | Client |
| GET/POST | `/api/pilot/bookings/[id]/dispute` | Pilot |
| POST | `/api/client/disputes/[id]/entries` | Client |
| POST | `/api/pilot/disputes/[id]/entries` | Pilot |
| GET | `/api/admin/disputes?status=` | Moderator+ |
| GET | `/api/admin/disputes/[id]` | Moderator+ |
| POST | `/api/admin/disputes/[id]/review` | Moderator+ |
| POST | `/api/admin/disputes/[id]/entries` | Moderator+ (comments only) |
| POST | `/api/admin/disputes/[id]/resolve` | Super Admin only |

## UI

- Client/pilot: **Dispute** section on booking detail
- Admin: `/dashboard/admin/disputes` (queue) and `/dashboard/admin/disputes/[id]` (detail + resolve)

## Smoke test

1. Complete a booking (or use confirmed/in-progress).
2. Client or pilot opens dispute with reason ≥ 10 chars.
3. Other party adds evidence URL + comment.
4. Log in as `moderator@dronepilot.local` → Start review.
5. Log in as `admin@dronepilot.local` → Resolve (e.g. partial payout with amount).
6. Confirm payment row reflects resolution when payment exists.

## Deferred

- File uploads for evidence (Priority 4)
- Stripe-linked refunds/payouts
