# M03 — Pilot Onboarding

**Status:** Ready for Review  
**Depends on:** M02 (Authentication)

---

## Purpose

Allow pilots to complete onboarding after registration: core profile fields, license info, services offered, and a compliance checklist. Profiles enter `pending_review` until admin approval (M13/M14).

---

## Data fields (`PilotProfile`)

| Field | Notes |
|-------|--------|
| displayName | Required |
| bio | Optional |
| locationCity, locationRegion, locationCountry | City + country required on submit |
| serviceRadiusKm | Optional |
| servicesOffered | JSON array of service ids |
| hourlyRateMin / hourlyRateMax | Optional |
| licenseNumber | Required |
| licenseCountry | Optional |
| status | `draft` → `pending_review` on onboarding submit |
| complianceAcceptedAt | Set when checklist accepted |
| onboardingCompletedAt | Gates dashboard access |

---

## Screens / routes

| Route | Description |
|-------|-------------|
| `/dashboard/pilot/onboarding` | First-time onboarding form + compliance |
| `/dashboard/pilot/profile` | Edit profile (after onboarding) |
| `/dashboard/pilot` | Dashboard with profile status summary |
| `POST/PATCH/GET /api/pilot/profile` | Pilot-only API |

---

## Permissions

| Action | Pilot | Others |
|--------|:-----:|--------|
| Complete onboarding | ✅ own | ❌ |
| View/edit own profile | ✅ own | ❌ |
| API access | ✅ session + role `pilot` | 401/403 |

---

## User flows

1. Register as pilot → `/dashboard/pilot/onboarding`
2. Complete form + compliance → `pending_review` → pilot dashboard
3. Incomplete onboarding → other pilot routes redirect to onboarding
4. Seed pilot `pilot@dronepilot.local` has pre-approved profile for dev

---

## Out of scope (M03)

- Document/cert file upload (M14)
- Public profile page (M05)
- Admin approve UI (M13) — status field only
- Client onboarding (M04)

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Logged-out | Cannot access onboarding API or pages |
| Pilot (new) | Forced to onboarding; submit works |
| Pilot (seed) | Dashboard loads; profile editable |
| Client | 403 on pilot API |
| Admin | 403 on pilot API |
| Mobile | Form usable on narrow viewport |

---

## Completion notes

- Prisma `PilotProfile` model added; SQLite migration via `db push`
- Interim UI (Figma alignment deferred per ADR-009)
- Extended pilot fields at registration deferred to onboarding path per ADR-010
