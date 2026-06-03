# M13 — Admin Dashboard

**Status:** Ready for Review  
**Depends on:** M02 (Auth), M06–M12 (operational data)

---

## Purpose

Give moderators and super admins operational UIs to oversee users, pilot approvals, jobs (M07), applications, bookings, payments/commission, reviews, and subscription enrollments — with a consolidated dashboard overview.

---

## Screens / routes

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard/admin` | Moderator+ | Overview stats + quick links |
| `/dashboard/admin/pilots` | Moderator+ | Pilot list, approve/reject `pending_review` |
| `/dashboard/admin/clients` | Moderator+ | Client directory |
| `/dashboard/admin/jobs` | Moderator+ | Job approval queue (M07) |
| `/dashboard/admin/applications` | Moderator+ | All pilot bids |
| `/dashboard/admin/bookings` | Moderator+ | Bookings list + admin status updates |
| `/dashboard/admin/reviews` | Moderator+ | Review moderation (publish / hide / flag) |
| `/dashboard/admin/payments` | Moderator+ | Payments + commission records |
| `/dashboard/admin/users` | Super Admin | User audit table |
| `/dashboard/admin/subscriptions` | Super Admin | Plans + pilot enrollments (read-only) |
| `/dashboard/admin/settings` | Super Admin | Phase 1 config summary (commission 10%) |

**Hub pages:** Achievements/Wings (M25 hub → M15). Disputes: M23. Verifications: M14.

---

## APIs

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/admin/stats` | Moderator+ |
| GET | `/api/admin/pilots?status=` | Moderator+ |
| POST | `/api/admin/pilots/[id]/approve` | Moderator+ |
| POST | `/api/admin/pilots/[id]/reject` | Moderator+ |
| GET | `/api/admin/clients` | Moderator+ |
| GET | `/api/admin/applications` | Moderator+ |
| GET | `/api/admin/bookings?status=` | Moderator+ |
| PATCH | `/api/admin/bookings/[id]/status` | Moderator+ |
| GET | `/api/admin/payments` | Moderator+ |
| GET | `/api/admin/reviews?status=` | Moderator+ |
| PATCH | `/api/admin/reviews/[id]/status` | Moderator+ |
| GET | `/api/admin/users` | Super Admin |
| GET | `/api/admin/subscriptions` | Super Admin |

Job APIs from M07 unchanged.

---

## Pilot approval

| Action | From | To |
|--------|------|-----|
| Admin approve | `pending_review` | `approved` |
| Admin reject | `pending_review` | `rejected` (`isPublic` cleared) |

Pilot receives in-app notification on approve/reject.

---

## Review moderation

| Status | Effect on public pilot ratings |
|--------|-------------------------------|
| `published` | Counted (default) |
| `hidden` | Excluded |
| `flagged` | Excluded until published |

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Moderator | Full ops except Users, Subscriptions, Settings |
| Super Admin | All admin routes including Users |
| Pilot / Client | 403 on `/api/admin/*` |
| Logged-out | Redirect to login on dashboard |

---

## Demo flow

1. Log in as `moderator@dronepilot.local` / `Demo123!`
2. Open **Dashboard** — see pending job count
3. **Jobs** — approve demo pending job (M07)
4. **Pilots** — filter Pending; approve/reject if any `pending_review` profiles exist
5. **Bookings** — after M09 flow, advance or complete a booking
6. **Payments** — confirm commission row after completion
7. **Reviews** — hide or flag a review; verify public pilot page excludes hidden
8. Log in as `admin@dronepilot.local` — open **Users** and **Settings**

---

## Out of scope (later)

- User create/edit/suspend UI
- Plan CRUD + Stripe
- Configurable commission rate in DB
- Verification workflow UI (M14)
- Dispute resolution (deferred)
