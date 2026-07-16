# M15 — Digital Wings / Achievements

**Version:** 0.27.3  
**Depends on:** M05 (Pilot profiles), M09 (Bookings), M10 (Reviews), M11 (Membership), M14, M22

## Overview

**Digital Wings** are milestone badges pilots earn on the marketplace. Admins define wings with **award conditions** backed by live platform data; the system awards wings when criteria are met. Wings appear on the pilot dashboard, public profile, and trigger in-app notifications.

Admin UI: **Badges & Wings** (`/dashboard/admin/achievements`) — create/edit form exposes the full condition catalog (not free-text only).

## Data model

- `WingDefinition` — catalog (`code`, `title`, `description`, `category`, `autoRule`, `ruleParam`, `threshold`)
- `PilotWing` — earned instance (unique per pilot + definition)

Categories: `milestone` | `trust` | `community`

## Award conditions (site-backed)

| Rule | `ruleParam` | `threshold` | Behavior |
|------|-------------|-------------|----------|
| `manual_only` | — | — | Admin award only |
| `profile_approved` | — | — | Pilot profile status is approved |
| `active_membership` | — | — | Active or trialing `PilotSubscription` |
| `membership_tier_min` | Tier code (`A2_JUNIOR_FLIGHT_OFFICER`, …) | — | Active grade ≥ required (A-1…A-6) |
| `first_completed_booking` | — | — | ≥ 1 completed booking |
| `completed_bookings_count` | — | N | Completed bookings ≥ N |
| `job_applications_count` | — | N | Submitted proposals/bids ≥ N |
| `five_star_reviews_count` | — | N | Published 5★ reviews ≥ N |
| `average_rating_min` | — | tenths (45 = 4.5★) | Avg published rating ≥ target |
| `approved_verification` | `license` \| `insurance` \| `identity` \| `other` | — | That verification type approved |
| `approved_verifications_count` | — | N | Approved verifications (any type) ≥ N |
| `has_certificate` | — | — | ≥ 1 platform certificate |
| `certificates_count` | — | N | Certificates ≥ N |
| `has_certificate_template` | Template **slug** | N (default 1) | Certificates from that template ≥ N |

Catalog source of truth: `src/lib/wings/conditions.ts` (must stay in sync with `pilotMeetsAutoRule`).

## Evaluation hooks

`evaluateAndAssignWings(pilotProfileId)` runs after:

- Booking completed
- Verification approved
- Certificate issued
- Pilot profile approved
- Client 5★ review published
- Membership enroll / Fast Forward upgrade
- Job application (bid) submitted

## Certificates ↔ wings

Certificate templates are issued manually. After issue, wing evaluation runs. To unlock a wing for a **specific** template, create a badge with condition **Specific certificate template** and paste the template slug (shown on edit in Certificates admin).

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
- Admin: `/dashboard/admin/achievements` — definitions, conditions, manual award
- Public: `/pilots/[id]` — wing badges alongside verifications

## Seed

Eight default wing definitions; `evaluateAndAssignWings` runs for demo pilot after certificate seed.

## Smoke test

1. `npm run db:push && npm run db:seed`
2. Admin → **Badges & Wings** → New Badge → enable auto-award → pick a condition (e.g. membership grade ≥ A-2)
3. Enroll/upgrade a pilot to that grade → wing appears on Digital Wings
4. Certificates → note template slug → badge with `has_certificate_template` → issue cert → wing unlocks
