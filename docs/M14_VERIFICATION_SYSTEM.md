# M14 — Verification System

**Status:** Ready for Review  
**Depends on:** M03 (Pilot Onboarding), M13 (Admin Dashboard)

---

## Purpose

Pilots submit license, insurance, identity, or other certification references for admin review. Approved verifications display as trust badges on public pilot profiles.

**File uploads** (M24): PDF/images in `storage/verifications/`. **Link/reference** submit remains supported.

---

## Data model

`Verification`:

| Field | Notes |
|-------|--------|
| pilotProfileId | FK → PilotProfile |
| type | `license` \| `insurance` \| `identity` \| `other` |
| documentUrl | Optional external link (8–500 chars) |
| documentFileName, documentMimeType, originalFileName | Uploaded file (M24) |
| notes | Optional pilot notes |
| status | `pending` \| `approved` \| `rejected` \| `expired` |
| reviewedAt, reviewedByUserId | Admin audit |
| rejectionReason | Required on reject |

**Rule:** One `pending` submission per type per pilot at a time.

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard/pilot/achievements` | Submit + list own verifications |
| `/dashboard/admin/verifications` | Admin review queue |
| `GET/POST /api/pilot/verifications` | Pilot list + submit |
| `GET /api/admin/verifications?status=` | Admin list |
| `POST /api/admin/verifications/[id]/approve` | Approve |
| `POST /api/admin/verifications/[id]/reject` | Reject with reason |

Public profiles show **Verified {type}** badges for approved types.

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Pilot | Submit verification; 409 on duplicate pending same type |
| Pilot | See status + rejection reason |
| Moderator | Approve/reject pending items |
| Client | Cannot access verification APIs |
| Public | Approved types shown on `/pilots/[id]` |

---

## Demo flow

1. `npm run db:push && npm run db:seed`
2. Log in as `moderator@dronepilot.local` → **Verifications** → approve/reject demo insurance pending item
3. Log in as `pilot@dronepilot.local` → **Certificates / Wings** → submit new verification
4. View `/pilots/{pilotId}` — see Verified Drone license badge (seeded approved)

---

## Out of scope

- S3 / cloud object storage (local disk only in M24)
- Automated expiry jobs (`expired` status manual/future)
- Identity provider integration
- Digital wings (M15)
