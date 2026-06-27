# Week 2 — Admin demo script

Run locally after `npm run db:setup` (or `db:push` + `db:seed`).

**Demo accounts** (password `Demo123!` for all):

| Role | Email |
|------|-------|
| Super admin | `admin@dronepilot.local` |
| Moderator (limited preset) | `moderator@dronepilot.local` |
| Client | `client@dronepilot.local` |

---

## 1. Moderator vs super admin nav

1. Log in as **moderator@dronepilot.local**.
2. Open `/dashboard/admin` — confirm sidebar shows ops modules but **not** Permissions or Settings (super-admin only).
3. Log out; log in as **admin@dronepilot.local**.
4. Confirm **Permissions** appears in sidebar before Settings.

**Pass:** Nav differs by role; Permissions route blocked for moderator (redirect to `/dashboard/admin`).

---

## 2. Job approval + tier delay

1. As super admin, open **Job approval** (`/dashboard/admin/jobs`).
2. Approve a job in `pending_approval` status (seed includes client-submitted jobs).
3. Confirm job moves to **Open for bids** and client receives `job_approved` notification.
4. (Optional) Log in as pilot — lower tiers see job only after visibility delay (`approvedAt` + tier hours).

**Pass:** Approve API returns `status: "open"` with `approvedAt` set. Automated coverage: `src/lib/jobs/job-approval.test.ts`, `src/lib/membership/membership.test.ts`.

---

## 3. Resolve dispute

1. Open **Dispute center** (`/dashboard/admin/disputes`).
2. Open an open dispute → resolve with outcome (commission impact reflected in ledger when payment exists).

**Pass:** Dispute status updates; no mock rows in list (live DB only).

---

## 4. Moderator permissions

1. As super admin, open **Permissions** (`/dashboard/admin/permissions`).
2. Select **moderator@dronepilot.local** → toggle a module (e.g. disable Job approval) → Save.
3. Log in as moderator again → confirm nav reflects saved permissions after reload.

**Pass:** Changes persist in `ModeratorPermissionRecord`; API mutations return 403 when permission denied.

---

## 5. CMS → public resources (optional)

1. As super admin, open **CMS** → edit/publish an article or resource.
2. Visit `/resources` and `/resources/[slug]` — confirm published content appears.

**Pass:** Public pages read from Prisma CMS records.

---

## 6. Configuration + commissions (optional)

1. Open **Configuration** → adjust security toggles or pilot override preview → Save.
2. Open **Commissions** — ledger uses persisted default commission rate from platform settings.

**Pass:** PATCH `/api/admin/configuration` persists; commission stats show configured rate.

---

## Verification commands

```bash
npm run test:all
npm run build
```

**Sign-off date:** 2026-06-02
