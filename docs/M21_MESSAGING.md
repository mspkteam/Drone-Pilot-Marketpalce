# M21 — Messaging System (Priority 1)

**Status:** Ready for Review  
**Depends on:** M08 (Applications), M09 (Bookings)

---

## Purpose

Internal messaging between clients and pilots, tied to marketplace context. Supports pre-booking coordination and post-accept threads.

---

## Rules

| Rule | Detail |
|------|--------|
| Pilot initiate | **Not allowed** |
| Client initiate | Only after a pilot **submitted** bid on the client's job |
| Replies | Both parties once thread exists |
| Admin | **Read-only** — no sending |

---

## Data model

- `Conversation` — unique per `jobApplicationId`; links `jobId`, optional `bookingId`
- `Message` — `body`, `senderUserId`, `createdAt`
- `ConversationReadState` — per-user `lastReadAt` for unread counts

---

## Routes

| Route | Role |
|-------|------|
| `/dashboard/client/messages` | Client inbox + start from bid |
| `/dashboard/client/messages/[id]` | Client thread |
| `/dashboard/pilot/messages` | Pilot inbox |
| `/dashboard/pilot/messages/[id]` | Pilot thread |
| `/dashboard/admin/messages` | Admin read-only list |
| `/dashboard/admin/messages/[id]` | Admin transcript |

### APIs

- `POST/GET /api/client/conversations`
- `GET/POST /api/client/conversations/[id]/messages`
- `GET /api/pilot/conversations`
- `GET/POST /api/pilot/conversations/[id]/messages`
- `GET /api/admin/conversations` (+ `[id]`)
- `GET /api/messages/unread-count`

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Client | Start thread from bid; send/receive; unread badge |
| Pilot | 403 on POST create; can reply in existing thread |
| Pilot | Cannot start thread without client |
| Admin | Read all threads; cannot POST messages |
| Booking accept | Links `bookingId` on conversation |

---

## Demo flow

1. Client job with pilot bid (seed)
2. Client → Messages → Message pilot
3. Pilot → Messages → reply
4. Moderator → Messages → read-only view
