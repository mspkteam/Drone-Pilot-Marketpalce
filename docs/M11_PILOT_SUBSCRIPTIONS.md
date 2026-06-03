# M11 — Pilot Subscriptions

**Status:** Ready for Review  
**Depends on:** M02 (Auth), M03 (Pilot onboarding)

---

## Purpose

Phase 1 **subscription structure**: plan definitions, pilot enrollment, and status tracking. No payment gateway (Stripe) in this module — enrollment is recorded locally for MVP demos.

---

## Data model

**SubscriptionPlan:** name, slug, priceMonthly, currency, features (JSON), isActive

**PilotSubscription:** pilotProfileId, subscriptionPlanId, status, currentPeriodStart/End, optional externalSubscriptionId

**Status values:** `trialing` | `active` | `past_due` | `cancelled` | `expired`

---

## Seed plans

| Slug | Name | Price |
|------|------|-------|
| basic | Basic | $29/mo |
| pro | Pro | $79/mo |

Demo pilot (`pilot@dronepilot.local`) is seeded on **Basic** (active, 30-day period).

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/pilot/subscription` | Plan picker + current subscription |
| `GET /api/pilot/subscription/plans` | Active plans |
| `GET /api/pilot/subscription` | Current subscription |
| `POST /api/pilot/subscription` | Enroll `{ planId }` |
| `DELETE /api/pilot/subscription` | Cancel active subscription |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Pilot | See Basic + Pro plans |
| Pilot | Subscribe when none active → 30-day period |
| Pilot | 409 if already subscribed |
| Pilot | Cancel → status `cancelled` |
| Seed pilot | Shows active Basic plan on load |

---

## Out of scope

- Stripe / billing portal (ADR-168)
- Subscription required to bid (optional future gate)
- Admin plan CRUD UI (M13)
- Commission on bookings (M12)
