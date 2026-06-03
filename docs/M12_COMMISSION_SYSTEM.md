# M12 — Commission System

**Status:** Ready for Review  
**Depends on:** M09 (Booking Workflow)

---

## Purpose

When a booking is marked **completed**, the platform records a **Payment** (gross → net) and a **Commission** at **10%** of `agreedAmount`. Phase 1 uses logical records only — no Stripe charges.

---

## Calculation

```
commission = agreedAmount × 0.10 (rounded to 2 decimals)
pilotNet   = agreedAmount − commission
```

Default rate: `DEFAULT_COMMISSION_RATE = 0.1` in `src/lib/commission/constants.ts`.

---

## Data model

**Payment:** bookingId (unique), payer (client user), payee (pilot user), amountGross, amountNet, status `succeeded`

**Commission:** bookingId (unique), paymentId, rate, amount, status `calculated`

Created automatically in `updateBookingStatus` → `completed` (idempotent if payment exists).

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/client/payments` | Client payment history + fee breakdown |
| `/dashboard/pilot/payments` | Pilot payout history |
| Booking detail (both) | Payment summary when completed |
| `GET /api/client/payments` | List client payments |
| `GET /api/pilot/payments` | List pilot payments |
| `GET /api/*/bookings/[id]/payment` | Payment for one booking |

---

## Test matrix

| Step | Expected |
|------|----------|
| Complete booking | Payment + commission rows created |
| Client Payments | Shows gross, 10% fee, pilot net |
| Pilot Payments | Shows payout (net) |
| Re-complete / duplicate | Idempotent — one payment per booking |

---

## Out of scope

- Stripe / refunds (later)
- Admin commission config UI (M13 / Super Admin)
- Invoicing / collected status workflow
