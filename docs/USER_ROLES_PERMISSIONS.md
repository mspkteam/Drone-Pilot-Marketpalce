# User Roles & Permissions

Phase 1 permission model for the Drone Pilot Marketplace.  
**Legend:** ✅ Allowed | ❌ Denied | 🔶 Limited (own resource or assigned scope only) | 🔷 Admin only

---

## Roles

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated visitor |
| **Client** | Hires pilots; posts jobs; accepts bids; manages bookings |
| **Pilot** | Offers services; profiles; bids on jobs; fulfills bookings |
| **Moderator** | Operational admin: jobs, pilots, verifications, disputes (no full system config) |
| **Super Admin** | Full platform control including settings and user management |

---

## Permissions matrix

| Permission | Guest | Client | Pilot | Moderator | Super Admin |
|------------|:-----:|:------:|:-----:|:---------:|:-----------:|
| Register account | ✅ | — | — | — | — |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create pilot profile | ❌ | ❌ | ✅ | ❌ | 🔷 |
| Edit pilot profile | ❌ | ❌ | 🔶 | 🔶 | 🔷 |
| Upload pilot certification | ❌ | ❌ | 🔶 | 🔶 | 🔷 |
| Post job | ❌ | ✅ | ❌ | ❌ | 🔷 |
| View jobs | 🔶 Public/marketing only | 🔶 Own + approved public listings | 🔶 Approved jobs + own applications | ✅ | ✅ |
| Bid on jobs | ❌ | ❌ | ✅ | ❌ | 🔷 |
| Accept bid | ❌ | 🔶 Own jobs | ❌ | 🔶 | 🔷 |
| Manage bookings | ❌ | 🔶 Own | 🔶 Assigned | ✅ | ✅ |
| Leave reviews | ❌ | 🔶 Own completed bookings | 🔶 Own completed bookings | ❌ | 🔷 |
| View payments | ❌ | 🔶 Own | 🔶 Own | ✅ | ✅ |
| Manage subscriptions | ❌ | ❌ | 🔶 Own pilot subscription | 🔶 View all | ✅ |
| Approve pilots | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve jobs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | 🔶 | ✅ |
| Manage disputes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage site settings | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Permission notes

### Register account
- Guest may register as **Client** or **Pilot** (role selected at signup or onboarding branch).
- Moderator and Super Admin accounts are created by Super Admin only (not public registration).

### View jobs
- **Guest:** Marketing copy only; no dashboard job lists.
- **Client:** Own jobs (all statuses) + approved job context where relevant.
- **Pilot:** Approved jobs open for bidding; not unapproved drafts.

### Accept bid
- Client accepts one application per job; triggers booking creation (M09).

### Manage bookings
- **Client:** Bookings on their jobs.
- **Pilot:** Bookings where they are the assigned pilot.
- **Moderator / Super Admin:** All bookings; can update status for support.

### Upload pilot certification
- Pilot uploads to own profile; Moderator reviews in verification queue (M14).

### Manage subscriptions
- **Pilot:** Subscribe, view plan, cancel/renew per product rules (Phase 1: basic structure).
- **Super Admin:** CRUD plans and override pilot subscription state.

### Approve pilots / Approve jobs
- Moderator and Super Admin in Phase 1; split may tighten later (e.g. jobs only for Moderator).

### Manage users
- **Moderator:** Suspend, verify, view — no destructive delete or billing config unless granted.
- **Super Admin:** Full user lifecycle.

### Manage site settings
- Super Admin only: branding, commission rate config (default 10% Phase 1), feature flags, email templates reference.

---

## Route protection (planning)

| Area | Minimum role |
|------|----------------|
| `/dashboard/pilot/*` | Pilot |
| `/dashboard/client/*` | Client |
| `/dashboard/admin/*` | Moderator or Super Admin |
| `/dashboard/admin/settings` | Super Admin |

Enforcement lives in M02 (Authentication & User Roles); this document is the source of truth for rules.
