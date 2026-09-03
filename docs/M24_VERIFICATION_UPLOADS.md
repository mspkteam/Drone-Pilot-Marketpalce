# M24 — Verification File Uploads

**Version:** 0.22.0  
**Depends on:** M14 (Verification System), M03, M13

## Overview

Pilots can upload **PDF or images** (JPEG, PNG, WebP) up to **5 MB** for verification review. Files are stored under `storage/verifications/` (gitignored). The existing **pending → approved/rejected** workflow is unchanged. External document links remain supported as a fallback.

## Data model

`Verification` additions:

| Field | Notes |
|-------|--------|
| `documentUrl` | Optional external link |
| `documentFileName` | Stored basename `{id}.{ext}` |
| `documentMimeType` | MIME for download headers |
| `originalFileName` | Pilot-facing download label |

At least one of `documentUrl` or `documentFileName` is required on submit.

## APIs

| Method | Path | Role |
|--------|------|------|
| POST | `/api/pilot/verifications` | JSON (link) or `multipart/form-data` (file) |
| GET | `/api/pilot/verifications/[id]/document` | Pilot owner |
| GET | `/api/admin/verifications/[id]/document` | Moderator+ |

Multipart fields: `type`, `file`, optional `notes`, optional `documentUrl` (if no file).

## Security

- MIME allowlist + size cap server-side
- Files served only to document owner (pilot) or admin roles
Public pilot profiles show badges only — no document download.

Profile LICENSE & COMPLIANCE is read-only. Approved uploads from this catalog appear there and on the public profile:

- FAA Part 107
- FAA Aircraft Registration
- EASA C-1 / C-2 / C-3 / STS / LPC
- Insurance Certificate (optional)
- Business Registration (optional)

Government ID and additional certifications stay on the Verification tab only.

## Smoke test

1. `npm run db:push`
2. `pilot@dronepilot.local` → **Verifications** → upload a PDF
3. `moderator@dronepilot.local` → **Verifications** → open document → approve
4. Confirm badge on public pilot profile

## Deferred

- S3 / cloud storage
- Automated virus scanning
- Expiry cron for `expired` status
