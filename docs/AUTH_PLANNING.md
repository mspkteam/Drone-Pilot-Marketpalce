# Authentication Planning — Sprint 1

Planning document for **M02 — Authentication & User Roles**. No auth implementation in Sprint 1.

---

## Planned stack (ADR-007)

| Item | Choice |
|------|--------|
| Library | [Auth.js](https://authjs.dev/) (NextAuth v5) for Next.js App Router |
| Session | JWT or database sessions (decide in M02 based on hosting) |
| Password | Credentials provider for email/password; OAuth optional later |

**Status:** Implemented (M02) — JWT sessions via Auth.js v5.

---

## Role model

Aligns with `USER_ROLES_PERMISSIONS.md`:

| Role | `User.role` value | Dashboard home |
|------|-------------------|----------------|
| Client | `client` | `/dashboard/client` |
| Pilot | `pilot` | `/dashboard/pilot` |
| Moderator | `moderator` | `/dashboard/admin` |
| Super Admin | `super_admin` | `/dashboard/admin` |

Implementation: `src/types/roles.ts`, `src/lib/auth/config.ts`.

---

## Route protection (M02)

| Path pattern | Rule |
|--------------|------|
| `/dashboard/pilot/*` | Requires `pilot` role |
| `/dashboard/client/*` | Requires `client` role |
| `/dashboard/admin/*` | Requires `moderator` or `super_admin` |
| `/dashboard/admin/settings`, `/users`, `/subscriptions`, `/achievements` | Requires `super_admin` |
| `/login`, `/register` | Redirect to dashboard if already authenticated |

**M02:** `src/middleware.ts` uses edge-safe `auth.config.ts` (no Prisma). `src/auth.ts` adds Credentials provider + database lookup.

---

## Registration flow (M02)

1. User selects **Client** or **Pilot** on `/register`
2. Account created with role
3. Redirect to role dashboard onboarding placeholder
4. Moderator/Admin accounts created by Super Admin only

**Current fields:** email, password, role only (`User` table).

### Future — additional registration fields

Role-specific fields (client vs pilot) will be added per **Figma UX** and onboarding modules (M03/M04). Do not expand M02 register API without updating `docs/DESIGN_AND_FORMS_ROADMAP.md` and the data model. See ADR-010.

---


## Files to add in M02

- `src/lib/auth/index.ts` — Auth.js config
- `src/app/api/auth/[...nextauth]/route.ts` — handler
- Session provider in root layout (client boundary)
- Login/register forms replacing `AuthShell` placeholders
- Middleware enforcement using session + role

---

## References

- `src/lib/auth/config.ts` — route maps
- `docs/USER_ROLES_PERMISSIONS.md` — permission matrix
- `docs/DECISIONS.md` — ADR-007
