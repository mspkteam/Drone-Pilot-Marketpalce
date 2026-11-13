# Roles, ranks, and account statuses

Glossary for Super Admin / ops. Display labels in Fleet & Personnel are **not** login roles.

## 1. Auth roles (`User.role`)

| Value | Who | Permissions |
|-------|-----|-------------|
| `client` | Hiring customers | Client dashboard |
| `pilot` | Operators | Pilot dashboard |
| `moderator` | Staff | Admin dashboard (module permissions) |
| `admin` | Ops admin | Full admin (non–super-admin) |
| `super_admin` | Platform owner | Full admin + create/delete/change staff roles |

Registration only creates `client` or `pilot` (M02). Staff are invited by Super Admin.

**Database:** `User.role`  
**Manage:** Super Admin → Users / invite management users; staff role can be updated between `moderator` and `admin`.

## 2. Account status (`User.status`)

| Value | Meaning |
|-------|---------|
| `active` | Can sign in |
| `deactivated` | Soft-off; may reactivate within 30 days |

Not the same as profile approval status.

## 3. Pilot membership grades (ranks)

Live marketplace grades **A-1 … A-6** (Student → Captain) via `SubscriptionPlan.code` / active `PilotSubscription`.  
Honorary **A-7 … A-10** (Senior Captain → Commodore) are Super Admin invitation only.

Affects: job visibility delay, propose eligibility (A-1 cannot propose), Captain’s Club, instructor eligibility (A-4+), squadron voting (A-4+).

## 4. Personnel display labels (Users table only)

Computed in `src/lib/admin/personnel-role-labels.ts` — **not** stored as auth roles:

| Label | Meaning |
|-------|---------|
| Squadron Lead | Pilot with **active instructor add-on** |
| Elite Pilot / grade title | A-5…A-10 (prefers plan name e.g. “A-6 Captain”) |
| Pilot / grade title | Other pilots (prefers plan name e.g. “A-1 Student”) |
| Enterprise Client | Client with company name |
| Client | Client without company name |

Strings like “Multinational” / “Active Duty” are **not** platform auth roles in this codebase.

## 5. Profile statuses

- **Pilot profile** `PilotProfile.status`: draft / pending / approved / rejected (marketplace visibility).
- **Client profile** `ClientProfile.status`: draft / pending / approved (posting eligibility).

## 6. Valid combinations (summary)

- Auth `pilot` + membership grade A-1…A-10 + profile approved/draft/…
- Auth `client` + optional company → Enterprise display label
- Auth staff roles have no pilot/client marketplace profiles in normal ops
- Display “Squadron Lead” requires instructor add-on; A-4 alone is not enough

## 7. Super Admin process

1. **Invite staff** — create moderator/admin with password (Users / invite).
2. **Change staff role** — update between Moderator and Admin (cannot self-demote Super Admin; cannot create Super Admin via UI).
3. **Delete staff** — Super Admin only; cannot delete self.
4. **Pilot/client** — edit profile, membership grade, account status on member detail; do not confuse Role column titles with login role.
