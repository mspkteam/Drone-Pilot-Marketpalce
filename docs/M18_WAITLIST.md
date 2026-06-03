# M18 — Waitlist / Launch Funnel

**Status:** Ready for Review  
**Depends on:** M01 (Foundation)

---

## Purpose

Capture pre-launch interest from guests who are not ready to register: email, role interest (pilot/client/both), optional region, and marketing source. Admins can review signups; successful joins trigger a dev-console welcome email (same pattern as M16).

---

## Data model

`WaitlistEntry`:

| Field | Notes |
|-------|--------|
| email | Unique |
| name | Optional |
| roleInterest | `pilot` \| `client` \| `both` |
| region | Optional city/region for launch prioritization |
| source | Optional UTM or referrer slug (`?source=`, `?utm_source=`) |
| status | `subscribed` \| `unsubscribed` |

**Rules:** Duplicate subscribed email returns success (idempotent). Resubscribe updates fields if previously unsubscribed.

---

## Routes

| Route | Description |
|-------|-------------|
| `/waitlist` | Public signup form |
| `/dashboard/admin/waitlist` | Admin subscriber list |
| `POST /api/waitlist` | Public join (no auth) |
| `GET /api/admin/waitlist?role=` | Admin list (moderator+) |

Success state links to `/register?role=pilot` or `client` for immediate signup.

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Guest | Submit waitlist → 201 + confirmation |
| Guest | Same email again → 200 “already on list” |
| Admin | View/filter waitlist in dashboard |
| Pilot/Client | Can also join waitlist (public API) |
| Invalid email | 400 |

---

## Demo flow

1. `npm run db:push && npm run db:seed`
2. Visit `/waitlist` → submit form
3. Check terminal for `[email]` welcome log
4. Log in as moderator → **Waitlist** → see seed + new entries
5. Success links → register with role pre-selected

---

## Out of scope

- Double opt-in / unsubscribe UI
- CRM / Mailchimp integration
- Automated nurture sequences
- CSV export
