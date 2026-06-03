# Sitemap — Drone Pilot Marketplace

Route map for Phase 1. Paths are planning names; final URL structure may use route groups (`(marketing)`, `(dashboard)`) in Next.js App Router.

---

## Public pages

| Page | Route (planned) | Purpose |
|------|-----------------|---------|
| Home | `/` | Landing, value prop, CTA to register |
| For Clients | `/for-clients` | Client-focused benefits |
| For Pilots | `/for-pilots` | Pilot-focused benefits |
| Pricing | `/pricing` | Plans, commission overview |
| How It Works | `/how-it-works` | Process steps |
| About | `/about` | Company / mission |
| Contact | `/contact` | Contact form / info |
| Login | `/login` | Authentication |
| Register | `/register` | Role selection → signup |
| Waitlist | `/waitlist` | Pre-launch capture (M18) |

---

## Pilot dashboard

Base path: `/dashboard/pilot`

| Page | Route (planned) | Module |
|------|-----------------|--------|
| Dashboard | `/dashboard/pilot` | M02, M05 |
| Profile | `/dashboard/pilot/profile` | M05 |
| Find Jobs | `/dashboard/pilot/jobs` | M08 |
| My Applications | `/dashboard/pilot/applications` | M08 |
| My Jobs | `/dashboard/pilot/bookings` | M09 |
| Subscription | `/dashboard/pilot/subscription` | M11 |
| Certificates / Wings | `/dashboard/pilot/achievements` | M14, M15 |
| Settings | `/dashboard/pilot/settings` | M02 |

---

## Client dashboard

Base path: `/dashboard/client`

| Page | Route (planned) | Module |
|------|-----------------|--------|
| Dashboard | `/dashboard/client` | M02, M04 |
| Post Job | `/dashboard/client/jobs/new` | M06 |
| My Jobs | `/dashboard/client/jobs` | M06, M07 |
| Offers | `/dashboard/client/jobs/[id]/offers` | M08 |
| Payments | `/dashboard/client/payments` | M12 |
| Reviews | `/dashboard/client/reviews` | M10 |
| Settings | `/dashboard/client/settings` | M02 |

---

## Admin dashboard

Base path: `/dashboard/admin`

| Page | Route (planned) | Min role |
|------|-----------------|----------|
| Dashboard | `/dashboard/admin` | Moderator |
| Users | `/dashboard/admin/users` | Super Admin |
| Pilots | `/dashboard/admin/pilots` | Moderator |
| Clients | `/dashboard/admin/clients` | Moderator |
| Jobs | `/dashboard/admin/jobs` | Moderator |
| Applications | `/dashboard/admin/applications` | Moderator |
| Bookings | `/dashboard/admin/bookings` | Moderator |
| Payments | `/dashboard/admin/payments` | Moderator |
| Subscriptions | `/dashboard/admin/subscriptions` | Super Admin |
| Verifications | `/dashboard/admin/verifications` | Moderator |
| Disputes | `/dashboard/admin/disputes` | Moderator |
| Achievements / Wings | `/dashboard/admin/achievements` | Super Admin |
| Settings | `/dashboard/admin/settings` | Super Admin |

---

## Auth & redirects

| Condition | Redirect |
|-----------|----------|
| Logged-out user hits dashboard | `/login` |
| Pilot hits client dashboard | `/dashboard/pilot` |
| Client hits pilot dashboard | `/dashboard/client` |
| Non-admin hits admin | `/` or 403 |

---

## Sprint 1 scope (sitemap)

Sprint 1 does **not** implement the pages above. Sprint 1 only plans:

- Route groups and layout shells
- Design tokens and base layout
- Placeholder structure for future dashboard roots

See `SPRINT_01_FOUNDATION.md`.

---

## Navigation hierarchy (visual)

```
Public
├── Home
├── For Clients / For Pilots
├── Pricing / How It Works
├── About / Contact
├── Login / Register / Waitlist

Pilot Dashboard
├── Dashboard
├── Profile
├── Find Jobs → My Applications
├── My Jobs (bookings)
├── Subscription
├── Certificates / Wings
└── Settings

Client Dashboard
├── Dashboard
├── Post Job → My Jobs → Offers
├── Payments
├── Reviews
└── Settings

Admin Dashboard
├── Dashboard
├── Users / Pilots / Clients
├── Jobs / Applications / Bookings
├── Payments / Subscriptions
├── Verifications / Disputes
├── Achievements / Wings
└── Settings
```
