# Polish & Implementation Checklist

**Superseded for new work by:** [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) (Priorities 1–7).

M01–M18 polish/sign-off items below remain valid where not conflicting with the active priority module.

---

## Deferred (stakeholder confirmed)

Stripe, Stripe Connect, SMTP, M19 SEO, M20 launch QA, production publish.

---

## Product detail (from stakeholder) — Priority queue

| P | Module | Requirements |
|---|--------|----------------|
| 1 | Messaging | Client starts after bid; pilot cannot initiate; threads linked to job/bid/booking; unread counts; admin read-only |
| 2 | Certificates | **Shipped (M22)** — templates, PDF issue, pilot downloads |
| 3 | Disputes | **Shipped (M23)** — open on booking; notes/evidence; moderator review; admin resolve |
| 4 | Verification uploads | **Shipped (M24)** — PDF/images, `storage/verifications/`, admin review |
| 5 | Dashboard completion | **Shipped (M25)** — settings, admin dispute stats, achievements hubs |
| 6 | M15 Wings | **Shipped** — definitions, auto-assign, admin award, public profile |
| 7 | Uniform shop | **Shipped (M26)** — catalog, variants, orders, shop payment status |

---

## Phase A — M01–M18 sign-off (when not blocked by active priority)

See original table in git history; mark Done in `BUILD_CONTROL.md` after smoke test.

---

## Phase E — Smoke-test script

Password: `Demo123!` — Guest → Client job → Moderator approve → Pilot bid → Client accept → Booking complete → Reviews.
