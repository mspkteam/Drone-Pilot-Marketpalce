# MVP Scope — Phase 1

Phase 1 delivers a **Fiverr-style marketplace foundation** for the drone industry: licensed pilots and clients can register, post and discover work, bid, book, and complete jobs with basic monetization and trust signals.

**Out of scope for implementation until Phase 1 is complete:** marketplace features not listed below, and all items in [Not Included in Phase 1](#not-included-in-phase-1).

---

## Phase 1 MVP — Included

| Area | Capability |
|------|------------|
| **Marketing** | Homepage / landing page |
| **Auth** | Pilot signup |
| **Auth** | Client signup |
| **Dashboards** | Role-based dashboards (Pilot, Client, Admin) |
| **Profiles** | Pilot profile creation (core fields, services, portfolio basics) |
| **Jobs** | Client job posting |
| **Moderation** | Admin job approval (approve / reject before pilots see job) |
| **Discovery** | Pilot job browsing (approved jobs only) |
| **Matching** | Pilot bidding / applications on jobs |
| **Selection** | Client accepts a pilot (bid/application) |
| **Fulfillment** | Basic booking status flow (e.g. pending → confirmed → in progress → completed → cancelled) |
| **Monetization** | Basic subscription structure (plans, pilot enrollment, status) |
| **Monetization** | 10% platform commission calculation logic (recorded on relevant transactions) |
| **Trust** | Basic reviews (post-completion, rating + comment) |
| **Comms** | Basic email notifications (signup, job status, bid, booking, review — transactional only) |

### Phase 1 success criteria (high level)

- A guest can understand the product from the landing page and register as Pilot or Client.
- A client can post a job; an admin can approve it; a pilot can bid; the client can accept one bid.
- Booking moves through defined statuses; commission is calculable at 10%; basic review and emails fire on key events.
- No Phase 1 feature depends on native mobile app, AI matching, or advanced compliance automation.

---

## Phase 1 user journeys (summary)

1. **Pilot:** Register → complete profile → browse approved jobs → submit bid → get accepted → complete booking → receive review.
2. **Client:** Register → post job → wait for approval → review bids → accept pilot → track booking → leave review.
3. **Admin:** Approve jobs (and basic user/pilot oversight as defined in permissions) → monitor jobs/applications/bookings.

---

## Not Included in Phase 1

The following are **explicitly deferred** to later phases. Do not implement them during Phase 1 unless scope is formally changed in `DECISIONS.md` and this file.

| Item | Notes |
|------|--------|
| Native mobile app | Web-first; API shape may be future-ready but no native clients |
| Advanced certificates | Beyond basic upload/reference fields; full cert lifecycle later |
| Complex disputes | Simple flags/notes only if needed; no full dispute resolution system |
| Full automated compliance system | Manual/admin verification in Phase 1 where needed |
| Advanced analytics dashboard | Basic events/page views only if any; no BI suite |
| Complex regional branch logic | Single-region or simple location fields first |
| AI matching | Manual browse and bid only |
| Advanced rank / wings automation | Achievements module (M15) deferred; no automated rank engine |

---

## Relationship to build control

- Phase 1 maps to modules **M01–M12**, **M16**, **M17** (partial), and **M20** (launch prep) as defined in `BUILD_CONTROL.md`.
- Sprint 1 (`SPRINT_01_FOUNDATION.md`) covers **M01** and planning for **M02** only — not the full MVP feature set.
