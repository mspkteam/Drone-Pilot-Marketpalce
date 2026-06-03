# M15 — Digital Wings / Achievements

**Version:** 0.24.0  
**Depends on:** M05 (Pilot profiles), M09 (Bookings), M10 (Reviews), M14, M22

## Overview

**Digital Wings** are milestone badges pilots earn on the marketplace. Admins define wings with optional **auto-assign rules**; the system awards wings when criteria are met. Wings appear on the pilot dashboard, public profile, and trigger in-app notifications.

## Data model

- `WingDefinition` — catalog (code, title, description, category, auto rule, threshold)
- `PilotWing` — earned instance (unique per pilot + definition)

Categories: `milestone` | `trust` | `community`

## Auto-assign rules

| Rule | Behavior |
|------|----------|
| `profile_approved` | Pilot profile status is approved |
| `first_completed_booking` | ≥ 1 completed booking |
| `completed_bookings_count` | Completed bookings ≥ `threshold` |
| `five_star_reviews_count` | Published 5★ reviews ≥ `threshold` |
| `approved_verification` | Approved verification of `ruleParam` type |
| `has_certificate` | ≥ 1 platform certificate |
| `manual_only` | Admin award only |

Hooks run after: booking completed, verification approved, certificate issued, pilot approved, client 5★ review.

## APIs

| Method | Path | Role |
|--------|------|------|
| GET | `/api/pilot/wings` | Pilot |
| GET | `/api/admin/wing-definitions` | Super Admin |
| POST | `/api/admin/wing-definitions` | Super Admin |
| PATCH | `/api/admin/wing-definitions/[id]` | Super Admin |
| GET/POST | `/api/admin/wings` | Super Admin (list + manual award) |

## UI

- Pilot: `/dashboard/pilot/achievements` — earned wings grid
- Admin: `/dashboard/admin/achievements` — definitions, manual award, recent awards
- Public: `/pilots/[id]` — wing badges alongside verifications

## Seed

Eight default wing definitions; `evaluateAndAssignWings` runs for demo pilot after certificate seed.

## Smoke test

1. `npm run db:push && npm run db:seed`
2. `pilot@dronepilot.local` → **Digital Wings** — see Platform Pilot, Verified License, etc.
3. `admin@dronepilot.local` → **Achievements / Wings** — manual award Community Champion
4. View `/pilots/{pilotId}` — wings visible on public profile
