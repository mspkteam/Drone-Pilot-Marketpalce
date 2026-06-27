# M27 — Pilot membership tiers (A-1 – A-6)

**Version:** 0.26.0  
**Replaces:** Basic/Pro as primary pilot membership logic (legacy plans deactivated, not deleted)

> **Source PDFs (2026-06-02):** Billing model is changing. **$99.99/year base membership** for all pilots + **one-time Fast Forward** upgrade fees (M297–M299). Table below reflects **grade privileges** (visibility, apply rules). Per-tier yearly prices in code/marketing are **legacy** until membership billing is rewired. See [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md).

## Tiers (privileges)

| Code | Name | Yearly | Visibility delay | Can bid | Instructor |
|------|------|--------|------------------|---------|------------|
| A1_STUDENT | A-1 Student | $99.99 | 48h | No | No |
| A2_JUNIOR_FLIGHT_OFFICER | A-2 Junior Flight Officer | $149.98 | 36h | Yes | No |
| A3_FLIGHT_OFFICER | A-3 Flight Officer | $169.98 | 24h | Yes | No |
| A4_SENIOR_FLIGHT_OFFICER | A-4 Senior Flight Officer | $189.98 | 12h | Yes | Yes |
| A5_FIRST_OFFICER | A-5 First Officer | $209.98 | 6h | Yes | Yes |
| A6_CAPTAIN | A-6 Captain | $229.98 | 0h | Yes | Yes |

## Visibility rule

`visibleAt = job.approvedAt + tier.jobVisibilityDelayHours`

Pilot sees job when `now >= visibleAt` and job is `open` / `in_bidding` with `approvedAt` set.

## Backend

- `src/lib/membership/membership.ts` — permission service
- Enforced in `listOpenJobsForPilot`, `getOpenJobForPilot`, `createJobApplication`
- Active membership required via `requirePilotEligibleToBid`

## Demo enroll

`POST /api/pilot/subscription` with `{ planId }` — internal yearly period, no Stripe.

## Seed

- `pilot@dronepilot.local` → **A-6 Captain**
- `pilot-a1@dronepilot.local` → A-1 Student
- `pilot-a2@dronepilot.local` → A-2 Junior

Run after schema change: `npm run db:push && npm run db:seed`

## Tests

`npm run test` — `src/lib/membership/membership.test.ts` (11 cases)
