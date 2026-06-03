# M05 — Pilot Profiles (Public)

**Status:** Ready for Review  
**Depends on:** M03 (Pilot Onboarding), M10 (Reviews for ratings)

---

## Purpose

Approved pilots can opt into a **public directory** so clients and guests can discover them. Editable dashboard profile gains a visibility toggle; public pages hide license numbers and private data.

---

## Visibility rules

| Condition | Public listing |
|-----------|----------------|
| `status === approved` | Required |
| `isPublic === true` | Required (pilot-controlled) |

---

## Routes

| Route | Description |
|-------|-------------|
| `/pilots` | Public directory (marketing layout) |
| `/pilots/[id]` | Public pilot profile + recent reviews |
| `/dashboard/pilot/profile` | Edit profile + public toggle (when approved) |

---

## Public profile shows

- Display name, bio, location, services, hourly rate range, service radius
- Average rating and review count (from M10)
- Up to 5 recent published reviews

**Hidden:** license number, email, internal status fields.

---

## Test matrix

| Step | Expected |
|------|----------|
| Demo pilot (approved, isPublic) | Appears on `/pilots` |
| Toggle isPublic off in profile | Removed from directory |
| Guest views `/pilots/[id]` | Profile renders; license not shown |
| Pilot with pending_review | Not listed even if isPublic true |

---

## Out of scope

- Portfolio media uploads
- Admin pilot approval UI (M13/M14)
- SEO beyond basic metadata (M19)
