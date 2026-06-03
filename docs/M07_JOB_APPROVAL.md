# M07 — Job Approval System

**Status:** Ready for Review  
**Depends on:** M06 (Client Job Posting)

---

## Purpose

Admins (moderator, super_admin) review client jobs in `pending_approval`, approve them to `open` (visible for pilot bidding in M08), or reject with a reason (client can edit and resubmit).

---

## Workflow

| Action | From status | To status | Side effects |
|--------|-------------|-----------|--------------|
| Client submit | `draft` / `rejected` | `pending_approval` | M06 |
| Admin approve | `pending_approval` | `open` | `approvedAt`, `approvedByUserId` set |
| Admin reject | `pending_approval` | `rejected` | `rejectionReason` required |

---

## Screens / routes

| Route | Description |
|-------|-------------|
| `/dashboard/admin/jobs` | Filterable job queue |
| `/dashboard/admin/jobs/[id]` | Review detail + approve/reject |
| `GET /api/admin/jobs?status=` | List jobs |
| `POST /api/admin/jobs/[id]/approve` | Approve |
| `POST /api/admin/jobs/[id]/reject` | Reject with reason |

---

## Permissions

| Action | Moderator | Super Admin |
|--------|:---------:|:-----------:|
| View job queue | ✅ | ✅ |
| Approve / reject | ✅ | ✅ |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Admin | See pending job; approve → `open` |
| Admin | Reject with reason → client sees on job edit |
| Client | Cannot call admin APIs |
| Pilot | Cannot call admin APIs |
| Logged-out | 401 |

---

## Seed data

After `npm run db:seed`, demo client has one `pending_approval` job for admin review.

---

## Out of scope (M07)

- Pilot job browse UI (M08)
- Email notifications on approve/reject (M16)
