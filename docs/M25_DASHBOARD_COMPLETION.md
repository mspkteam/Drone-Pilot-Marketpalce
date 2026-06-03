# M25 — Dashboard Completion

**Version:** 0.23.0  
**Depends on:** M02 (Auth), M13 (Admin), M21–M24

## Overview

Closes Priority 5 placeholder gaps: **functional client/pilot settings**, **admin dispute visibility**, and **achievements/wings hubs** that bridge to live certificate and verification modules until M15 ships.

## Client & pilot settings

`/dashboard/client/settings` and `/dashboard/pilot/settings`:

- Account summary (email, role, status, member since)
- Change password (`POST /api/account/password`)
- Notification summary + mark all read
- Link to profile editor
- **Pilot only:** public profile visibility toggle (`isPublic` via existing profile PATCH)

APIs:

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/account` | Any signed-in user |
| POST | `/api/account/password` | Any signed-in user |

## Admin dashboard

- Overview card: **Active disputes** (open + under review) → `/dashboard/admin/disputes`
- Quick links: Disputes, Messages

## Achievements / Wings hubs

- **Admin** (`/dashboard/admin/achievements`, Super Admin): certificate stats + links; M15 roadmap note
- **Pilot** (`/dashboard/pilot/achievements`): certificate count, approved verification badges, links to certificates/verifications

Full Digital Wings (M15) remains Priority 6.

## Smoke test

1. Client → Settings → change password → re-login
2. Pilot → Settings → toggle public profile (if approved)
3. Admin dashboard → Active disputes card
4. Super Admin → Achievements / Wings → Manage certificates
