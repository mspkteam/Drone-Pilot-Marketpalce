# Changelog

All notable project changes are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] — 2026-06-01

### Summary

Initial project control documentation and planning foundation for Drone Pilot Marketplace.

### Added

- Created initial project control documentation (`/docs`)
- Defined MVP scope (`MVP_SCOPE.md`)
- Defined module development workflow (`MODULE_WORKFLOW.md`)
- Defined roles and permissions (`USER_ROLES_PERMISSIONS.md`)
- Defined first sitemap (`SITEMAP.md`)
- Defined first data model overview (`DATA_MODEL_OVERVIEW.md`)
- Defined Sprint 1 foundation plan (`SPRINT_01_FOUNDATION.md`)
- Master build control table with modules M01–M20 (`BUILD_CONTROL.md`)
- Architecture decision records (`DECISIONS.md`)
- Root `README.md` with project overview

### Notes

- No application code, database schema, or marketplace features in this release
- Next step: Next.js project foundation setup (Sprint 1 implementation phase)

---

## [0.2.0] — 2026-06-01

### Added

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Aviation-inspired design tokens (black, white, gold) in `src/app/globals.css`
- Marketing layout and pages: home, for-clients, for-pilots, pricing, how-it-works, about, contact
- Auth shells: login, register, waitlist
- Role-separated dashboard shells: pilot, client, admin (all sitemap routes)
- Shared components: `MarketingHeader`, `MarketingFooter`, `DashboardShell`, `Button`, etc.
- Navigation config in `src/lib/navigation/`
- Auth route planning: `src/lib/auth/config.ts`, `docs/AUTH_PLANNING.md`
- Placeholder middleware for dashboard routes (`src/middleware.ts`)
- ADR-007: Auth.js planned for M02

### Notes

- Dashboard routes are preview-accessible (no auth enforcement until M02)
- No database, marketplace logic, or payments

---

## [0.3.0] — 2026-06-02

### Added

- **M02 Authentication & User Roles**
  - Auth.js v5 (Credentials provider, JWT sessions)
  - Prisma `User` model + SQLite (dev) with seed accounts
  - Register API (`POST /api/auth/register`) — client/pilot only
  - Login and register forms
  - Role-based middleware (`auth.config.ts` + edge-safe middleware)
  - Dashboard protection: pilot / client / admin paths
  - Super-admin-only admin routes (users, settings, subscriptions, achievements)
  - Session provider + dashboard sign-out menu
  - `docs/AUTH_PLANNING.md` updated; ADR-007 accepted, ADR-008 added

### Demo accounts (after `npm run db:seed`)

| Email | Role | Password |
|-------|------|----------|
| `client@dronepilot.local` | client | `Demo123!` |
| `pilot@dronepilot.local` | pilot | `Demo123!` |
| `moderator@dronepilot.local` | moderator | `Demo123!` |
| `admin@dronepilot.local` | super_admin | `Demo123!` |

---

## [0.4.0] — 2026-06-02

### Added

- **M03 Pilot Onboarding**
  - `PilotProfile` model (Prisma)
  - `/dashboard/pilot/onboarding` — profile + compliance checklist
  - `/dashboard/pilot/profile` — edit after onboarding
  - `GET/POST/PATCH /api/pilot/profile`
  - Onboarding gate for incomplete pilots
  - New pilot registration → onboarding redirect
  - Pilot dashboard profile status summary
  - Seed: demo pilot profile pre-approved

### Docs

- `docs/M03_PILOT_ONBOARDING.md`

---

## [0.5.0] — 2026-06-02

### Added

- **M04 Client Onboarding**
  - `ClientProfile` model (Prisma)
  - `/dashboard/client/onboarding` — contact, company, billing
  - `/dashboard/client/profile` — edit after onboarding
  - `GET/POST/PATCH /api/client/profile`
  - Onboarding gate for incomplete clients
  - New client registration → client onboarding redirect
  - Client dashboard account summary
  - Seed: demo client profile pre-completed
  - Prisma stale-client check includes `clientProfile`

### Docs

- `docs/M04_CLIENT_ONBOARDING.md`

---

## [0.6.0] — 2026-06-02

### Added

- **M06 Client Job Posting**
  - `Job` model linked to `ClientProfile`
  - Post job form, my jobs list, job detail/edit
  - Draft save and submit for approval (`pending_approval`)
  - Client APIs: jobs CRUD + submit
  - Dashboard quick links and recent jobs

### Docs

- `docs/M06_CLIENT_JOB_POSTING.md`

---

## [0.7.0] — 2026-06-02

### Added

- **M07 Job Approval System**
  - Admin job queue with filters (pending, open, rejected, all)
  - Job review page with approve / reject actions
  - Approve → status `open` + audit fields
  - Reject → `rejected` + required reason for client
  - Admin APIs under `/api/admin/jobs`
  - Admin dashboard pending count
  - Seed: demo pending job for moderation testing

### Docs

- `docs/M07_JOB_APPROVAL.md`

---

## [0.8.0] — 2026-06-02

### Added

- **M08 Pilot Bidding / Applications**
  - `JobApplication` model with unique pilot+job constraint
  - Pilots browse jobs with status `open` only
  - Submit bid: proposed amount, optional message and delivery date
  - First bid moves job to `in_bidding`
  - Pilot pages: Find Jobs, job detail, My Applications
  - APIs: `/api/pilot/jobs`, `/api/pilot/jobs/[id]/applications`, `/api/pilot/applications`
  - Gate: approved pilot profile required
  - Seed: demo `open` job for local bidding tests

### Docs

- `docs/M08_PILOT_BIDDING.md`

---

## [0.9.0] — 2026-06-02

### Added

- **M09 Booking Workflow**
  - `Booking` model (one per job, linked to accepted application)
  - Client review offers at `/dashboard/client/jobs/[id]/offers`
  - Accept bid → booking `pending`, job `assigned`, other bids rejected
  - Client and pilot booking lists and detail pages
  - Status transitions: pending → confirmed → in_progress → completed (job `closed`)
  - Cancel from client or pilot where allowed
  - APIs for offers, accept, bookings, status PATCH
  - Seed: demo pilot bid on open job for accept flow testing

### Docs

- `docs/M09_BOOKING_WORKFLOW.md`

---

## [0.10.0] — 2026-06-02

### Added

- **M10 Reviews & Ratings**
  - `Review` model with unique author per booking
  - Client reviews pilot; pilot reviews client on completed bookings
  - Star rating (1–5) and optional comment validation
  - Review forms on booking detail pages
  - Client and pilot Reviews list pages
  - APIs: `/api/client/reviews`, `/api/pilot/reviews`, booking review POST/GET

### Docs

- `docs/M10_REVIEWS_RATINGS.md`

---

## [0.11.0] — 2026-06-02

### Added

- **M11 Pilot Subscriptions**
  - `SubscriptionPlan` and `PilotSubscription` models
  - Basic ($29) and Pro ($79) plans seeded
  - Pilot subscription page: view plan, enroll, cancel
  - APIs: plans list, current subscription, POST enroll, DELETE cancel
  - Demo pilot seeded with active Basic subscription (30-day period)
  - Phase 1: no payment gateway — local enrollment only

### Docs

- `docs/M11_PILOT_SUBSCRIPTIONS.md`

---

## [0.12.0] — 2026-06-02

### Added

- **M12 Commission System**
  - `Payment` and `Commission` models
  - Auto-record payment + 10% commission when booking completes
  - Client and pilot payment history pages
  - Payment breakdown on completed booking detail
  - APIs for payment lists and per-booking payment

### Docs

- `docs/M12_COMMISSION_SYSTEM.md`

---

## [0.13.0] — 2026-06-02

### Added

- **M16 Notifications / Emails**
  - `Notification` model and in-app notification bell on all dashboards
  - Triggers: welcome, job submit/approve/reject, bids, booking lifecycle, reviews
  - Dev email logging to server console (`[email]` prefix)
  - APIs: list, mark read, mark all read

### Docs

- `docs/M16_NOTIFICATIONS.md`

---

## [0.14.0] — 2026-06-02

### Added

- **M05 Pilot Profiles (public)**
  - Public directory at `/pilots` and profile pages at `/pilots/[id]`
  - Shows services, rates, location, review average and recent reviews
  - Pilot `isPublic` toggle on profile editor (approved pilots only)
  - Marketing nav link: Find Pilots
  - License details excluded from public views

### Docs

- `docs/M05_PILOT_PROFILES.md`

---

## [0.15.0] — 2026-06-02

### Added

- **M17 Public Marketing Pages**
  - Full content for For Clients, For Pilots, How It Works, About, Contact
  - Pricing page with live pilot plans and client commission overview
  - Shared marketing components (features, steps, CTAs)
  - Home page CTAs updated (Find pilots, For clients)
  - Contact form UI (Phase 1 — no backend mailer)

### Docs

- `docs/M17_MARKETING_PAGES.md`

---

## [0.16.0] — 2026-06-02

### Added

- **M13 Admin Dashboard**
  - Overview stats on admin home (pending jobs/pilots, bookings, commission)
  - Pilot approval queue (approve/reject `pending_review`)
  - Client, application, booking, payment, and review moderation UIs
  - Admin booking status updates (support lifecycle)
  - Super Admin: users table, subscriptions overview, settings summary
  - Admin APIs under `/api/admin/*` (stats, pilots, clients, bookings, reviews, etc.)

### Docs

- `docs/M13_ADMIN_DASHBOARD.md`

---

## [0.17.0] — 2026-06-02

### Added

- **M14 Verification System**
  - `Verification` model (license, insurance, identity, other)
  - Pilot submit/list on Certificates page (document link or reference)
  - Admin verification queue with approve/reject + reason
  - Verified badges on public pilot profiles
  - Seed: pending insurance + approved license for demo pilot
  - Admin dashboard pending verifications stat

### Docs

- `docs/M14_VERIFICATION_SYSTEM.md`

---

## [0.26.1] — 2026-07-10

### Added

- **Waitlist CAPTCHA** — Cloudflare Turnstile on `/launch`, `/waitlist`, and standalone waitlist landing
  - Server verification on `POST /api/waitlist` when `TURNSTILE_SECRET_KEY` is set
  - Env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

---

## [0.26.0] — 2026-06-03

### Added

- **M27 Pilot membership tiers (A-1 – A-6)**
  - Replaces Basic/Pro as active marketplace membership (legacy plans deactivated)
  - Tier-based job visibility delay from `job.approvedAt`
  - A-1 view-only after 48h; A-2+ can bid after their delay; A-6 immediate
  - Instructor eligibility on A-4+
  - Central `src/lib/membership/membership.ts` + 11 unit tests
  - Updated pilot subscription UI, jobs list, admin pilots/subscriptions, pricing page

### Docs

- `docs/M27_PILOT_MEMBERSHIP_TIERS.md`

---

## [0.25.0] — 2026-06-02

### Added

- **M26 Uniform Shop (Priority 7)**
  - Product catalog with variants (SKU, price, stock)
  - Pilot cart, checkout, shipping, order history
  - Separate shop `paymentStatus` and order fulfillment status
  - Demo internal pay (no Stripe); admin catalog (Super Admin) and order management (Moderator+)
  - Seeded polo, jacket, and cap products

### Docs

- `docs/M26_UNIFORM_SHOP.md`

---

## [0.24.0] — 2026-06-02

### Added

- **M15 Digital Wings (Priority 6)**
  - `WingDefinition` and `PilotWing` models with eight seeded wings
  - Auto-assign on booking complete, verification approve, certificate issue, pilot approve, 5★ review
  - Super Admin: define wings, toggle active, manual award, recent awards audit
  - Pilot Digital Wings page; badges on public pilot profiles
  - Notification type `wing_earned`

### Docs

- `docs/M15_DIGITAL_WINGS.md`

---

## [0.23.0] — 2026-06-02

### Added

- **M25 Dashboard Completion (Priority 5)**
  - Client and pilot settings: account info, password change, notifications
  - Pilot public profile visibility toggle on settings
  - `GET /api/account`, `POST /api/account/password`
  - Admin overview: active disputes card and quick links
  - Admin Achievements hub (certificates + M15 roadmap); pilot Digital Wings hub

### Docs

- `docs/M25_DASHBOARD_COMPLETION.md`

---

## [0.22.0] — 2026-06-02

### Added

- **M24 Verification File Uploads (Priority 4)**
  - PDF, JPEG, PNG, WebP uploads (max 5 MB) to `storage/verifications/`
  - Multipart submit on `POST /api/pilot/verifications`; JSON link fallback retained
  - Authenticated document download for pilot owner and admin reviewers
  - Pilot and admin UI: file upload, view uploaded document
  - Notification types: `verification_approved`, `verification_rejected`

### Docs

- `docs/M24_VERIFICATION_UPLOADS.md`

---

## [0.21.0] — 2026-06-02

### Added

- **M23 Dispute Resolution (Priority 3)**
  - `Dispute` and `DisputeEntry` models (one dispute per booking)
  - Client/pilot open dispute on confirmed, in-progress, or completed bookings
  - Timeline entries: notes, evidence (URL), comments
  - Moderator review workflow (`open` → `under_review`)
  - Super Admin resolution: full payout, partial payout, refund (internal payment adjustment)
  - Booking detail dispute section; admin queue and detail pages
  - In-app notifications on dispute updates

### Docs

- `docs/M23_DISPUTE_RESOLUTION.md`

---

## [0.20.0] — 2026-06-02

### Added

- **M22 Certificate System (Priority 2)**
  - Certificate templates with placeholder body text
  - Admin issue flow generates PDF (pdfkit) and stores under `storage/certificates/`
  - Unique certificate numbers `DPM-YYYY-######`
  - Pilot certificates page with PDF download
  - Admin certificates page (templates + issue + audit)
  - Pilot nav split: Verifications, Certificates, Digital Wings
  - Seed: Platform Verified Pilot cert for demo pilot

### Docs

- `docs/M22_CERTIFICATE_SYSTEM.md`

---

## [0.19.0] — 2026-06-02

### Added

- **M21 Messaging System (Priority 1)**
  - Conversation threads per job application (job, bid, optional booking link)
  - Clients start chats after receiving a pilot bid; pilots reply only
  - Unread counts + nav badge + in-app notifications (`message_received`)
  - Client, pilot, and admin (read-only) messaging pages and APIs

### Docs

- `docs/M21_MESSAGING.md`
- `docs/DEVELOPMENT_ROADMAP.md` updated

---

## [0.18.0] — 2026-06-02

### Added

- **M18 Waitlist / Launch Funnel**
  - `WaitlistEntry` model with role interest and region
  - Public `/waitlist` form and `POST /api/waitlist`
  - Admin waitlist table with role filters
  - Welcome email via dev console log on new signup
  - Register links pre-select role from waitlist success
  - Seed waitlist entries + admin dashboard subscriber count

### Docs

- `docs/M18_WAITLIST.md`

---

## [Unreleased]

### Planned
- M18 Waitlist backend
- M20 Launch prep
