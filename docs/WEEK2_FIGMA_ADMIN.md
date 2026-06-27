# Week 2 — Admin Figma alignment (`808:24076`)

**Figma section:** [ADMIN DASHBOARD](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-24076)  
**Updated Settings frame:** [Configuration (`970:3573`)](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=970-3573)

**Shell constraint:** `DashboardShell` wiring unchanged — page content + nav only.

---

## Frame index & status

| # | Screen | Node | Route | Figma pass |
|---|--------|------|-------|------------|
| 1 | Operations dashboard | `808:24077` | `/dashboard/admin` | Done |
| 2 | User Management | `808:24673` | `/dashboard/admin/users` | Done — search, copy, titles |
| 3 | Pilot Verification | `808:25258` | `/dashboard/admin/verifications` | Done — admin hero + panel |
| 4 | Job Approval | `808:25784` | `/dashboard/admin/jobs` | Done — title + search |
| 5 | Subscriptions | `808:26310` | `/dashboard/admin/subscriptions` | Done — title |
| 6 | Commissions | `808:26940` | `/dashboard/admin/payments` | Done — title |
| 7 | Disputes | `808:27475` | `/dashboard/admin/disputes` | Done — title |
| 8 | Squadron Voting | `808:32375` | `/dashboard/admin/squadron-voting` | Done — dedicated page |
| 9 | Certificates | `808:27973` | `/dashboard/admin/certificates` | Done — title |
| 10 | Badges & Wings | `808:28491` | `/dashboard/admin/achievements` | Done — eyebrow + title |
| 11 | Uniform Shop | `808:29020` | `/dashboard/admin/shop` | Done — title |
| 12 | Regions | `808:29548` | `/dashboard/admin/regions` | Done — dedicated page (config interim) |
| 13 | Reports | `808:30149` | `/dashboard/admin/reports` | Done — already aligned |
| 14 | CMS Pages | `808:30678` | `/dashboard/admin/cms` | Done — title |
| 15 | Settings | `970:3573` | `/dashboard/admin/settings` | Done — Configuration hero, bento grid, fees module |

**Not in Figma sidebar (routes kept):** messages, support, permissions

---

## Shell (done)

Flat 15-item nav, admin rank card, shared hero title styling in `admin-dashboard.css`.

---

## Remaining polish (non-blocking)

- Regions: full region CRUD (currently links to Settings)
- Squadron Voting: live ballot UI (currently links to Disputes)
- Per-page pixel QA vs Figma screenshots
- CMS / configuration Prisma persistence (Week 2 backend track)

---

## Implementation log

| Date | Item |
|------|------|
| 2026-06-02 | Shell + ops dashboard Figma `808:24076` |
| 2026-06-02 | Settings page aligned to updated Figma `970:3573` — bento layout, commission tiers, pilot override preview |
