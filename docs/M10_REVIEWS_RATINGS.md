# M10 — Reviews & Ratings

**Status:** Ready for Review  
**Depends on:** M09 (Booking Workflow)

---

## Purpose

After a booking is **completed**, client and pilot can each leave **one review** per booking (1–5 stars, optional comment). Reviews build trust for future matching. Admin moderation (`hidden` / `flagged`) is reserved for M13.

---

## Data model

`Review`:

| Field | Notes |
|-------|--------|
| bookingId + authorUserId | Unique — one review per party per booking |
| targetPilotProfileId | Set when client reviews pilot |
| targetClientProfileId | Set when pilot reviews client |
| rating | Integer 1–5 |
| comment | Optional; min 10 chars if provided |
| status | `published` (default) |

---

## Rules

| Rule | Detail |
|------|--------|
| Eligibility | Booking status must be `completed` |
| Client | Reviews assigned pilot |
| Pilot | Reviews client on that booking |
| Duplicate | 409 if same author reviews twice |

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/client/reviews` | Client reviews given & received |
| `/dashboard/pilot/reviews` | Pilot reviews given & received |
| Booking detail (both roles) | Review form when eligible |
| `GET/POST /api/client/bookings/[id]/reviews` | Client booking reviews |
| `GET/POST /api/pilot/bookings/[id]/reviews` | Pilot booking reviews |
| `GET /api/client/reviews` | Client review list |
| `GET /api/pilot/reviews` | Pilot review list |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Client | Cannot review until booking `completed` |
| Client | Submit 1–5 star review for pilot; appears on Reviews page |
| Pilot | Submit review for client after completion |
| Either | 409 on second review for same booking |

---

## Demo flow

1. Complete M09 flow through **Mark completed**.
2. Open booking detail as client → submit review.
3. Open booking detail as pilot → submit review.
4. Check **Reviews** in each dashboard.

---

## Out of scope (later modules)

- Email on new review (M16)
- Admin hide/flag UI (M13)
- Public pilot profile aggregate rating (M05)
- Payments / commission (M12)
