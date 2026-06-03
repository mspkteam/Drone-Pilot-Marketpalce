# M04 — Client Onboarding

**Status:** Ready for Review  
**Depends on:** M02 (Authentication)

---

## Purpose

Allow clients to complete onboarding after registration: contact/company details and optional billing address so they are ready to post jobs (M06).

---

## Data fields (`ClientProfile`)

| Field | Notes |
|-------|--------|
| companyName | Optional |
| contactName | Required on onboarding submit |
| phone | Optional |
| billingAddress | JSON (line1, city, region, country, postalCode) |
| status | `draft` → `active` on onboarding complete |
| onboardingCompletedAt | Gates dashboard access |

---

## Screens / routes

| Route | Description |
|-------|-------------|
| `/dashboard/client/onboarding` | First-time client setup |
| `/dashboard/client/profile` | Edit profile after onboarding |
| `/dashboard/client` | Dashboard with account summary |
| `GET/POST/PATCH /api/client/profile` | Client-only API |

---

## Permissions

| Action | Client | Others |
|--------|:------:|--------|
| Complete onboarding | ✅ own | ❌ |
| View/edit own profile | ✅ own | ❌ |
| API access | ✅ session + role `client` | 401/403 |

---

## User flows

1. Register as client → `/dashboard/client/onboarding`
2. Complete form → `active` → client dashboard
3. Incomplete onboarding → other client routes redirect to onboarding
4. Seed `client@dronepilot.local` has pre-completed profile

---

## Out of scope (M04)

- Job posting (M06)
- Payments (M12)
- Figma-final form layout (ADR-009)

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Logged-out | Cannot access client onboarding/API |
| Client (new) | Forced to onboarding; submit works |
| Client (seed) | Dashboard loads; profile editable |
| Pilot | 403 on client API |
| Mobile | Form usable on narrow viewport |
