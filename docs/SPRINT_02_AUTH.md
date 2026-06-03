# Sprint 02 — Authentication (M02)

**Sprint goal:** Authentication and role-based access — no marketplace business logic.

**Module:** M02 — Authentication & User Roles  
**Depends on:** M01 (Done)

---

## Delivered

| Item | Status |
|------|--------|
| Auth.js v5 + Credentials provider | ✅ |
| JWT sessions with `role` in token | ✅ |
| Prisma `User` model (SQLite dev) | ✅ |
| `POST /api/auth/register` (client/pilot) | ✅ |
| Login / register UI | ✅ |
| Middleware role guards (edge-safe config split) | ✅ |
| Super-admin-only admin sub-routes | ✅ |
| Seed demo users | ✅ |
| Sign out in dashboard shell | ✅ |

---

## Not in this sprint

- Pilot/client profile creation (M03, M04)
- OAuth providers
- Email verification send
- Password reset
- Moderator/admin self-registration

---

## Test matrix (M02)

| Persona | Test |
|---------|------|
| **Logged-out** | `/dashboard/pilot` → `/login?callbackUrl=...` |
| **Client** | Login → `/dashboard/client`; blocked from `/dashboard/pilot` |
| **Pilot** | Login → `/dashboard/pilot`; blocked from `/dashboard/client` |
| **Moderator** | Login → `/dashboard/admin`; blocked from `/dashboard/admin/users` |
| **Super Admin** | Full admin access including `/dashboard/admin/users` |
| **Mobile** | Login/register forms and dashboard header usable on small viewport |

---

## Acceptance criteria

- [x] Register as client or pilot
- [x] Login with email/password
- [x] Session persists across refresh
- [x] Role-based dashboard redirect and blocking
- [x] Auth pages redirect when already logged in
- [x] Build passes (`npm run build`)

---

## Review → Done

After approval, set M02 to **Done** in `BUILD_CONTROL.md` and begin M03 only per `MODULE_WORKFLOW.md`.
