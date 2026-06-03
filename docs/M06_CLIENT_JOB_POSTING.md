# M06 — Client Job Posting

**Status:** Ready for Review  
**Depends on:** M04 (Client Onboarding)

---

## Purpose

Clients can create drone job postings, save drafts, and submit for admin approval (`pending_approval`). M07 handles admin approve/reject.

---

## Data fields (`Job`)

| Field | Notes |
|-------|--------|
| title, description, category | Required |
| locationLabel + city/region/country | Location |
| scheduledDate, budgetMin/Max, requirements | Optional |
| status | `draft` → `pending_approval` on submit |
| rejectionReason | Set by admin in M07 |

---

## Screens / routes

| Route | Description |
|-------|-------------|
| `/dashboard/client/jobs/new` | Create job |
| `/dashboard/client/jobs` | List own jobs |
| `/dashboard/client/jobs/[id]` | View/edit draft or rejected |
| `GET/POST /api/client/jobs` | List / create |
| `GET/PATCH /api/client/jobs/[id]` | Read / update |
| `POST /api/client/jobs/[id]/submit` | Submit for approval |

---

## Permissions

| Action | Client | Others |
|--------|:------:|--------|
| Create/edit own jobs (draft/rejected) | ✅ | ❌ |
| Submit for approval | ✅ | ❌ |
| View own jobs (any status) | ✅ | ❌ |

---

## Out of scope (M06)

- Admin approval UI (M07)
- Pilot job browse (M08)
- Offers / bidding (M08)

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Client (onboarded) | Create, draft, submit, list |
| Client (not onboarded) | Redirect to onboarding |
| Pilot | 403 on job API |
| Mobile | Forms usable on small screens |
