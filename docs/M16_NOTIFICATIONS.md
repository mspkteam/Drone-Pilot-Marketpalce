# M16 — Notifications / Emails

**Status:** Ready for Review  
**Depends on:** M02 (Auth)

---

## Purpose

Transactional **in-app notifications** plus **email logging** on key marketplace events. Phase 1 emails are written to the server console (or skipped in production without `SMTP_URL`); no external provider required for local dev.

---

## Notification model

| Field | Notes |
|-------|--------|
| userId | Recipient |
| type | e.g. `job_approved`, `bid_received` |
| channel | `in_app` (default) |
| title, body | Display copy |
| payload | JSON metadata (jobId, bookingId, etc.) |
| readAt | null = unread |

---

## Events wired

| Event | Recipient | Email |
|-------|-----------|-------|
| Register | New user (welcome) | Yes |
| Job submitted | Client + staff | Yes (critical) |
| Job approved / rejected | Client | Yes (critical) |
| New bid | Client | Preference-gated |
| Bid accepted | Pilot | Yes (critical) |
| Booking confirmed / started / cancelled | Other party | Preference-gated |
| Booking completed | Client + pilot | Yes (critical) |
| Review submitted | Review target | Preference-gated |
| Dispute updates | Parties | Yes (critical) |
| Squadron vote open/close | Parties + A-4+ voters + staff | Yes (critical) |
| Wing / verification | Pilot / staff | Yes (critical) |
| Support chat | Staff / requester | Yes (critical) |

---

## UI & API

| Route | Description |
|-------|-------------|
| Header bell (all dashboards) | Unread count + dropdown list |
| `GET /api/notifications` | List + unread count |
| `POST /api/notifications` | Mark all read |
| `POST /api/notifications/[id]/read` | Mark one read |

---

## Email (dev)

Emails log to terminal as `[email] from → to` with subject and body. Set `EMAIL_FROM` in `.env` optionally. Production requires `SMTP_URL` (integration deferred).

---

## Test

1. Register a new account → welcome notification + console email.
2. Submit / approve a job → client notifications.
3. Submit bid as pilot → client notified.
4. Complete booking flow → status notifications.
5. Check bell icon in dashboard header.

---

## Out of scope

- Resend / SendGrid integration
- Push notifications
- User email preference toggles (settings placeholder only)
