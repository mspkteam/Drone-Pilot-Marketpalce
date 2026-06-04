# Drone Pilot Marketplace

A scalable, Fiverr-style marketplace for the drone industry — connecting **licensed drone pilots** with **clients** who need aerial video, surveys, inspections, events, real estate drone work, and related services.

---

## Project purpose

Build a professional platform where:

- **Pilots** showcase credentials, find work, bid on jobs, and manage bookings.
- **Clients** post jobs, review pilots, accept bids, and pay for completed work.
- **Admins** approve jobs and pilots, oversee operations, and configure platform rules (including commission).

The product is **web-first**, **mobile-first**, and **future-ready** for API and native mobile expansion — without building those clients in Phase 1.

---

## Phase 1 MVP (summary)

Phase 1 delivers core marketplace flows:

- Landing page, pilot and client signup, role-based dashboards
- Pilot profiles, client job posting, admin job approval
- Pilot job browse, bidding, client accept bid
- Basic booking statuses, subscription structure, **10% commission** logic
- Basic reviews and transactional emails

**Not in Phase 1:** native mobile app, AI matching, advanced compliance automation, complex disputes, advanced analytics, regional branch logic, advanced wings automation.

Full detail: [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md)

---

## Main user roles

| Role | Description |
|------|-------------|
| **Guest** | Public marketing and auth entry |
| **Client** | Posts jobs, accepts bids, manages bookings |
| **Pilot** | Profile, certifications, bids, fulfills jobs |
| **Moderator** | Approves jobs/pilots, operational admin |
| **Super Admin** | Full users, settings, subscriptions |

Permissions: [`docs/USER_ROLES_PERMISSIONS.md`](docs/USER_ROLES_PERMISSIONS.md)

---

## Build workflow

Development follows a **strict module loop** — one module at a time, tested across Admin, Pilot, Client, logged-out, and mobile personas — with **no new module starting until the current one is documented and approved**.

1. Define purpose, data, screens, permissions  
2. Build only that module  
3. Test all personas  
4. Review → approve → update changelog  
5. Next module  

Details: [`docs/MODULE_WORKFLOW.md`](docs/MODULE_WORKFLOW.md)  
Module tracker: [`docs/BUILD_CONTROL.md`](docs/BUILD_CONTROL.md)

---

## Tech direction

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| UI | Mobile-first, aviation-inspired (black / white / gold) |
| Database (local / demo) | SQLite via Prisma |
| Database (production) | **Neon** PostgreSQL (not Supabase) — see ADR-011 |

Stack decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)

---

## Documentation

All planning and control docs live in **`/docs`**:

| Document | Purpose |
|----------|---------|
| [`BUILD_CONTROL.md`](docs/BUILD_CONTROL.md) | Module status, priorities, dependencies |
| [`MVP_SCOPE.md`](docs/MVP_SCOPE.md) | Phase 1 in / out of scope |
| [`MODULE_WORKFLOW.md`](docs/MODULE_WORKFLOW.md) | Per-module development loop |
| [`USER_ROLES_PERMISSIONS.md`](docs/USER_ROLES_PERMISSIONS.md) | Role permission matrix |
| [`DATA_MODEL_OVERVIEW.md`](docs/DATA_MODEL_OVERVIEW.md) | Entity planning (no migrations yet) |
| [`SITEMAP.md`](docs/SITEMAP.md) | Public and dashboard routes |
| [`SPRINT_01_FOUNDATION.md`](docs/SPRINT_01_FOUNDATION.md) | Sprint 1 plan and acceptance criteria |
| [`DECISIONS.md`](docs/DECISIONS.md) | Architecture decision records |
| [`CHANGELOG.md`](docs/CHANGELOG.md) | Version history |
| [`DESIGN_AND_FORMS_ROADMAP.md`](docs/DESIGN_AND_FORMS_ROADMAP.md) | Figma UI/UX + extended registration (planned) |

---

## Current phase

**Post-MVP features (Priorities 2–7)** — see [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md).

- **Done (latest):** A-1 – A-6 pilot membership tiers — [`docs/M27_PILOT_MEMBERSHIP_TIERS.md`](docs/M27_PILOT_MEMBERSHIP_TIERS.md)
- **Deferred:** Stripe, SMTP, M19 SEO, M20 launch QA, publishing

Module tracker: [`docs/BUILD_CONTROL.md`](docs/BUILD_CONTROL.md)

Public pilots: [`docs/M05_PILOT_PROFILES.md`](docs/M05_PILOT_PROFILES.md)

Job posting: [`docs/M06_CLIENT_JOB_POSTING.md`](docs/M06_CLIENT_JOB_POSTING.md)

---

## Getting started (developers)

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
# Create .env from .env.example (copy the file on Windows)
npm run db:push        # create SQLite database
npm run db:seed        # demo users (password: Demo123!)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Client | `client@dronepilot.local` | `Demo123!` |
| Pilot (A-6 Captain) | `pilot@dronepilot.local` | `Demo123!` |
| Pilot (A-1 Student) | `pilot-a1@dronepilot.local` | `Demo123!` |
| Pilot (A-2 Junior) | `pilot-a2@dronepilot.local` | `Demo123!` |
| Admin | `admin@dronepilot.local` | `Demo123!` |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Membership tier visibility tests |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:seed` | Seed demo users |
| `npm run db:studio` | Open Prisma Studio |

### Project structure

```
src/
  app/
    (marketing)/     # Public pages + home
    (auth)/          # Login, register, waitlist shells
    dashboard/       # Pilot, client, admin dashboards
  components/        # Layout and UI primitives
  lib/
    auth/            # Route protection config (M02)
    navigation/      # Nav items per area
  types/             # Shared types (roles)
docs/                # Planning and build control
```

### Before building features

1. Read [`docs/MODULE_WORKFLOW.md`](docs/MODULE_WORKFLOW.md) and [`docs/BUILD_CONTROL.md`](docs/BUILD_CONTROL.md).
2. Confirm scope in [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md).
3. **Do not** implement jobs, bidding, or payments until M01 is approved and M02 (auth) is complete.

Auth planning: [`docs/AUTH_PLANNING.md`](docs/AUTH_PLANNING.md)

---

## License

TBD — add license before public release.
