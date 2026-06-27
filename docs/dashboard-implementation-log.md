# Dashboard Implementation Log

Screen-by-screen log for the Dashboard Design Phase (post–marketing Figma).

**Status values:** Pending Review | In Progress | Implemented | Blocked

---

## Phase 1 — Dashboard shell / template (2026-06-08)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-08 |
| **Figma reference** | [Dashboard shell frame 361:911](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=361-911) |
| **Phase** | Shell / template only |
| **Status** | Implemented |

### Routes reviewed

- `/dashboard/pilot/*` (16 routes)
- `/dashboard/client/*` (11 routes)
- `/dashboard/admin/*` (19 routes)

Public marketing/legal pages were **not** modified.

### Components created

- `DashboardSidebar`
- `DashboardTopbar`
- `DashboardNavGroup`
- `DashboardNavItem`
- `DashboardNavIcon`
- `DashboardRankCard`
- `DashboardUserCard`
- `lib/dashboard/shell-user.ts` (user + rank card builders)
- `lib/navigation/dashboard-pilot.ts`
- `lib/navigation/dashboard-client.ts`
- `lib/navigation/dashboard-admin.ts`
- `types/dashboard-nav.ts`

### Components reused

- `DashboardShell` (refactored to compose shell components)
- `NotificationBell`
- `MessagesNavBadge`
- `DashboardPageLayout` and existing inner page components (unchanged)
- `homeAssets.logo` for circular sidebar mark

### Files updated

- `src/components/layout/DashboardShell.tsx`
- `src/app/dashboard/pilot/layout.tsx`
- `src/app/dashboard/client/layout.tsx`
- `src/app/dashboard/admin/layout.tsx`
- `src/lib/navigation/pilot.ts` (re-exports)
- `src/lib/navigation/client.ts` (re-exports)
- `src/lib/navigation/admin.ts` (re-exports)
- `src/app/globals.css` (`.dashboard-app` cockpit tokens + shell styles)
- `src/components/dashboard/index.ts`

### Roles affected

- Pilot — full Figma-grouped nav + rank card + user block
- Client — grouped nav + user block (no rank card)
- Admin / Super Admin / Moderator — grouped nav + user block (shared admin layout)

### Missing modules / tasks documented

| Module | Role | Why | Route | Priority | Status |
|--------|------|-----|-------|----------|--------|
| M31-Locked Jobs filter | Pilot | Separate locked-job view from marketplace jobs list | `/dashboard/pilot/jobs` | Medium | Pending |
| M32-Pilot Portfolio | Pilot | Dedicated portfolio gallery (Figma nav item) | `/dashboard/pilot/portfolio` (TBD) | Medium | Pending — interim link to profile |
| M33-Pilot Support page | Pilot | Dedicated support hub (currently settings + widget) | `/dashboard/pilot/support` (TBD) | Low | Pending |
| M34-Rank progression API | Pilot | Live rank % on sidebar card | Sidebar rank card | Medium | Pending — mock 62% |
| M35-Moderator shell | Moderator | Limited nav vs full admin | `/dashboard/moderator` (TBD) | Low | Pending — uses admin layout today |
| M36-Client shell polish | Client | Figma-specific client flight-deck IA | Client sidebar | Medium | Phase 2 |
| M37-Admin shell polish | Admin | Command-center IA vs generic groups | Admin sidebar | Medium | Phase 2 |

### Notes / assumptions

- Inner dashboard page content (widgets, tables, forms) was **not** redesigned in Phase 1.
- Pilot rank card uses profile display name + membership tier when available; progress % is static (62%) until progression API exists.
- `Locked Jobs` and `Marketplace` both route to `/dashboard/pilot/jobs` until M31 adds filtered views.
- `Portfolio` routes to profile until M32 exists.
- `Support` routes to pilot settings; floating support widget remains available.
- Desktop sidebar collapse toggles via topbar menu button; mobile uses overlay drawer.
- Topbar **Back** uses `router.back()`; no route-specific back stack yet.
- Sign-out moved out of topbar for this shell pass; account block is display-only (dropdown in Phase 2).

### Figma MCP reconsideration (2026-06-08)

| Field | Value |
|-------|--------|
| **Figma frame** | [361:911](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=361-911) |
| **MCP status** | Rate-limited (Starter plan) — `get_design_context` unavailable |
| **Action** | Manual alignment pass against written frame spec |

**Adjustments after reconsideration:**
- Pilot call sign formatted as `CDR. {SURNAME}` (rank card + user block)
- Rank label uses `HOME_PILOT_RANKS` codes (e.g. `A-3 FLIGHT OFFICER`) not DB tier title strings
- Pilot sidebar nav trimmed to exact Figma groups (Certificates / Digital Wings removed from shell; routes still exist)
- Dashboard topbar notification uses gold dot indicator (not count badge)
- User avatar initials derived from call sign (`CDR. STERLING` → `CS`)

**Still pending visual verify via Figma MCP when quota resets:**
- Exact sidebar width/spacing pixel compare
- Icon stroke weights vs design system icons
- Rank card corner bracket size

### Next steps (Phase 2+)

1. Approve shell visually against Figma 361:911.
2. Redesign pilot dashboard overview page only (flight deck home).
3. Then inner menu pages one-by-one per role.
4. Wire rank card to real progression data (M34).
5. Add dedicated routes for portfolio, locked jobs, support.

---

## Phase 2 — Client Dashboard “Dashboard” tab (2026-06-02)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma reference** | [Client dashboard overview frame 179:1002](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=179-1002) |
| **Route** | `/dashboard/client` |
| **Phase** | Client dashboard overview only |
| **Status** | Implemented |

### Figma MCP

| Field | Value |
|-------|--------|
| **MCP status** | Unavailable (no MCP server connected in session) |
| **Action** | Built from written layout spec + existing dashboard design tokens |
| **Assumption** | Section order, copy, spacing, and colors follow task spec; pixel pass pending when MCP available |

### Section order implemented

1. Welcome hero panel (pill, gold client name, CTA buttons)
2. Four stat cards (Active Projects, Quotes Received, Projects Completed, Pending Actions)
3. Recent Projects + Recent Activity (2fr / 1fr desktop grid)
4. Recommended Pilots (3-card row)

### Components created

- `ClientDashboardOverview`
- `ClientDashboardWelcome`
- `ClientDashboardStats`
- `ClientDashboardRecentProjects`
- `ClientDashboardRecentActivity`
- `ClientDashboardRecommendedPilots`

### Components reused

- `DashboardPageLayout`
- `DashboardStatusBanner` (onboarding complete message)
- `dashboard-card`, `dashboard-stats-grid`, `dashboard-card-header` (globals.css tokens)
- Existing dashboard shell (sidebar, topbar) — unchanged

### Files created

- `src/lib/client/dashboard-overview-mock.ts`
- `src/components/dashboard/client/*`

### Files updated

- `src/app/dashboard/client/page.tsx`
- `src/app/globals.css` (`.client-dashboard-*` tokens)
- `src/components/dashboard/index.ts`

### Mock data

Structured arrays in `dashboard-overview-mock.ts` for stats, recent projects, activity feed, and recommended pilots. Client welcome name uses first name from `ClientProfile.contactName`, falling back to **John**.

### Links / routes connected

| UI action | Route |
|-----------|--------|
| Post New Project | `/dashboard/client/jobs/new` |
| Browse pilots | `/pilots` |
| View all (projects) | `/dashboard/client/jobs` |
| See all (pilots) | `/pilots` |
| View profile (mock cards) | `/pilots` (directory until named pilots exist in DB) |

### Missing modules discovered

| Module | Role | UI status | Backend work | Route / component | Priority | Status |
|--------|------|-----------|--------------|-------------------|----------|--------|
| M38-Client dashboard overview API | Client | Mock stats/projects/activity | Aggregate jobs, quotes, bookings, activity from DB | `/dashboard/client` | Medium | Pending |
| M39-Client quotes/offers management | Client | Status badges only in mock rows | Offers list, accept/reject, pilot assignment | `/dashboard/client/jobs/[id]/offers` | Medium | Pending |
| M40-Client activity feed | Client | Static feed items | Notifications + job events aggregation | Client dashboard activity card | Medium | Pending |
| M41-Recommended pilots engine | Client | Static pilot cards | Ranking by rating, location, services | Recommended pilots section | Low | Pending |
| M42-Mock pilot profile deep links | Client | Cards link to `/pilots` list | Seed/public pilots for John Smith, Sarah Chen, Daniel Okafor | `/pilots/[id]` | Low | Pending |

### Notes / assumptions

- Dashboard shell not redesigned; Client sidebar **Dashboard** item remains active on `/dashboard/client`.
- No public marketing/legal pages modified.
- Primary CTA uses gold fill + dark text per spec (not default `Button` primary white text).
- Figma MCP pixel compare deferred until server available.
- Onboarding redirect + completion banner preserved from prior page.

### Next steps (Client dashboard)

1. Visual approve against Figma 179:1002 when MCP available.
2. Wire M38 overview API (replace mock arrays).
3. Build next client inner page (e.g. My Jobs or Post Job) — one screen at a time.

---

## Phase 2b — Client Dashboard rebuild (screenshot pass) (2026-06-02)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Source** | Screenshot + written layout spec (no Figma MCP) |
| **Route** | `/dashboard/client` |
| **Status** | Implemented |

### Fixes applied

- Removed generic `dashboard-card` / `dashboard-card-header` usage (hover gradients + broken headers)
- Added dedicated `ClientDashboardCard` panel component
- Tightened section gaps to ~28–32px (`.client-dashboard-page`)
- Hero: flat `#16130F` base, right gold glow only, ~220px min-height, 36px title, fixed button widths
- Stats: dedicated 4-col grid, ~126px card height, no icons
- Middle grid: `2fr / 1fr`, ~340px min-height cards, mission-row project list
- Activity: clean gold-dot feed (no boxed items)
- Pilots: header outside cards; horizontal stats row with gold star; split price (`from` + amount)
- Welcome name fixed to **John** for screenshot/mock phase

### Recommended Pilots section pass (2026-06-02)

- Header: title 22px, subtitle 14px, gold “See all →” outside cards
- Cards: `#1E1B16`, 15px radius, ~205px min-height, 22px padding
- Stats row: gold star + rating, project count, clock + hours
- Tags: darker pill background (`#252118`), compact 11px pills
- View profile links → `/pilots/john-smith`, `/pilots/sarah-chen`, `/pilots/daniel-okafor` (slug placeholders; M42 — route uses DB ids today)

---

## Phase 3 — Client Dashboard Post New Project wizard (2026-06-02)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec (no Figma MCP) |
| **Route** | `/dashboard/client/jobs/new` |
| **Status** | Implemented |

### Form steps

1. Service — 10 selectable service cards (2-col grid)
2. Location — address/city/state with add-another-location
3. Requirements — deliverables, dates, file picker UI, special requirements
4. Budget & Timeline — quote type, budget range, priority, deadline
5. Review — summary cards + Submit / Edit

### Components created

- `ClientPostProjectWizard`
- `PostProjectProgress`
- `PostProjectStepService`, `PostProjectStepLocation`, `PostProjectStepRequirements`, `PostProjectStepBudget`, `PostProjectStepReview`
- `PostProjectIcons`

### Components reused

- Existing dashboard shell (sidebar **Post Job** active on `/dashboard/client/jobs/new`)
- Job create + submit API (`POST /api/client/jobs`, `POST /api/client/jobs/[id]/submit`)

### Files created

- `src/lib/client/post-project.ts`
- `src/components/dashboard/client/post-project/*`

### Files updated

- `src/app/dashboard/client/jobs/new/page.tsx`
- `src/app/globals.css` (`.client-post-project-*`)

### Submission behavior

- Maps wizard state → existing M06 job payload via `postProjectToJobPayload()`
- Creates job and submits for admin approval (real API, not mocked)
- Redirects to `/dashboard/client/jobs?submitted=1`

### Missing modules discovered

| Module | Notes | Status |
|--------|-------|--------|
| M43 | Multi-location persistence (UI adds cards; API uses primary site) | Pending |
| M44 | Reference file upload/storage | Pending |
| M45 | Quote type, priority, deliverables as DB fields | Pending — embedded in description/requirements |
| M46 | Pilot matching / notify on post | Pending |
| M47 | Dedicated client project detail page | Pending — uses jobs list/detail |

### Notes

- `JobPostForm` retained in codebase; page now uses `ClientPostProjectWizard`
- File input is UI-only (filenames tracked locally, not uploaded)
- Lightweight per-step validation only
- Sidebar label updated to **Post New Project** (later renamed to **Post a Project** — see Phase 3b)

---

## Phase 3b — Client Dashboard Sidebar Menu (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Dashboard Sidebar Menu |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec |
| **Status** | Implemented |

### Menu structure

**Workspace:** Dashboard, Post a Project, My Projects, Project Quotes, Find Pilots  
**Account:** Messages, Billing, Settings

### Files updated

- `src/lib/navigation/dashboard-client.ts` — Workspace + Account groups, labels, hrefs, icons
- `src/app/dashboard/client/layout.tsx` — bottom user card: **John Doe** / **JD** / Client account
- `src/types/dashboard-nav.ts` — optional `activeExclude` for prefix active-state edge cases
- `src/components/dashboard/shell/DashboardNavGroup.tsx` — `activeExclude` handling

### Routes connected

| Menu item | Route | Page exists |
|-----------|-------|-------------|
| Dashboard | `/dashboard/client` | Yes |
| Post a Project | `/dashboard/client/jobs/new` | Yes |
| My Projects | `/dashboard/client/jobs` | Yes |
| Project Quotes | `/dashboard/client/quotes` | **No** — pending M39 |
| Find Pilots | `/pilots` | Yes (public directory) |
| Messages | `/dashboard/client/messages` | Yes |
| Billing | `/dashboard/client/payments` | Yes (label **Billing**, existing payments page) |
| Settings | `/dashboard/client/settings` | Yes |

### Missing routes/pages

- `/dashboard/client/quotes` — Project Quotes hub (tracked under **M39** Client Quotes / Offers UI)

### Active state behavior

- Dashboard active on `/dashboard/client` only (not child routes)
- Post a Project active on `/dashboard/client/jobs/new`
- My Projects active on `/dashboard/client/jobs` and job detail/offer routes; **excludes** `/dashboard/client/jobs/new` via `activeExclude`
- Billing active on `/dashboard/client/payments`

### Notes / assumptions

- Existing dark aviation sidebar shell unchanged; no pilot rank card on client layout
- Pilot, admin, and moderator nav configs untouched
- Client user card uses screenshot mock **John Doe** / **JD** for all signed-in clients until profile shell wiring (M50)
- **Billing** menu label maps to existing payments route (no `/dashboard/client/billing` alias)
- **Find Pilots** links to public `/pilots` (leaves dashboard shell; no in-shell active state)

---

## Phase 4 — Client My Projects page (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client My Projects |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec |
| **Route** | `/dashboard/client/jobs` (prompt alias `/client/projects`) |
| **Status** | Implemented |

### Page layout

- Header: **My Projects** title + subtitle + gold **New Project** button
- Status tabs: All, Active, Awaiting Quotes, In Progress, Completed, Cancelled, Pending
- 2-column project card grid (1 column on mobile/tablet)
- Tab filtering via local React state

### Components created

- `ClientMyProjects` — page shell, tabs, grid, empty state
- `ClientProjectCard` — project card with badge, stats strip, actions
- `ClientMyProjectsIcons` — pin, calendar, plus icons

### Components reused

- `DashboardPageLayout` — dashboard content wrapper
- Existing client dashboard shell (sidebar **My Projects** active on `/dashboard/client/jobs`)
- Gold button styling pattern from client dashboard welcome

### Files created

- `src/lib/client/my-projects-mock.ts`
- `src/components/dashboard/client/my-projects/*`

### Files updated

- `src/app/dashboard/client/jobs/page.tsx` — replaced legacy `PageHeader` + `ClientJobsList` with screenshot UI
- `src/app/globals.css` — `.client-my-projects-*` tokens

### Mock data

Six projects per screenshot: Commercial Property Survey, Wedding Event Coverage, Construction Inspection, Lakeside Real Estate Tour, Solar Farm Thermal Scan, Roof Inspection — Plano.

### Links / routes connected

| Action | Route |
|--------|-------|
| New Project | `/dashboard/client/jobs/new` |
| View Quotes | `/dashboard/client/quotes?project=<slug>` |
| View Details | `/dashboard/client/jobs/<slug>` |
| Sidebar My Projects | `/dashboard/client/jobs` |

### Missing modules discovered

| Module | Notes |
|--------|-------|
| M39 | Project Quotes hub — `/dashboard/client/quotes` (View Quotes links ready) |
| M47 | Client project detail page — mock slugs link to `/dashboard/client/jobs/<slug>`; DB detail uses real job IDs |
| M51 | Client project listing API — replace `CLIENT_MY_PROJECTS` mock with DB query + status filters |

### Missing backend integrations

- No Supabase — project uses Prisma; listing/filtering not wired
- `ClientJobsList` API fetch (`GET /api/client/jobs`) replaced on this page by mock data; API remains for other flows

### Notes / assumptions

- Route follows existing project structure (`/dashboard/client/jobs`), not prompt shorthand `/client/projects`
- **Pending** tab shows empty state (no mock pending projects)
- Submitted-project success banner preserved from prior jobs page (`?submitted=1`)
- `ClientJobsList` component retained in codebase for potential reuse
- Badge tones: gold (Awaiting Bids, Active, In Progress), red (Cancelled), green (Completed)

---

## Phase 5 — Client Project Bids / Bid Management (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Project Bids / Bid Management |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec + bidding terminology correction |
| **Route** | `/dashboard/client/quotes` (prompt alias `/client/quotes`) |
| **Status** | Implemented (mock/local state) |

### Terminology

- Page title: **Project Bids** (sidebar label remains **Project Quotes**)
- Pilot offers framed as **bids**, not simple quotes
- My Projects: **Bids received**, **View Bids**, tab **Awaiting Bids**

### Page layout

- Header + subtitle
- Project summary bar (Commercial Property Survey · Dallas, TX · 3 bids received)
- Filter tabs: All Bids, Pending Review, Shortlisted, Accepted, Declined
- Full-width stacked bid cards with pilot profile, bid amount, delivery, status, highlights
- Accept bid confirmation modal + success banner

### Components created

- `ClientProjectBids` — page shell, tabs, local bid state, accept flow
- `ClientProjectBidCard` — horizontal bid row with actions
- `AcceptBidModal` — confirm accept dialog
- `ClientProjectBidsIcons` — star, clock, verified, message icons

### Components reused

- `DashboardPageLayout` — dashboard content wrapper
- Existing client dashboard shell (sidebar **Project Quotes** active on `/dashboard/client/quotes`)

### Files created

- `src/lib/client/project-bids-mock.ts`
- `src/components/dashboard/client/project-bids/*`
- `src/app/dashboard/client/quotes/page.tsx`

### Files updated

- `src/app/globals.css` — `.client-project-bids-*` tokens
- `src/components/dashboard/client/my-projects/ClientProjectCard.tsx` — Bids terminology
- `src/lib/client/my-projects-mock.ts` — `bidsCount`, Awaiting Bids tab/status

### Mock bid data

John Smith ($1,200 / 2 days), Sarah Chen ($1,450 / 1 day, Shortlisted), Daniel Okafor ($980 / 3 days).

### Local state actions

- **Shortlist** — toggles Pending Review ↔ Shortlisted
- **Decline** — marks bid Declined
- **Accept Bid** — modal confirm → Accepted; other non-declined bids → Declined
- Tab filtering by bid status

### Links / routes connected

| Action | Route |
|--------|-------|
| Message | `/dashboard/client/messages` |
| View Profile | `/pilots/<slug>` (M42 placeholder slugs) |
| View Bids (from My Projects) | `/dashboard/client/quotes?project=<slug>` |
| Sidebar Project Quotes | `/dashboard/client/quotes` |

### Missing bidding backend modules

| Module | Notes |
|--------|-------|
| M52 | Client project bids listing API (per project, with status filters) |
| M53 | Pilot bid submission API + bid table/schema |
| M54 | Bid status update API (shortlist, decline, accept) |
| M55 | Booking creation after bid acceptance |
| M56 | Escrow/payment after accepted bid |
| M57 | Bid acceptance/decline notifications |
| M42 | Pilot profile deep links (slug → DB id) |
| M47 | Client project detail page |

### Missing Supabase/backend integrations

- No bid table writes; mock React state only
- No booking, escrow, or payment on accept
- Messaging links to messages hub; no thread-per-bid wiring
- `?project=<slug>` query not yet used to load project-specific bids

### Notes / assumptions

- Route kept at `/dashboard/client/quotes` to avoid breaking sidebar links
- Sarah Chen starts Shortlisted per screenshot; others Pending Review
- Accept flow shows success message only — no API persistence
- Removed incomplete `project-quotes` partial components; replaced by `project-bids` module

---

## Phase 6 — Client Find Pilots (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Find Pilots |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec |
| **Route** | `/dashboard/client/find-pilots` (prompt alias `/client/find-pilots`) |
| **Status** | Implemented (mock/local state) |

### Page layout

- Header: **Find verified pilots** + subtitle
- Search input (name, city, specialty) + specialty filter chips
- 3-column pilot card grid (2 tablet, 1 mobile)
- Empty state when search/filter yields no matches

### Components created

- `ClientFindPilots` — search, filter chips, grid, empty state
- `ClientFindPilotCard` — pilot card with stats, tags, View profile CTA
- `ClientFindPilotsIcons` — pin, star, clock, verified icons

### Components reused

- `DashboardPageLayout` — dashboard content wrapper
- Existing client dashboard shell (sidebar **Find Pilots** active on `/dashboard/client/find-pilots`)

### Files created

- `src/lib/client/find-pilots-mock.ts`
- `src/components/dashboard/client/find-pilots/*`
- `src/app/dashboard/client/find-pilots/page.tsx`

### Files updated

- `src/lib/navigation/dashboard-client.ts` — Find Pilots href → in-dashboard route
- `src/lib/client/dashboard-overview-mock.ts` — browse/see-all pilots links
- `src/app/globals.css` — `.client-find-pilots-*` tokens

### Mock pilot data

Six cards (John Smith, Sarah Chen, Daniel Okafor × 2) with ratings, projects, hours, tags, and day rates.

### Local search/filter state

- Text search across name, city, location, tags, categories
- Toggle filter chips: Aerial Photography, Survey, Inspection, Thermal, Events
- Combined AND filtering (search + active chip)

### Links / routes connected

| Action | Route |
|--------|-------|
| View profile | `/pilots/<slug>` (M42 placeholder slugs) |
| Sidebar Find Pilots | `/dashboard/client/find-pilots` |
| Dashboard “See all” / Browse pilots | `/dashboard/client/find-pilots` |

### Missing modules discovered

| Module | Notes |
|--------|-------|
| M58 | Client pilot directory listing API |
| M59 | Pilot specialty/category DB filtering |
| M60 | Pilot availability data on directory cards |
| M61 | Invite pilot to bid on a project |
| M42 | Pilot profile slug → real DB profile IDs |

### Missing backend integrations

- No API or database queries; `find-pilots-mock.ts` only
- Public `/pilots` pages unchanged; profile links use existing public route
- No invite-to-bid or messaging wiring from cards

### Notes / assumptions

- Sidebar moved from public `/pilots` to in-dashboard route for active shell state
- Mock data structured for later swap to directory API (M58)
- Repeated pilot rows match screenshot grid density

---

## Phase 6b — Client Find Pilots style fix (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Find Pilots (styling pass) |
| **Date** | 2026-06-02 |
| **Route** | `/dashboard/client/find-pilots` |
| **Status** | Implemented |

### What changed

- Moved Find Pilots styles from `globals.css` into dedicated `src/styles/client-find-pilots.css`
- **Explicit import** in `src/app/dashboard/client/find-pilots/page.tsx` so styles load with the page
- Scoped selectors under `.client-find-pilots-shell` with `appearance: none` resets for search input and filter chips (overrides browser/Tailwind defaults)
- Refined tokens to match screenshot: gold avatar, light search field, dark chips, card shadow/hover, divider, gold CTA button
- Breakpoints: 3-col above 1100px, 2-col 701–1100px, 1-col ≤700px; toolbar stacks on mobile

### CSS / files updated

- `src/styles/client-find-pilots.css` (created)
- `src/app/dashboard/client/find-pilots/page.tsx` — CSS import
- `src/components/dashboard/client/find-pilots/ClientFindPilotCard.tsx` — divider element
- `src/app/globals.css` — removed duplicate find-pilots block

### Notes

- Mock data and search/filter logic unchanged; visual-only pass
- Public `/pilots` pages untouched

---

## Phase 7 — Client Messages (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Messages |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec |
| **Route** | `/dashboard/client/messages` (prompt alias `/client/messages`) |
| **Status** | Implemented |

### Existing chat system reused

- **List API:** `GET /api/client/conversations` (from `MessagesInbox` logic)
- **Thread API:** `GET /api/client/conversations/[id]` + `POST .../messages` (from `ConversationThread`)
- **Start conversation:** `POST /api/client/conversations` with `jobApplicationId` (eligible pilot bids)
- **Read/unread:** `markConversationRead` on thread GET (existing backend)
- **Not duplicated:** `MessagesInbox` / `ConversationThread` retained for pilot/admin flows

### Components created

- `ClientMessagesView` — two-panel inbox + thread orchestrator
- `ClientMessagesIcons` — paperclip, send icons

### Components reused (patterns/logic)

- Conversation list fetch + eligible applications from `MessagesInbox`
- Send message + thread load from `ConversationThread`
- Types from `@/types/messaging`

### Files created

- `src/lib/client/client-messages-mock.ts` — UI fallback conversations
- `src/lib/client/client-messages-utils.ts` — initials, relative time formatters
- `src/components/dashboard/client/messages/*`
- `src/styles/client-messages.css`

### Files updated

- `src/app/dashboard/client/messages/page.tsx` — screenshot two-panel layout
- `src/app/dashboard/client/messages/[id]/page.tsx` — same layout with `initialConversationId`

### CSS / import

- Dedicated `src/styles/client-messages.css` imported by both messages pages
- Scoped under `.client-messages-shell` with input/button resets

### Mock data (fallback only)

When API returns no conversations (or list fetch fails), shows John Smith / Sarah Chen / Daniel Okafor mock threads. Local mock send appends outgoing messages only — no DB writes.

### Links / routes

| Route | Purpose |
|-------|---------|
| `/dashboard/client/messages` | Inbox + chat panel |
| `/dashboard/client/messages/[id]` | Deep link opens selected thread in same layout |

### Missing modules / pending

| Module | Notes |
|--------|-------|
| M21 | Real-time messaging / websocket (polling not added) |
| M62 | Chat file attachments (paperclip UI placeholder only) |
| M63 | Pilot online/presence status (static "Pilot · Online" label) |
| M64 | Message push/email notifications |

### Notes / assumptions

- No second chat backend; mock fallback is UI-only when inbox empty
- Pilot messages page now uses the same two-panel layout as Client Messages (Phase 15)
- Attachment button disabled with tooltip; no upload API exists today
- Mobile: list ↔ chat toggle with back button ≤900px

---

## Phase 8 — Client Billing & Payments (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Billing & Payments |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec |
| **Route** | `/dashboard/client/payments` (sidebar **Billing**; prompt alias `/client/billing`) |
| **Status** | Implemented (UI redesign) |

### Existing payment page reused

- **Route:** same `src/app/dashboard/client/payments/page.tsx` — not duplicated
- **API:** `GET /api/client/payments` preserved (same fetch as `PaymentsList`)
- **Types:** `PaymentListItemDto` from `@/types/payment`
- **Pilot payments:** `PaymentsList` component unchanged for pilot dashboard

### Components created

- `ClientBillingPayments` — screenshot layout with payment method + invoices
- `ClientBillingIcons` — plus, card, download icons

### Files created

- `src/lib/client/billing-mock.ts` — default card + fallback invoices
- `src/components/dashboard/client/billing/*`
- `src/styles/client-billing.css`

### Files updated

- `src/app/dashboard/client/payments/page.tsx` — replaced `PageHeader` + `PaymentsList` with `ClientBillingPayments`

### CSS / import

- `src/styles/client-billing.css` imported on payments page
- Scoped under `.client-billing-shell` with button resets

### Invoice data behavior

- When `/api/client/payments` returns records → mapped to invoice rows (project title, date, gross amount)
- When empty → screenshot mock invoices (INV-1001…1003)
- PDF / Add method / Manage → placeholder actions; pending Stripe (M65) and PDF (M66)

### Missing backend integrations

- No Stripe customer or payment method APIs
- No invoice PDF generation/download endpoint
- Escrow/post-bid payment flow still pending (M56)

### Notes / assumptions

- Sidebar label **Billing** unchanged; route stays `/dashboard/client/payments`
- Saved Visa ····4242 is mock UI until Stripe wiring
- Commission/booking links from old page removed from UI; payment history still from same API

---

## Phase 9 — Client Account Settings (2026-06-02)

| Field | Value |
|-------|--------|
| **Module** | Client Account Settings |
| **Date** | 2026-06-02 |
| **Source** | Screenshot spec + merge with existing settings |
| **Route** | `/dashboard/client/settings` (prompt alias `/client/settings`) |
| **Status** | Implemented |

### Existing settings preserved

- `GET /api/account` — account load
- `PATCH /api/client/profile` — profile save (contact name, phone, company, billing)
- `POST /api/account/password` — password change
- `POST /api/notifications` — mark all notifications read
- Link to `/dashboard/client/profile` full editor
- Pilot `AccountSettingsPanel` unchanged on pilot settings route

### Screenshot sections added/restyled

- **Profile information** — full name, email (read-only), phone
- **Notifications** — toggles: Email updates, New bids, Messages, Project updates
- **Save changes** — gold CTA saves profile + local notification prefs

### Recent-version sections preserved (restyled)

- **Company & billing** — company name + billing address fields from `ClientProfileFormFields`
- **Account** — role, status, member since, email
- **Change password** — current/new/confirm with existing API
- In-app notification note + unread count + mark all read

### Components created

- `ClientAccountSettings` — merged client settings UI
- `ClientSettingsToggle` — accessible gold switch

### Files created

- `src/lib/client/settings-notifications.ts`
- `src/components/dashboard/client/settings/*`
- `src/styles/client-settings.css`

### Files updated

- `src/app/dashboard/client/settings/page.tsx`

### CSS / import

- `src/styles/client-settings.css` imported on settings page

### Mock/local state

- Notification toggles default per screenshot; persisted in `localStorage` until M68 API
- Profile fallbacks when API profile missing (John Doe / phone placeholder)

### Missing backend integrations

| Module | Notes |
|--------|-------|
| M68 | Notification preference API / user settings table |
| M69 | Email notification service for bid/message/project events |

### Notes / assumptions

- Email field read-only (no account email change API)
- Terminology: **New bids** not "New quotes" in notification row
- `AccountSettingsPanel` retained for pilot dashboard only

---

## Client Dashboard — Complete module map (2026-06-02)

Single reference for everything that makes up the **client dashboard** today: new screenshot UI (Phases 2–9), pre-existing operational modules (bookings, disputes, reviews), and pending dynamic work.

### A. Shell & navigation

| Item | Route / location | Status | Notes |
|------|------------------|--------|-------|
| Dashboard shell | All `/dashboard/client/*` | **Done** | Sidebar, topbar, user card (Phase 1) |
| Client sidebar IA | `dashboard-client.ts` | **Done** | Workspace + Account (Phase 3b) |
| Onboarding gate | `layout.tsx` | **Done** | Redirects incomplete profiles to onboarding |

### B. Sidebar pages (screenshot UI — Phases 2–9)

| Sidebar label | Route | UI phase | Data today |
|---------------|-------|----------|------------|
| Dashboard | `/dashboard/client` | Phase 2 | Mock overview |
| Post a Project | `/dashboard/client/jobs/new` | Phase 3 | **Real API** (create + submit job) |
| My Projects | `/dashboard/client/jobs` | Phase 4 | Mock list + tabs |
| Project Quotes | `/dashboard/client/quotes` | Phase 5 | Mock bids + local accept/decline |
| Find Pilots | `/dashboard/client/find-pilots` | Phase 6 | Mock directory + search |
| Messages | `/dashboard/client/messages` | Phase 7 | **Real API** + mock fallback |
| Billing | `/dashboard/client/payments` | Phase 8 | **Real API** + mock card/invoices |
| Settings | `/dashboard/client/settings` | Phase 9 | **Real API** profile/password + local notification prefs |

### C. Operational pages (pre-existing — real backend)

These routes are **not** in the new sidebar but are part of the full client cockpit and use live APIs.

| Area | Route | Module | Status |
|------|-------|--------|--------|
| Onboarding | `/dashboard/client/onboarding` | **M04** Client onboarding | **Done** |
| Profile editor | `/dashboard/client/profile` | **M04** | **Done** |
| Job detail / edit | `/dashboard/client/jobs/[id]` | **M06** Job posting | **Done** |
| Job offers (bids on job) | `/dashboard/client/jobs/[id]/offers` | **M08** Applications | **Done** |
| Bookings list | `/dashboard/client/bookings` | **M09** Bookings | **Done** |
| Booking detail | `/dashboard/client/bookings/[id]` | **M09** | **Done** |
| Reviews | `/dashboard/client/reviews` | **M10** Reviews | **Done** |
| Message deep link | `/dashboard/client/messages/[id]` | **M21** Messaging | **Done** (same hub UI as Phase 7) |

### D. Dispute resolution (**M23** — sidebar + booking detail)

Clients can manage disputes from the **Workspace → Disputes** sidebar item or from booking detail.

| Item | Detail |
|------|--------|
| **Module** | **M23** Dispute Resolution (`docs/M23_DISPUTE_RESOLUTION.md`) |
| **Client list** | `/dashboard/client/disputes` — `ClientDisputesList` (screenshot UI) |
| **Client detail** | `/dashboard/client/disputes/[id]` — `ClientDisputeDetail` + `BookingDisputeSection` |
| **Booking entry** | `/dashboard/client/bookings/[id]` → **Dispute** section (still available) |
| **Component** | `BookingDisputeSection` (`actor="client"`) |
| **Status** | **Ready for Review** — full backend + UI shipped in v0.21; client hub added in dashboard pass |

**Client capabilities (real API):**

- Open **one dispute per booking** (confirmed, in-progress, or completed)
- View dispute status badge and timeline
- Add entries: notes, evidence (URL), comments
- Booking status moves to `disputed` when open

**Client APIs:**

| Method | Path |
|--------|------|
| GET | `/api/client/disputes` (list for client) |
| GET | `/api/client/disputes/[id]` |
| GET | `/api/client/bookings/[id]/dispute` |
| POST | `/api/client/bookings/[id]/dispute` |
| POST | `/api/client/disputes/[id]/entries` |

**Related on same booking detail page:**

| Section | Module |
|---------|--------|
| Booking summary + status actions | **M09** `BookingDetailCard` |
| Payment / commission | **M12** `BookingPaymentSection` |
| Dispute | **M23** `BookingDisputeSection` |
| Post-job review | **M10** `BookingReviewSection` |

**Admin/moderator side (not client UI):** `/dashboard/admin/disputes` — review and resolve (M13 + M23).

### E. End-to-end client journey (how modules connect)

```text
Register (M02) → Onboarding (M04) → Dashboard home (mock, M38 pending)
  → Post Project (M06, real) → Admin approve job (M07)
  → Pilots bid (M08) → Project Bids UI (mock accept, M52–M55 pending)
  → Accept bid → Booking (M09, real)
  → Payment on booking (M12) → Dispute if needed (M23, real)
  → Review pilot (M10) → Invoice in Billing (M12 API / M66 PDF pending)
  → Messages with pilot (M21, real)
```

### F. Foundation modules (platform — underpin client dashboard)

| ID | Module | Client relevance |
|----|--------|------------------|
| M02 | Auth & roles | Client session, route guards |
| M04 | Client onboarding | Profile before dashboard |
| M06 | Job posting | Post Project wizard |
| M07 | Job approval | Jobs visible to pilots |
| M08 | Applications / bids | Offers + Project Bids source data |
| M09 | Bookings | Hire flow after accept |
| M10 | Reviews | Reviews page + booking section |
| M12 | Commission / payments | Billing history, booking payment |
| M21 | Messaging | Messages hub |
| M23 | **Dispute resolution** | **Booking dispute section** |
| M25 | Dashboard completion | Settings + admin dispute stats |

### G. Pending — mock UI → dynamic backend

| ID | Area | Pending work |
|----|------|----------------|
| M38 | Dashboard home | Live stats, projects, activity API |
| M40–M42 | Dashboard home | Activity feed, recommended pilots, profile links |
| M43–M47 | Post / projects | Wizard gaps, project detail page |
| M51 | My Projects | Listing API + status filters |
| M52–M57 | Project Bids | Bid API, accept → booking, escrow, notifications |
| M58–M61 | Find Pilots | Directory API, filters, invite to bid |
| M62–M64 | Messages | Attachments, presence, push |
| M65–M66 | Billing | Stripe methods, invoice PDFs |
| M68–M69 | Settings | Notification prefs API, email service |

### H. What is “complete” vs “polish pending”

| Layer | Complete? |
|-------|-----------|
| Client shell + 8 sidebar pages (visual) | **Yes** |
| Post project, bookings, disputes, messages, payments API, reviews, profile | **Yes** (operational) |
| Screenshot pages using live data everywhere | **No** — home, projects list, bids, find pilots still mock |
| Stripe, invoice PDFs, bid-accept → booking automation | **No** — documented M52–M66 |

### Notes

- Dispute UI uses legacy `PageHeader` + card layout on booking detail; not yet restyled to Phase 2–9 dark cards — **functional, not screenshot-polished**.
- Bookings list/detail same — real M09/M23, pre-screenshot styling.
- Future polish: restyle bookings + dispute sections to match `.client-*` dashboard tokens without changing M23 behavior.

---

## Phase 10 — Pilot Dashboard Overview (2026-06-09)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Dashboard Overview |
| **Route implemented** | `/dashboard/pilot` (alias redirect: `/pilot/dashboard` → `/dashboard/pilot`) |
| **Status** | Implemented |

### Existing modules reused (logic preserved)

| Module | Reuse |
|--------|--------|
| M03/M05 Profile | `getPilotProfileByUserId`, profile completion % from `getPilotDashboardOverview` |
| M08 Jobs / bids | `listOpenJobsForPilot` → recommended job cards; links to `/dashboard/pilot/jobs/[id]` |
| M27 Membership / locked jobs | `PilotLockedJobDto.visibleAt` + countdown; mock rows when queue empty |
| M09 Bookings | Active contracts + due-this-week counts from `Booking` |
| M10 Reviews | Prisma fetch for sidebar review cards; mock when none published |
| M12 Payments | Earnings totals + this-month delta from succeeded payments |
| M14 Verification | Approved verification types → profile checklist + VERIFIED badge |
| M16 Notifications | Recent notifications → activity feed; mock when empty |
| M11/M27 Subscription | Tier rank badge, membership days remaining |
| Dashboard shell | `DashboardShell`, `pilotNavGroups`, `DashboardPageLayout`, onboarding banners |

### Components created

- `PilotDashboardOverview`
- `PilotDashboardHero`
- `PilotDashboardStats`
- `PilotDashboardRecommendedJobs`
- `PilotDashboardLockedJobs`
- `PilotDashboardProfileStrength`
- `PilotDashboardReviews`
- `PilotDashboardActivityFeed`
- `PilotCountdownTimer`

### Lib / data

- `src/lib/pilot/dashboard-page-data.ts` — `getPilotDashboardPageData()` (live DB + mock fallbacks)
- `src/lib/pilot/dashboard-overview-mock.ts` — sample jobs, locked rows, reviews, activity
- `src/lib/dashboard/shell-user.ts` — exported `rankLabelForTier()` for hero badge

### Files updated

- `src/app/dashboard/pilot/page.tsx` — screenshot overview (replaces generic `DashboardHero` / module grid)
- `src/app/pilot/dashboard/page.tsx` — redirect alias
- `src/styles/pilot-dashboard.css` — aviation mission-control tokens + bracket accents

### Mock data used (when live empty)

- Recommended jobs (4 cards) when approved but no open jobs
- Locked job countdown rows when no tier-delay jobs in queue
- Review cards when no published reviews
- Activity feed when no in-app notifications

### Live APIs / Prisma used

- `getPilotDashboardOverview`, `listOpenJobsForPilot`, `getPilotMembershipSummary`
- `getApprovedVerificationTypes`
- Counts: applications, bookings, payments, reviews, notifications

### Links connected

| CTA | Route |
|-----|--------|
| Browse Jobs | `/dashboard/pilot/jobs` |
| Complete Profile | `/dashboard/pilot/profile` |
| Upload Documents | `/dashboard/pilot/verifications` |
| View Earnings | `/dashboard/pilot/payments` |
| Submit Proposal | `/dashboard/pilot/jobs/[id]` |
| View All jobs | `/dashboard/pilot/jobs` |
| Reviews | `/dashboard/pilot/reviews` |

### Missing backend / pending (see BUILD_CONTROL M70–M79)

- Pilot proposal shortlist status tracking
- On-time completion rate (98% placeholder when jobs completed)
- Portfolio item count (checklist shows 4/8 partial — M05 portfolio)
- Dedicated pilot activity feed aggregation (uses notification list today)
- Rank-based locked job requirement labels (shows tier delay for live jobs)
- Pilot earnings API polish (uses payment records; not Stripe payout dashboard)

### Notes / assumptions

- Canonical route remains `/dashboard/pilot` per existing app structure; `/pilot/dashboard` redirects.
- Shell/sidebar/topbar unchanged; **Dashboard** nav item active on home.
- Client/Admin/Moderator dashboards untouched.
- Production build passes after implementation.

---

## Phase 11 — Pilot Mission Marketplace / Browse Jobs (2026-06-09)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Mission Marketplace |
| **Route implemented** | `/dashboard/pilot/jobs` (alias: `/pilot/jobs` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| M08 Pilot bidding | `GET /api/pilot/jobs` via `listOpenJobsForPilot` |
| M27 Membership visibility | Tier note, locked jobs section, `lockedJobs` from API |
| M08 Job detail + proposal | CTA links to `/dashboard/pilot/jobs/[id]` (`PilotBidForm` unchanged) |
| `PilotOpenJobsList` | Superseded on jobs page; component kept for compatibility |
| `requirePilotEligibleToBid` | API gate (approved + tier) |

### Components created

- `PilotMissionMarketplace` — header, search, filter pills, grid, locked section
- `PilotMissionCardView` — mission card UI

### Lib / data

- `src/lib/pilot/marketplace-map.ts` — `mapOpenJobToMissionCard`, client-side search filter
- `src/lib/pilot/marketplace-mock.ts` — 6 sample missions when API jobs empty
- Extended `PilotOpenJobDto` with `clientDisplayName` (from job `clientProfile`)

### Files updated

- `src/app/dashboard/pilot/jobs/page.tsx` — screenshot marketplace layout
- `src/app/pilot/jobs/page.tsx` — redirect alias
- `src/lib/applications/application.ts` — client name on open job DTO
- `src/lib/membership/membership.ts` — include `clientProfile` on job list query
- `src/types/application.ts` — `clientDisplayName` field
- `src/styles/pilot-marketplace.css`

### Search / filter behavior

- **Search:** filters cards by title, client, category, location, license, description (local)
- **Filter pills:** UI placeholders (LOCATION, SERVICE, etc.) — toggle shows pending notice (M80)

### Mock data used

- 6 varied mission cards when marketplace returns zero visible jobs (approved pilots)

### Live API used

- `GET /api/pilot/jobs` — jobs, lockedJobs, membership, applyBlockedMessage

### Links connected

| CTA | Route |
|-----|--------|
| View & Submit Proposal | `/dashboard/pilot/jobs/[id]` |
| Membership (no tier) | `/dashboard/pilot/subscription` |

### Missing backend / pending (M80–M86)

- Server-side search/filter (location, service, budget, deadline, rank, distance)
- Client rating on marketplace cards (shows 4.9 placeholder; M86)
- Portfolio/license eligibility rules per card
- Dedicated locked-job countdown on marketplace (static unlock time text today)

### Notes

- Sidebar **Marketplace** → `/dashboard/pilot/jobs`; **Locked Jobs** → `/dashboard/pilot/locked-jobs` (updated in Phase 12).
- Client rating on cards is UI placeholder until client review aggregate API exists.
- Production build passes.

---

## Phase 12 — Pilot Locked Jobs (2026-06-09)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Locked Jobs |
| **Route implemented** | `/dashboard/pilot/locked-jobs` (alias: `/pilot/locked-jobs` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| M27 Membership visibility | `lockedJobs` from `GET /api/pilot/jobs` / `listOpenJobsForPilot` |
| M11 Subscription | Upgrade CTA → `/dashboard/pilot/subscription` |
| `PilotCountdownTimer` | Live countdown from `visibleAt` ISO timestamps |
| `PilotDashboardLockedJobs` | Dashboard home widget unchanged; dedicated page is new UI |

### Components created

- `PilotLockedJobsView` — header, notice bar, grid
- `PilotLockedJobCardView` — locked pill, budget, countdown box, upgrade CTA

### Lib / data

- `src/lib/pilot/locked-jobs-map.ts` — maps `PilotLockedJobDto` → card view model
- `src/lib/pilot/locked-jobs-mock.ts` — 6 sample locked missions when API queue empty
- Extended `PilotLockedJobDto` with budget + requirements fields

### Files updated

- `src/lib/navigation/dashboard-pilot.ts` — **Locked Jobs** → `/dashboard/pilot/locked-jobs`
- `src/lib/applications/application.ts` — enriched locked job DTO
- `src/types/application.ts`
- `src/components/dashboard/pilot/PilotCountdownTimer.tsx` — optional `className`
- `src/styles/pilot-locked-jobs.css`

### Countdown behavior

- **Live:** `PilotCountdownTimer` ticks every second toward `visibleAt` from M27
- **Mock:** static offsets when no locked jobs in API response

### Mock data used

- 6 screenshot-style cards when `lockedJobs` array is empty

### Links connected

| CTA | Route |
|-----|--------|
| Upgrade Plan to Unlock | `/dashboard/pilot/subscription` |
| No membership error | `/dashboard/pilot/subscription` |

### Missing backend / pending (M87–M92)

- Certification eligibility rules (B2/A3 labels on live cards are derived from category/delay)
- Rank-based instant unlock (notice text is static A-4 prompt)
- Subscription payment upgrade flow (M11 demo enroll only)
- Job unlock notifications when timer expires
- Dedicated `GET /api/pilot/locked-jobs` (uses shared jobs API today)

### Notes

- Sidebar **Locked Jobs** now has its own route; **Marketplace** remains `/dashboard/pilot/jobs`.
- Production build passes.

---

## Phase 13 — Pilot My Proposals (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot My Proposals |
| **Route implemented** | `/dashboard/pilot/proposals` (alias: `/pilot/proposals` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| M08 Bidding / applications | `listApplicationsForPilot`, `GET /api/pilot/applications` |
| `PilotApplicationsList` | Legacy list component kept; not used on new page |
| `PilotBidForm` | Post-submit redirect updated to proposals page |
| `/dashboard/pilot/applications` | Redirects to proposals (preserves `?submitted=1`) |
| `/dashboard/pilot/jobs/[id]` | VIEW → links to mission detail (bid context) |

### Components created

- `PilotMyProposalsView` — header, status tabs, filterable table, empty state
- `PilotProposalStatusBadge` — PENDING / SHORTLISTED / ACCEPTED / REJECTED / WITHDRAWN pills

### Lib / data

- `src/lib/pilot/proposals-map.ts` — maps `PilotApplicationListItemDto` → table row; `ApplicationStatus` → UI status
- `src/lib/pilot/proposals-mock.ts` — 5 screenshot-style rows when API returns empty
- Extended `listApplicationsForPilot` with `clientDisplayName` on job payload
- Extended `PilotApplicationListItemDto` with `clientDisplayName`

### Files updated

- `src/app/dashboard/pilot/proposals/page.tsx` — new page
- `src/app/pilot/proposals/page.tsx` — alias redirect
- `src/app/dashboard/pilot/applications/page.tsx` — redirect to proposals
- `src/lib/navigation/dashboard-pilot.ts` — **My Proposals** → `/dashboard/pilot/proposals`
- `src/components/pilot/PilotBidForm.tsx` — success redirect to proposals
- `src/lib/applications/application.ts` — client display name on pilot application list
- `src/types/application.ts` — `clientDisplayName` on list DTO
- `src/lib/pilot/dashboard-overview-mock.ts` — proposals route in quick links
- `src/styles/pilot-proposals.css`

### CSS / style files

- `src/styles/pilot-proposals.css` — imported on proposals page; scoped under `.pilot-proposals-shell.dashboard-page`

### Mock proposal data used

- 5 rows matching screenshot (includes one SHORTLISTED) when `GET /api/pilot/applications` returns no rows
- Tab counts derive from live or mock rows dynamically

### Existing data / hooks / APIs used

- `GET /api/pilot/applications` — primary data source
- `mapApplicationStatusToUi`: `submitted` → PENDING; `accepted` → ACCEPTED; `rejected`/`expired` → REJECTED; `withdrawn` → WITHDRAWN
- No `shortlisted` in Prisma `ApplicationStatus` today — SHORTLISTED appears in mock only

### Status filtering behavior

- Local React state; default tab **PENDING**
- Tabs: PENDING, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN with live counts
- Empty tab shows styled “No proposals found” card; PENDING empty (live data) links to marketplace

### Links / routes connected

| Action | Route |
|--------|--------|
| VIEW → | `/dashboard/pilot/jobs/[jobId]` (existing mission detail) |
| Legacy applications | `/dashboard/pilot/applications` → `/dashboard/pilot/proposals` |
| Bid form success | `/dashboard/pilot/proposals?submitted=1` |
| Sidebar **My Proposals** | `/dashboard/pilot/proposals` (active on this path) |

### Missing modules discovered

- Dedicated proposal detail route (`/dashboard/pilot/proposals/[proposalId]`)
- SHORTLISTED status in schema/API
- Pilot proposal withdrawal action from this page
- Client shortlist/review workflow surfacing shortlisted state to pilot
- Accepted proposal → active contract/booking handoff from list
- Proposal status change notifications

### Missing backend / Supabase integrations

- `ApplicationStatus.shortlisted` (or equivalent) + client shortlist API
- `GET /api/pilot/applications` enrichment: stable display IDs, shortlisted flag
- `POST` withdraw proposal endpoint
- Notification events on accept/reject/shortlist
- Proposal detail payload (notes, revision history) separate from job detail

### Notes / assumptions

- Pilot terminology: **Proposals**; client-side equivalent is **Bids** (unchanged on client dashboard).
- VIEW → uses job detail route because no proposal-detail page exists yet.
- Table scrolls horizontally inside card on narrow viewports; page does not overflow.
- Client/Admin/Moderator dashboards and public pages untouched.
- Production build passes.

---

## Phase 14 — Pilot Active Contracts (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Active Contracts |
| **Route implemented** | `/dashboard/pilot/contracts` (alias: `/pilot/contracts` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| M09 Bookings | `listBookingsForPilot`, `GET /api/pilot/bookings` |
| `BookingsList` | Legacy list kept; bookings list page now redirects to contracts |
| `/dashboard/pilot/bookings/[id]` | Deliver Work + Open Dispute actions; status/dispute/payment sections |
| `BookingDisputeSection` | `#dispute` anchor added for card deep links |
| Client My Projects CSS | Shared `.client-my-projects-*` classes for header, tabs, grid, cards, buttons |

### Client My Projects design pattern reused

- Same shell class (`client-my-projects-shell`)
- Header: title + subtitle + top-right gold CTA (Browse Jobs)
- Status tabs with gold active underline + divider
- 2-column card grid (1 column mobile)
- Card: title + badge, meta row with icons, inner stats strip, action buttons
- Empty state card styling

### Components created

- `PilotActiveContracts` — header, tabs, API fetch, filter, grid
- `PilotContractCard` — contract card using shared My Projects card classes
- `PilotActiveContractsIcons` — client, contract, briefcase icons

### Lib / data

- `src/lib/pilot/active-contracts-mock.ts` — 5 mock contracts, tabs, filter, badge tones, routes
- `src/lib/pilot/active-contracts-map.ts` — maps `BookingListItemDto` → contract card view model

### Files updated

- `src/app/dashboard/pilot/contracts/page.tsx` — new page
- `src/app/pilot/contracts/page.tsx` — alias redirect
- `src/app/dashboard/pilot/bookings/page.tsx` — redirects to contracts
- `src/app/dashboard/pilot/bookings/[id]/page.tsx` — back link → contracts
- `src/lib/navigation/dashboard-pilot.ts` — **Active Contracts** → `/dashboard/pilot/contracts`
- `src/lib/pilot/dashboard-overview-mock.ts` — contracts route
- `src/components/disputes/BookingDisputeSection.tsx` — `id="dispute"` anchor
- `src/app/globals.css` — danger button + contract card action layout helpers

### CSS / style files

- Reuses `client-my-projects-*` rules in `globals.css` (no separate pilot contracts CSS file)
- Added: `.client-my-projects-btn-danger`, `.client-my-projects-card-actions--contracts`, `.client-my-projects-empty-cta`

### Mock contract data used

- 5 screenshot-style contracts when `GET /api/pilot/bookings` returns no rows
- Includes Recurring example (`C-4410`) for Recurring tab demo

### Existing data / hooks / APIs used

- `GET /api/pilot/bookings` — primary data source
- Booking `status` → UI status: `disputed` → Disputed; `completed`/`cancelled` → Completed; active bookings within 5 days of deadline → Due Soon; else On Track
- Recurring tab only populated from mock until recurring contract flag exists in API

### Tab filtering behavior

- Local React state; tabs: All, On Track, Due Soon, Recurring, Disputed, Completed
- Empty tab shows styled “No contracts found” card

### Links / routes connected

| Action | Route |
|--------|--------|
| Browse Jobs (header) | `/dashboard/pilot/jobs` |
| Deliver Work | `/dashboard/pilot/bookings/[id]` |
| Message Client | `/dashboard/pilot/messages` |
| Open Dispute | `/dashboard/pilot/bookings/[id]#dispute` |
| Legacy bookings list | `/dashboard/pilot/bookings` → `/dashboard/pilot/contracts` |
| Sidebar **Active Contracts** | `/dashboard/pilot/contracts` |

### Missing modules discovered

- Dedicated contract detail route (`/dashboard/pilot/contracts/[contractId]`)
- Deliver work / file upload workflow (separate from booking status actions)
- Per-booking conversation deep link from card
- Recurring contract billing/status in schema
- Client handoff approval workflow from pilot delivery

### Missing backend / Supabase integrations

- `GET /api/pilot/contracts` enrichment (display IDs, deadline labels, recurring flag)
- File delivery/upload storage + client approval
- Contract-level messaging thread resolution by booking
- Recurring contract schedule + billing cadence

### Notes / assumptions

- **Contracts** = accepted bookings (M09); no duplicate contract entity.
- Pilot page intentionally shares Client My Projects visual system — no corner brackets or heavy Operations header panel.
- Booking detail route unchanged for deliver/dispute functionality.
- Client/Admin/Moderator dashboards and public pages untouched.
- Production build passes.

---

## Phase 15 — Pilot Messages (aligned with Client) (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Messages |
| **Route** | `/dashboard/pilot/messages`, `/dashboard/pilot/messages/[id]` |
| **Status** | Implemented |

### Client Messages design reused

- Same two-panel inbox + thread layout (`client-messages-*` CSS)
- Same `client-messages.css` via `client-messages-shell`
- Reuses `ClientMessagesIcons` and `client-messages-utils`

### Components created

- `PilotMessagesView` — mirrors `ClientMessagesView` for pilot APIs
- `pilot-messages-mock.ts` — client-named fallback threads

### APIs reused

- `GET /api/pilot/conversations`
- `GET /api/pilot/conversations/[id]`
- `POST /api/pilot/conversations/[id]/messages`

### Notes

- Replaced legacy `MessagesInbox` + `PageHeader` on pilot messages pages
- Status label: **Client · Online** (vs **Pilot · Online** on client page)
- Production build passes.

---

## Phase 16 — Pilot & Client Profile / Onboarding Completion (2026-06-02)

### 1. Pilot Onboarding / Profile Completion

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Profile / Onboarding Completion |
| **Route** | `/dashboard/pilot/profile` (alias: `/pilot/profile`; legacy `/dashboard/pilot/onboarding` → redirect) |
| **Status** | Implemented |

#### Existing modules reused

| Module | Reuse |
|--------|--------|
| M03 Pilot Onboarding | `PilotFormState`, `pilotFormToPayload`, `pilotDtoToFormState` |
| `PilotProfileEditor` | Save logic preserved (POST/PATCH `/api/pilot/profile`) |
| `ComplianceChecklist` | Shown when onboarding incomplete |
| `PILOT_SERVICE_OPTIONS` | Mapped via display chips |
| `getApprovedVerificationTypes` | Insurance status in strength panel |
| `/pilots/[id]` | Preview Public Profile when approved + public |

#### Recent fields preserved

- displayName, bio, location (city/region/country), serviceRadiusKm, servicesOffered, hourly rates, license, compliance, isPublic

#### New UI-only fields (local state, pending API)

- callSign, droneEquipment, languages, avatar preview, portfolio slots, extra service chips (Thermal, Construction, Emergency Response)

#### Components created

- `PilotProfileCompletionView`
- `ProfileStrengthPanel` (shared)
- `pilot-profile-strength.ts`, `pilot-profile-service-chips.ts`

#### CSS

- `src/styles/profile-onboarding.css`

#### Notes

- Profile page no longer redirects incomplete users to wizard; onboarding route redirects here
- `OnboardingRedirect` sends incomplete pilots to `/dashboard/pilot/profile`
- Settings remains separate at `/dashboard/pilot/settings`

---

### 2. Client Onboarding / Profile Completion

| Field | Value |
|-------|--------|
| **Page / module** | Client Profile / Onboarding Completion |
| **Route** | `/dashboard/client/profile` (alias: `/client/profile`; legacy `/dashboard/client/onboarding` → redirect) |
| **Status** | Implemented |

#### Existing modules reused

| Module | Reuse |
|--------|--------|
| M04 Client Onboarding | `ClientFormState`, `clientFormToPayload`, `clientDtoToFormState` |
| `ClientProfileEditor` | Save logic preserved (POST/PATCH `/api/client/profile`) |
| Billing address fields | Mapped from location into `billingCity`/`billingRegion` on save |

#### Recent fields preserved

- contactName, companyName, phone, billing address fields

#### New UI-only fields (local state, pending API)

- roleTitle, preferredContact, typicalProjectArea, projectTypes chips, defaultBudgetRange, approvalContact, billingEmail, logo preview, paymentConnected

#### Components created

- `ClientProfileCompletionView`
- `client-profile-strength.ts`, `client-profile-project-chips.ts`

#### Navigation

- Added **Profile** under Client Account sidebar (`/dashboard/client/profile`)

#### Notes

- Account Settings unchanged at `/dashboard/client/settings`
- Preview Client Profile button disabled (no public client profile route)
- Hiring readiness links to `/dashboard/client/payments` for billing

---

### Missing backend / pending (both roles)

- Avatar/logo upload storage
- Portfolio upload/storage (pilot)
- Extended profile fields persistence (call sign, equipment, languages, client project prefs)
- Profile strength API (currently computed client-side)
- Client payment method readiness integration

### Build

- Production build passes

---

## Phase 17 — Pilot Identity & License Verification (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Identity & License Verification |
| **Route** | `/dashboard/pilot/verifications` (aliases: `/pilot/verification`, `/pilot/verifications`) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| M14 Verifications | `GET/POST /api/pilot/verifications`, file storage via `submitVerificationWithFile` |
| `PilotVerificationsPanel` | Upload logic preserved (panel kept; page uses new view) |
| `VerificationStatusBadge` patterns | Status tones mapped to card badges |
| `VERIFICATION_MAX_BYTES` / MIME types | Upload validation unchanged (5 MB API limit) |
| Admin review | `rejectionReason` shown as ADMIN note on rejected cards |

### Components created

- `PilotVerificationDocumentsView` — header, notice bar, grid, upload orchestration
- `PilotVerificationDocumentCardView` — per-document card with Replace File
- `verification-documents-catalog.ts` — 6 document definitions + progress calc

### Document catalog → API mapping

| Card | API type |
|------|----------|
| Government ID | `identity` |
| FAA Part 107 License | `license` |
| Drone Registration | `other` + `[catalog:drone_registration]` note |
| Insurance Certificate | `insurance` |
| Business Registration | `other` + `[catalog:business_registration]` note |
| Additional Certifications | `other` + catalog tag (optional) |

### CSS

- `src/styles/pilot-verifications.css`

### Mock data

- Screenshot-style statuses when inbox empty (2 pending action, 67% complete)
- Switches to live API data after first upload

### Links

| Link | Route |
|------|--------|
| Back | `/dashboard/pilot/profile` |
| Dashboard hero CTA | `/dashboard/pilot/verifications` |
| Sidebar **Verification** | `/dashboard/pilot/verifications` |

### Missing backend / pending

- Dedicated document-type enum (6 cards share `other` + catalog notes today)
- 10 MB upload limit (API remains 5 MB)
- Verification-based A-4+ mission eligibility enforcement
- Proposal limit removal after verification
- Document approval/rejection notifications

### Notes

- No duplicate verification system; replaces legacy `PageHeader` + list layout on page only
- Production build passes

---

## Phase 18 — Pilot Portfolio / Flight Gallery (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Portfolio / Flight Gallery |
| **Route** | `/dashboard/pilot/portfolio` (alias: `/pilot/portfolio`) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| Profile portfolio slots | Concept only — dedicated gallery page; profile section unchanged (local preview) |
| `portfolio` nav icon | Sidebar **Portfolio** now points to gallery route |
| Public pilot profile | No portfolio section yet (pending M125) |

### Components created

- `PilotPortfolioView` — header, intro bar, grid, Add Item
- `PilotPortfolioCard` — media preview, type, title, tags
- `PilotPortfolioAddModal` — local-state form (title, type, tags, media preview)
- `portfolio-mock.ts` — 6 screenshot-style items

### CSS

- `src/styles/pilot-portfolio.css`

### Mock / local data

- 6 cards: VIDEO/PHOTOSET with THERMAL + INSPECTION tags
- Add Item appends to local React state only (no API write)
- Optional image preview via `URL.createObjectURL`

### Links

| Link | Route |
|------|--------|
| Back | `/dashboard/pilot/profile` |
| Sidebar **Portfolio** | `/dashboard/pilot/portfolio` |

### Missing backend / pending

- Portfolio CRUD API + media upload/storage
- Thumbnail generation for video/photo
- Public profile gallery display
- Portfolio moderation/approval
- Profile strength sync from gallery count (profile page uses local slots today)

### Notes

- No duplicate portfolio system; profile onboarding portfolio section remains separate local UI
- Production build passes

---

## Phase 19 — Pilot Reviews (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Reviews |
| **Route** | `/dashboard/pilot/reviews` (alias: `/pilot/reviews` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| `GET /api/pilot/reviews` | Fetches published reviews via `listReviewsForPilotUser` |
| `averageRating` (`src/lib/reviews/review.ts`) | Live summary average when API returns received reviews |
| `PILOT_MOCK_REVIEWS` | Fallback rows + screenshot copy when inbox empty |
| `PilotDashboardReviews` | Visual reference; dedicated page uses scoped CSS with same tokens |
| `ReviewsList` | Unchanged — still used on client reviews page |
| `StarRating` | Unchanged — page uses `PilotReviewsStars` for gold screenshot styling |
| Sidebar `Reviews` nav | `/dashboard/pilot/reviews` (active on route) |

### Components created

- `PilotReviewsView` — header, summary, review list, API fetch + mock fallback
- `PilotReviewsStars` — gold star row for summary and list rows
- `pilot-reviews-map.ts` — map API DTOs → display rows; mock builder; summary helper

### Components updated

- `src/app/dashboard/pilot/reviews/page.tsx` — `DashboardPageLayout` + `PilotReviewsView` (replaces legacy `PageHeader` + `ReviewsList`)

### CSS

- `src/styles/pilot-reviews.css` — header card, panel, rating summary, review rows (responsive stack on mobile)

### Mock / API data

- **Live:** `direction === "received"` reviews mapped to rows (client/agency title, uppercase comment, formatted date)
- **Mock:** 5 rows from `PILOT_MOCK_REVIEWS` template; summary `4.9/5`, `BASED ON 47 REVIEWS` when empty
- No fake database writes

### Links

| Link | Route |
|------|--------|
| Back | `/dashboard/pilot` |
| Sidebar **Reviews** | `/dashboard/pilot/reviews` |
| Dashboard widget **VIEW ALL** | `/dashboard/pilot/reviews` |

### Missing backend / pending

- Dedicated pilot reviews pagination/filter API (All / 5★ / 4★ / Recent tabs not added — no filter system yet)
- Public pilot profile review list display (M10 / public profile)
- Review moderation admin workflow polish (M13)
- Completed-booking → review CTA surfacing on pilot contracts list
- Aggregate rating count on profile vs list page (mock uses 47 total when empty)

### Notes

- Onboarding gate removed on this page (auth-only, aligned with portfolio)
- Shell topbar not duplicated; back link inside page content
- Production build passes

---

## Phase 20 — Pilot Payments / Earnings (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Payments / Earnings |
| **Route** | `/dashboard/pilot/payments` (alias: `/pilot/payments` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| `GET /api/pilot/payments` | Fetches payouts via `listPaymentsForPilotUser` |
| `PaymentListItemDto` | Job title, client label, gross/net, commission, dates |
| `PaymentsList` | Unchanged — legacy list kept for client payments page |
| `DEFAULT_COMMISSION_RATE` | Subtitle + summary subtext (10%) |
| `recordPaymentForCompletedBooking` | Unchanged backend flow |
| Sidebar **Earnings** nav | `/dashboard/pilot/payments` |

### Components created

- `PilotPaymentsView` — header, summary cards, payment table/cards, CSV export
- `pilot-payments-map.ts` — summary math, currency/date formatting, client-side CSV download

### Components updated

- `src/app/dashboard/pilot/payments/page.tsx` — `DashboardPageLayout` + `PilotPaymentsView` (replaces `PageHeader` + `PaymentsList`)

### CSS

- `src/styles/pilot-payments.css` — header actions, stat cards, payment panel, responsive table/cards

### Data preserved

- Live API rows (e.g. `tester` / `Real estate flyover — Lake Travis`, Demo Productions LLC, USD 90 / 562.50 payouts) render from database when present
- No mock replacement when API returns data
- Summary cards calculate totals from visible payment rows

### CSV export

- Client-side `pilot-payments.csv` via Blob download
- Columns: `Job,Client,Payout,Gross,Platform Fee,Date`
- Disabled when no payments loaded

### Links

| Link | Route |
|------|--------|
| My jobs | `/dashboard/pilot/jobs` |
| View booking | `/dashboard/pilot/bookings/[bookingId]` |
| Sidebar **Earnings** | `/dashboard/pilot/payments` |

### Missing backend / pending

- Stripe Connect payout integration
- Backend CSV export endpoint
- Payout status tracking (pending/processing)
- Escrow release / payment-after-approval workflow
- Tax/invoice reporting
- Filter dropdown logic (`All payouts` is placeholder UI only)

### Notes

- Onboarding gate retained (matches payments API)
- Desktop table + mobile stacked cards; table wrapper scrolls horizontally if needed
- Production build passes

---

## Phase 21 — Pilot Uniform & Insignia Shop (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Uniform & Insignia Shop |
| **Route** | `/dashboard/pilot/shop` (alias: `/pilot/shop` → redirect) |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| `PilotUniformShop` | Restyled in place — same cart/add/checkout/order logic |
| `GET /api/pilot/shop/products` | Live catalog from `listActiveProductsForShop` |
| `POST /api/pilot/shop/orders` | Checkout → order detail redirect |
| `UNIFORM_SHIPPING_FLAT_RATE` | Shipping note at checkout (not in cart subtotal) |
| Sidebar **Uniform Shop** | `/dashboard/pilot/shop` |

### Components created

- `shop-display-map.ts` — category/image mapping, price formatting, mock catalog fallback

### Components updated

- `PilotUniformShop.tsx` — dark product grid + sticky cart panel (pricing-page card styling)
- `src/app/dashboard/pilot/shop/page.tsx` — `DashboardPageLayout` + scoped CSS

### CSS

- `src/styles/pilot-shop.css` — header, product cards, cart, checkout form

### Product data

- **Live:** Seeded catalog (polo, jacket, cap) mapped to UNIFORM cards with marketing image fallbacks
- **Empty catalog:** 6 mock display cards (epaulettes, patch, ID, jacket, cap, digital wings) — add disabled
- Images use `/marketing/rank-*.png`, hero, and trust icon placeholders until product `imageUrl` is set

### Cart / checkout

- Local React cart state preserved (`addToCart`, quantity, subtotal)
- Checkout opens shipping form in cart panel → `POST /api/pilot/shop/orders` → `/dashboard/pilot/shop/orders/[id]`
- Cart preview image follows last added item

### Links

| Link | Route |
|------|--------|
| Back | `/dashboard/pilot` |
| My orders | `/dashboard/pilot/shop/orders` |
| Sidebar **Uniform Shop** | `/dashboard/pilot/shop` |

### Missing backend / pending

- Product image upload / media management per SKU
- Cart persistence across sessions
- Stripe shop payment on order detail (`/pay` route exists)
- Rank-based product availability rules
- Digital badge/NFT delivery workflow
- Order fulfillment admin workflow polish

### Notes

- No duplicate shop system; single `PilotUniformShop` component
- Desktop: ~70/30 grid + cart; mobile stacks
- Production build passes

---

## Phase 22 — Pilot Support & Help Center (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Support & Help Center (Ground Control) |
| **Route** | `/dashboard/pilot/support` (alias: `/pilot/support` → redirect) |
| **Article detail** | `/dashboard/pilot/support/articles/[slug]` |
| **Status** | Implemented |

### Existing modules reused

| Module | Reuse |
|--------|--------|
| `SupportChatWidget` | Global ticket UI; `dm:support:open` event to open new/existing chats |
| `GET /api/support/chats` | Open tickets list for signed-in pilot |
| `POST /api/support/chats` | Ticket creation via widget form (unchanged) |
| `support-chat-ui` | Ticket ID + status labels in open tickets rows |
| Sidebar **Support** | Updated from settings → `/dashboard/pilot/support` |

### CMS-ready articles

- `src/types/help-article.ts` — typed fields (title, slug, category, summary, body, audience, status, sort)
- `src/lib/help/help-articles.ts` — seed module swappable for CMS/API later
- 6 published pilot articles matching screenshot titles

### Components created

- `PilotSupportHelpCenter` — header, search hero, articles, contact card, open tickets
- `PilotHelpArticleView` — article detail layout
- `open-support-widget.ts` — dispatches `SUPPORT_OPEN_EVENT` to existing widget

### Components updated

- `SupportChatWidget.tsx` — listens for `SUPPORT_OPEN_EVENT` (`new` / `open` / `chatId`)
- `dashboard-pilot.ts` — Support nav href

### CSS

- `src/styles/pilot-support.css`

### Functionality

- Search filters articles by title/category/summary (client-side on seed data)
- **Open Support Ticket** → `openSupportChatWidget({ action: "new" })`
- Open ticket row click → opens existing chat in widget
- Empty state: `No open tickets.`

### Missing backend / pending

- Help Article CMS/admin CRUD + Prisma table
- Server-side article search API
- Role-based article visibility admin UI
- Support SLA/priority queue backend (subtext is informational)
- Dedicated in-dashboard ticket thread page (widget-only today)

### Notes

- Settings remains at `/dashboard/pilot/settings` (Support nav moved to help center)
- No duplicate support system
- Production build passes

---

## Phase 23 — Pilot Settings (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Settings |
| **Route** | `/dashboard/pilot/settings` (alias: `/pilot/settings` → redirect) |
| **Status** | Implemented |

### Existing modules preserved

| Module | Reuse |
|--------|--------|
| `GET /api/account` | Email, role, status, unread notification count |
| `GET /api/pilot/profile` | Display name, location, public profile flag |
| `PATCH /api/pilot/profile` | Public profile visibility toggle |
| `POST /api/account/password` | Change password form |
| `POST /api/notifications` | Mark all notifications read |

### Not added (intentionally)

- Screenshot notification checkboxes (job alerts, proposal updates, etc.) — no pilot preference API/localStorage module exists
- Phone/timezone fields — not on pilot account DTO (location shown instead)
- Permanent account delete — replaced with 30-day deactivation modal (mock success only)

### Components created

- `PilotAccountSettings` — nav + stacked sections (personal, notifications, payment, security, danger)
- `PilotSettingsCheckbox` — gold checkbox for public profile toggle
- `PilotDeactivateModal` — 30-day deactivation confirmation

### Components updated

- `AccountSettingsPanel.tsx` — deprecated re-export of `PilotAccountSettings`
- `dashboard/pilot/settings/page.tsx` — `DashboardPageLayout` + new view

### CSS

- `src/styles/pilot-settings.css` — sidebar nav, cards, inputs, danger/modal

### Sections

| Section | Content |
|---------|---------|
| Personal | Read-only account/profile fields + public profile checkbox + profile link |
| Notifications | In-app status, unread count, mark all read (integrated only) |
| Payment | Links to earnings + membership (no fake Stripe UI) |
| Security | Existing password change form |
| Danger Zone | Deactivate account modal (backend pending) |

### Missing backend / pending

- Pilot notification preference persistence (per-category toggles)
- Stripe Connect / payout settings API
- 30-day deactivation + reactivation + scheduled deletion workflow
- Deactivation email notifications + admin audit log

### Notes

- Distinct from `/dashboard/pilot/profile` (onboarding/marketplace profile)
- Sidebar **Settings** active on route; **Support** remains on help center
- Production build passes

---

## Phase 24+ — Admin / Moderator Dashboard (scope, 2026-06-02)

**Policy:** Admin (`super_admin`) and **Moderator** share the same dashboard at `/dashboard/admin/*` until moderator role limits are defined later. Build UI/features once for both; gate routes only where `ADMIN_ROUTE_MIN_ROLE` already applies.

### Authoritative module list (product)

| # | Module | Target route(s) | Codebase today | Restyle status |
|---|--------|-----------------|----------------|----------------|
| 1 | **Dashboard** | `/dashboard/admin` | Overview stats + module cards | Legacy `PageHeader` / shared dashboard components |
| 2 | **All Users** (waitlist, approvals) | `/dashboard/admin/users`, `/pilots`, `/clients`, `/waitlist` | Functional panels + APIs | Not aviation-themed |
| 2b | **User approvals** (pilot profile, docs) | `/dashboard/admin/pilots`, `/verifications`, `/applications` | Pilot approve/reject, verification docs, job applications | Not aviation-themed |
| 3 | **Job Approval** | `/dashboard/admin/jobs` | Approve/reject client jobs (M07) | Implemented — Phase 28 |
| 4 | **Subscriptions** | `/dashboard/admin/subscriptions` | Pilot tier plans portal + enrollments | Implemented — Phase 33 |
| 5 | **Commissions** | `/dashboard/admin/payments` | Pilot commission ledger (fixed 10%) | Implemented — Phase 34 |
| 6 | **Disputes** | `/dashboard/admin/disputes` | List + detail resolution (M23) | Implemented — Phase 31 |
| 7 | **Certificates** | `/dashboard/admin/certificates` | Automated certificate engine | Implemented — Phase 35 |
| 8 | **Badges & Wings** | `/dashboard/admin/achievements` | Wing definitions + awards | Super-admin route today |
| 9 | **Uniform Shop** | `/dashboard/admin/shop` | Products, variants, orders | Not aviation-themed |
| 10 | **Reports** | — | **Not implemented** | New module |
| 11 | **Messages** | `/dashboard/admin/messages` | Admin conversation oversight | Implemented — Phase 29 |
| 12 | **Support Chat** | `/dashboard/admin/support` | Live support queue + threads | Implemented — Phase 30 |
| 13 | ~~**Reviews Approval**~~ | ~~`/dashboard/admin/reviews`~~ | **Removed** — reviews publish directly from client/pilot flows | — |
| 14 | **CMS** (articles + resources) | — | Public `/resources` uses static seed; pilot help uses `help-articles.ts` seed | **No admin CMS UI** |
| 15 | **Settings** | `/dashboard/admin/settings` | Admin account settings | Super-admin route today |

### Extra routes in code (not in product list — keep unless told otherwise)

| Route | Purpose |
|-------|---------|
| `/dashboard/admin/bookings` | Booking oversight |
| `/dashboard/admin/applications` | Job application pipeline (may fold under Users / Job Approval nav) |

### Planned nav grouping (implementation target)

1. **Command** — Dashboard, Reports (new)
2. **Users & Approvals** — All Users, Waitlist, Pilots, Clients, Verifications, Applications
3. **Operations** — Job Approval, Bookings, Messages, Support Chat, Disputes
4. **Finance** — Subscriptions, Commissions (payments)
5. **Compliance & Rewards** — Certificates, Badges & Wings
6. **Commerce** — Uniform Shop
7. **Content** — CMS (help articles + marketing resources)
8. **Account** — Settings

### Missing modules to build

- **Reports** — operational/financial exports, KPI snapshots (route TBD: `/dashboard/admin/reports`)
- **CMS** — CRUD for help articles (pilot/client dashboards) and public Resources articles (M145+)

### Moderator limits

Deferred — user will specify after admin dashboard UI is complete. Current super-admin-only paths: `settings`, `users`, `subscriptions`, `achievements`.

### Nav update (menu-only, 2026-06-02)

Sidebar realigned to the 15 product modules (design pass deferred). Updated `dashboard-admin.ts`:

| Nav label | Route |
|-----------|--------|
| Dashboard | `/dashboard/admin` |
| Reports | `/dashboard/admin/reports` (stub) |
| All Users | `/dashboard/admin/users` |
| Job Approval | `/dashboard/admin/jobs` |
| Messages | `/dashboard/admin/messages` |
| Support Chat | `/dashboard/admin/support` |
| Disputes | `/dashboard/admin/disputes` |
| Subscriptions | `/dashboard/admin/subscriptions` |
| Commissions | `/dashboard/admin/payments` |
| Certificates | `/dashboard/admin/certificates` |
| Badges & Wings | `/dashboard/admin/achievements` |
| Uniform Shop | `/dashboard/admin/shop` |
| CMS | `/dashboard/admin/cms` (stub) |
| Settings | `/dashboard/admin/settings` |

Removed from sidebar (routes unchanged): Pilots, Clients, Waitlist, Applications, Bookings, Verifications — to be reached via All Users / module hubs during design.

### Nav update (menu-only, 2026-06-02)

Sidebar realigned to the 15-item product list (single **Admin** group). Design/modules paused; existing page routes reused where available.

| Menu label | Route |
|------------|-------|
| Dashboard | `/dashboard/admin` |
| All Users | `/dashboard/admin/users` |
| Job Approval | `/dashboard/admin/jobs` |
| Subscriptions | `/dashboard/admin/subscriptions` |
| Commissions | `/dashboard/admin/payments` |
| Disputes | `/dashboard/admin/disputes` |
| Certificates | `/dashboard/admin/certificates` |
| Badges & Wings | `/dashboard/admin/achievements` |
| Uniform Shop | `/dashboard/admin/shop` |
| Reports | `/dashboard/admin/reports` (page pending) |
| Messages | `/dashboard/admin/messages` |
| Support Chat | `/dashboard/admin/support` |
| CMS | `/dashboard/admin/cms` (page pending) |
| Settings | `/dashboard/admin/settings` |

Removed from sidebar (routes still live): Pilots, Clients, Waitlist, Applications, Bookings, Verifications, Payments label (now Commissions).

---

## Phase 25 — Admin / Moderator Operations Dashboard (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Operations Dashboard |
| **Routes** | `/dashboard/admin` (canonical), `/admin/dashboard`, `/moderator/dashboard` (aliases) |
| **Status** | Implemented |

### Existing modules reused

- Prisma stats patterns from `getAdminOverviewStats`
- `listDisputesForAdmin` for action queue items
- `DashboardPageLayout` + existing admin shell/sidebar (unchanged)

### Components created

- `AdminOperationsDashboard`, `AdminOperationsActions`, `AdminPlatformGrowthChart`
- `src/lib/admin/operations-dashboard-data.ts`, `src/types/admin-operations.ts`
- `src/styles/admin-dashboard.css`

### Role-based visibility

- **super_admin:** TOTAL REVENUE stat, Export, New briefing
- **moderator:** OPEN CASES stat (replaces revenue), same layout, no export/briefing

### Behaviors

- Export → client CSV `operations-dashboard-export.csv` (visible dashboard data)
- New briefing → placeholder modal (backend pending)
- Growth chart → SVG from 90-day Prisma time series
- System integrity → display-only until health API exists
- Action queue → live links to verifications, disputes, pilots

### Production build

Passes.

---

## Phase 26 — Admin / Moderator Reports & Analytics (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Reports & Analytics |
| **Routes** | `/dashboard/admin/reports` (canonical), `/admin/reports`, `/moderator/reports` (aliases) |
| **Status** | Implemented |

### Existing modules reused

- Prisma payments, bookings, client/pilot profiles, disputes, commissions
- Admin dashboard theme tokens (`admin-dashboard.css` bracket/glow classes)
- Client-side CSV export pattern from operations dashboard

### Components created

- `AdminReportsAnalytics` — header, stats, chart grid, categories, footer strip
- `AdminReportsExportButton` — CSV export (super_admin only)
- `AdminRevenueOperationsChart` — SVG 12-month marks (profit/margin or missions)
- `AdminReportsFooterStrip` — live UTC sync status

### Data / lib

- `src/lib/admin/reports-analytics-data.ts` — QTD stats, monthly series, category segmentation
- `src/types/admin-reports.ts`

### CSS

- `src/styles/admin-reports.css` (imports `admin-dashboard.css` for shared accents)

### Role-based visibility

| Element | super_admin | moderator |
|---------|-------------|-----------|
| Stat 1 | REVENUE (QTD) | OPEN CASES |
| Chart | REVENUE OPERATIONS (commission + margin) | MISSION OPERATIONS (completed missions/month) |
| Export CSV | Shown | Hidden |
| Footer | AVERAGE MARGIN, ACTIVE DRONES, OPS COST | ACTIVE DRONES only |

### Data sources

- Stats/chart from Prisma aggregates (not static screenshot values)
- Mission categories from completed booking job categories; seed percentages only when no completed missions exist
- Segmentation detail link is placeholder text (route pending)

### Export

- `reports-analytics-export.csv` — summary stats, chart series, categories, footer metrics

### Missing backend / pending

- Dedicated reports analytics API
- Mission category segmentation detail route
- Server-side CSV/reporting backend
- Analytics sync status API

### Production build

Passes.

---

## Phase 27 — Admin / Moderator Fleet & Personnel (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Fleet & Personnel (All Users) |
| **Routes** | `/dashboard/admin/users` (canonical), `/admin/users`, `/moderator/users` (aliases) |
| **Status** | Implemented |

### Existing modules reused

- Prisma users + pilot/client profiles + subscriptions
- `GET /api/admin/users` (moderator read via `requireAdminSession`)
- Sidebar **All Users** nav item

### Components created

- `AdminFleetPersonnel`, `AdminPersonnelInviteModal`
- `personnel-directory.ts`, `personnel-filters.ts`, `admin-personnel.css`

### Role-based visibility

- **super_admin:** Invite user, Edit links
- **moderator:** Read-only directory, Export roster, Edit disabled

### Behaviors

- Client-side role/region filters + pagination (6/page)
- CSV `fleet-personnel-roster.csv`
- Mock roster only when DB has zero users
- View → pilots/clients/users list routes

### Production build

Passes.

---

## Phase 28 — Admin / Moderator Job Approval Queue (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Job Approval Queue |
| **Routes** | `/dashboard/admin/jobs` (canonical), `/admin/jobs/approval`, `/moderator/jobs/approval` (aliases → canonical) |
| **Status** | Implemented |

### Existing modules reused

- `listJobsForAdmin` (`src/lib/jobs/admin.ts`) — pending jobs from Prisma
- `GET /api/admin/jobs?status=pending_approval` — queue refresh after approve/reject
- `POST /api/admin/jobs/[id]/approve` — sets job `open`, triggers notification
- `POST /api/admin/jobs/[id]/reject` — requires `reason` (min 5 chars)
- `AdminJobReview` — full review on `/dashboard/admin/jobs/[id]` (legacy styling; logic preserved)
- `requireAdminSession` — moderator + super_admin access
- Sidebar **Job Approval** nav item (`/dashboard/admin/jobs`)
- `admin-dashboard.css` — bracket card + hero glow patterns

### Components created

- `AdminJobApprovalQueue` — header, stat cards, pending missions panel, pagination, risk filter
- `AdminJobApprovalModal` — approve/reject confirmation with rejection reason field
- `job-approval-queue.ts` — server data loader (stats + row mapping)
- `admin-job-approval.ts` — queue row/stat types
- `admin-job-approval.css` — aviation command-center styling

### Components updated

- `src/app/dashboard/admin/jobs/page.tsx` — replaced `PageHeader` + `AdminJobsPanel` with `AdminJobApprovalQueue`

### Files updated

- `src/app/admin/jobs/approval/page.tsx` — redirect alias
- `src/app/moderator/jobs/approval/page.tsx` — redirect alias

### CSS / style files

- `src/styles/admin-job-approval.css` (imported on jobs page)
- `src/styles/admin-dashboard.css` (hero bracket/glow reuse)

### Mock data

- Four demo mission rows when DB has zero `pending_approval` jobs (`usingMockRows: true`)
- Stats still computed from Prisma where possible; awaiting-review card forced to demo totals
- Approve/reject blocked on mock rows with explanatory modal message (no fake moderation)

### Hooks / APIs used

- Server: `getJobApprovalQueueData()` — Prisma counts for approved today, rejected 7d, avg approval time
- Client: `fetch` to approve/reject APIs; optional reload via `GET /api/admin/jobs`

### Role-based visibility

- **super_admin** and **moderator** share the same queue UI and actions (both pass `requireAdminSession`)
- No separate moderator-only escalate flow — existing permission model allows both roles to approve/reject

### Approve behavior

- Opens confirmation modal → `POST /api/admin/jobs/[id]/approve`
- On success: row removed locally, stats incremented, page refresh triggered
- Mock rows: modal shows demo-only message; confirm does not call API

### Reject behavior

- Opens confirmation modal with reason textarea (min 5 chars enforced by API)
- `POST /api/admin/jobs/[id]/reject` with `{ reason }`
- Mock rows: same demo guard as approve

### Review route behavior

- **REVIEW** links to `/dashboard/admin/jobs/[id]` (existing detail + `AdminJobReview`)
- Mock rows link to queue page (no fake job IDs)

### Filter / pagination behavior

- **Filter:** client-side risk level dropdown (all / low / medium / high); more-options icon is placeholder
- **Pagination:** client-side, 4 rows per page; footer shows range vs `totalPending`
- Server-side filter/pagination not implemented

### Links / routes connected

| Alias | Target |
|-------|--------|
| `/admin/jobs/approval` | `/dashboard/admin/jobs` |
| `/moderator/jobs/approval` | `/dashboard/admin/jobs` |
| Review button | `/dashboard/admin/jobs/[id]` |

### Missing modules discovered

| Gap | Notes |
|-----|-------|
| Dedicated job approval queue API | Inline Prisma loader today |
| Server-side risk scoring | Client heuristic from budget/category/night keywords |
| Server-side queue pagination | Client slice only; `totalPending` is full count |
| Region/budget/service/date filters | Risk filter only |
| Job review detail UI pass | `/dashboard/admin/jobs/[id]` still legacy `PageHeader` |
| Moderator-only escalate workflow | Not in permission model |
| Approval audit log | No per-action admin audit trail |
| Policy violation taxonomy | Free-text reject reason only |

### Missing backend / Supabase integrations

- Formal risk engine / high-risk flagging service
- Server-side approval queue endpoint with filters + cursor pagination
- Structured rejection reasons (policy codes)
- Admin/moderator moderation audit log
- Client approval/rejection notification verification (approve API triggers notification; reject path TBD)

### Notes / assumptions

- Canonical route kept at `/dashboard/admin/jobs` to avoid duplicate approval pages
- `AdminJobsPanel` retained in codebase but no longer mounted on list page
- High-risk row styling driven by heuristic, not DB `riskLevel` field
- Footer `totalPending` uses server total (9 in demo mode) while visible rows are filtered client-side

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 29 — Admin / Moderator Messages Read-only Tracking (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Messages (read-only conversation tracking) |
| **Routes** | `/dashboard/admin/messages` (canonical), `/dashboard/admin/messages/[id]` (deep link), `/admin/messages`, `/moderator/messages` (aliases → canonical) |
| **Status** | Implemented |

### Existing modules reused

- `GET /api/admin/conversations` — conversation list (unchanged)
- `GET /api/admin/conversations/[id]` — read-only transcript (unchanged)
- `listConversationsForAdmin` / `getConversationForAdmin` (`src/lib/messaging/messaging.ts`)
- `requireAdminSession` — moderator + super_admin read access
- Sidebar **Messages** nav item (`/dashboard/admin/messages`)
- `admin-dashboard.css` — bracket card + hero glow patterns
- `client-messages-utils.ts` — time formatting helpers

### Read-only logic preserved

- No message composer, send button, or admin/moderator reply capability
- No support ticket creation, dispute actions, escalation, resolve/reopen, internal notes, or assignment workflow
- Disputes remain on `/dashboard/admin/disputes` (separate module)
- Refresh reloads list + selected transcript via existing GET APIs only

### Components created

- `AdminMessagesTracking` — 2-column inbox: conversation list + read-only transcript
- `admin-messages.ts` — admin conversation row/detail types
- `admin-messages.css` — aviation command-center inbox styling (no composer styles)

### Components superseded (retained in codebase)

- `AdminMessagesPanel` — replaced on list page (link-only list)
- `AdminConversationThread` — replaced by inline transcript panel; `[id]` route still works via `initialConversationId`

### Filters / search added (client-side)

| Filter | Functional | Notes |
|--------|------------|-------|
| Search input | Yes | Scopes by participant/job based on dropdown |
| All / Client / Pilot / Job scope | Yes | Limits which fields are searched |
| Job / project dropdown | Yes | Unique titles from loaded conversations |
| Date range (7d / 30d / 90d) | Yes | Uses `lastMessageAt` when present |
| Clear filters | Yes | Resets all filter state |
| Unread only | No | Not in admin conversation API payload |
| Has attachments | No | Attachment metadata not in admin API |

### Refresh behavior

- Hero **Refresh** button calls existing list + detail loaders (same endpoints as before)
- No polling or realtime added

### Role-based visibility

- **super_admin** and **moderator** share identical read-only UI
- No admin-only message fields exposed beyond existing API response

### Files updated

- `src/app/dashboard/admin/messages/page.tsx`
- `src/app/dashboard/admin/messages/[id]/page.tsx`
- `src/app/admin/messages/page.tsx` (new alias)
- `src/app/moderator/messages/page.tsx` (new alias)

### Missing modules discovered

| Gap | Notes |
|-----|-------|
| Server-side conversation search | Client filter on loaded list only |
| Server-side conversation filters | No query params on admin conversations API |
| Unread indicator for admin view | `unreadCount` exists for participants, not admin list |
| Attachment preview in admin transcript | Not in message payload |
| Admin conversation read audit | No log when admin views a thread |

### Notes / assumptions

- Canonical route kept at `/dashboard/admin/messages`; no duplicate messaging system
- Deep link `/dashboard/admin/messages/[id]` opens same 2-column view with conversation pre-selected
- Client bubbles left (warm dark); pilot bubbles right (alternate dark tone)
- Visible **READ ONLY** badge on transcript header

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 30 — Admin / Moderator Support Chat Redesign (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Support Chat (admin/moderator inbox) |
| **Routes** | `/dashboard/admin/support` (canonical), `/dashboard/admin/support/[id]` (deep link) |
| **Status** | Implemented |

### Existing support functionality preserved

- `GET /api/admin/support/chats?status=` — list with server status filter (unchanged)
- `GET /api/admin/support/chats/[id]` — thread load + 2s polling (unchanged)
- `POST /api/admin/support/chats/[id]/messages` — admin reply + attachment FormData (unchanged)
- `PATCH /api/admin/support/chats/[id]` — status updates (unchanged)
- `POST /api/admin/support/chats/[id]/typing` — typing pulse (unchanged)
- Moderator `readOnly` — no reply/status controls (unchanged)
- Super admin — reply, attachments, mark pending/resolved/close/reopen (unchanged)
- Global user `SupportChatWidget` — not modified (separate floating widget)

### Components restyled / composed

- `AdminSupportChat` — hero + 2-column inbox hub
- `AdminSupportPanel` — embedded list with search/role/date filters + status pills
- `AdminSupportThread` — themed transcript, status card, reply form (handlers preserved)
- `admin-support-chat.css` — aviation command-center styling

### Filters added (client-side on loaded list)

| Filter | Functional | Notes |
|--------|------------|-------|
| Search (name/email/ticket/preview) | Yes | Client-side |
| Role (guest/client/pilot/admin) | Yes | Client-side |
| Date (7d/30d/90d) | Yes | Uses `lastMessageAt` |
| Status (all/open/pending/resolved/closed) | Yes | Existing API query param |
| Priority / category | No | Not in admin support DTO |

### Upload / prefill / reply behavior

- Reply attachment: same MIME/size validation (`SUPPORT_ALLOWED_MIME_TYPES`, 5 MB)
- FormData POST unchanged
- No user intake form on admin page (requester form remains in `SupportChatWidget`)

### Separation confirmed

- Messages read-only tracking (`/dashboard/admin/messages`) — untouched
- Disputes (`/dashboard/admin/disputes`) — untouched
- Job approval — untouched

### Files updated

- `src/app/dashboard/admin/support/page.tsx`
- `src/app/dashboard/admin/support/[id]/page.tsx`
- `src/components/admin/AdminSupportPanel.tsx`
- `src/components/admin/AdminSupportThread.tsx`
- `src/components/dashboard/admin/support/AdminSupportChat.tsx` (new)
- `src/styles/admin-support-chat.css` (new)

### Missing modules discovered

| Gap | Notes |
|-----|-------|
| Server-side support search | Client filter on loaded chats |
| Server-side role/date filters | Client-side only |
| Priority/category fields | Not in `AdminSupportChatListItemDto` |
| Support read audit log | No admin view tracking |

### Notes / assumptions

- Admin hero subtitle uses Ground Control copy; moderator note clarifies read-only limits
- Deep link `[id]` opens same 2-column hub with chat pre-selected
- `AdminSupportPanel` non-embedded fallback retained for safety but pages use embedded hub only

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 31 — Admin / Moderator Dispute Center (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Disputes Center (client–pilot marketplace disputes) |
| **Routes** | `/dashboard/admin/disputes`, `/dashboard/admin/disputes/[id]`; aliases `/admin/disputes`, `/moderator/disputes` (+ `[id]`) |
| **Status** | Implemented |

### Existing modules reused

- `listDisputesForAdmin`, `getDisputeForAdmin`, `startDisputeReview`, resolve + entry APIs (M23)
- `GET/POST /api/admin/disputes/*` — unchanged
- Client disputes UI at `/dashboard/client/disputes` — untouched
- `BookingDisputeSection` — untouched
- Messages read-only tracking — link only from detail sidebar when booking conversation exists
- Support Chat — separate module, not merged

### Components created

- `AdminDisputeCenter` — stats, active dispute cards, filters/sort, archive toggle
- `AdminDisputeDetailView` — two-column case timeline + moderation sidebar
- `AdminDisputeResolveModal`, `AdminDisputeVoteModal` (squadron vote placeholder)
- `dispute-center.ts`, `dispute-center-filters.ts`, `admin-dispute.ts`, `admin-disputes.css`

### Role-based permissions (preserved)

- **Moderator:** view, start review, post moderator comments; cannot resolve (shows recommend resolution)
- **Super Admin:** resolve after `under_review` via existing resolve API
- Squadron vote: placeholder modal only (no backend)

### List page behavior

- Live stats from Prisma; demo stat overrides when no active cases
- Active cards from API; demo cards when queue empty
- Client-side search, status, priority, sort; server status filter on fetch
- `LOAD PRIOR ARCHIVE` fetches resolved disputes

### Detail page behavior

- Server-loaded dispute + optional conversation link to `/dashboard/admin/messages/[id]`
- Timeline from `dispute.entries` (real API data)
- Start review → `POST .../review`
- Moderator comment → `POST .../entries`
- Resolve modal → `POST .../resolve` (super admin, under review only)

### Missing modules discovered

| Gap | Notes |
|-----|-------|
| Dispute priority field | Client heuristic only |
| Squadron voting workflow | Placeholder modal |
| Pilot disputes list page | API entries exist; no `/dashboard/pilot/disputes` UI |
| Dispute SLA/satisfaction APIs | Inline Prisma approximations |
| Extended status enum | DB uses open / under_review / resolved |

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 32 — Remove Admin Reviews Approval (2026-06-02)

| Field | Value |
|-------|--------|
| **Change** | Reviews Approval removed from admin/moderator |
| **Rationale** | Reviews use a direct client/pilot flow (`createReview` → `published`); no moderation queue |
| **Nav** | Removed from `dashboard-admin.ts` |
| **Route** | `/dashboard/admin/reviews` redirects to `/dashboard/admin` |
| **Removed** | `AdminReviewsPanel`, `GET/PATCH /api/admin/reviews`, `src/lib/admin/reviews.ts` |
| **Unchanged** | Client/pilot review pages and booking review APIs |

---

## Phase 33 — Admin Pilot Tier Plans / Subscription Management (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Tier Plans (Subscription Management) |
| **Routes** | `/dashboard/admin/subscriptions` (canonical), `/admin/subscriptions` (alias) |
| **Access** | Super Admin only |
| **Status** | Implemented |

### Reused modules

- `SubscriptionPlan` / `PilotSubscription` Prisma models (M27)
- `GET /api/admin/subscriptions` (extended with stats)
- `listPlansForAdmin`, `listPilotSubscriptionsForAdmin`
- Pilot membership page `/dashboard/pilot/subscription` (preview link; checkout unchanged)
- `mapTierToSubscriptionCard`, rank assets, aviation admin shell (`admin-dashboard.css`)

### Components created

- `AdminTierPlansPortal.tsx` — hero, stats, tier grid, commission card, enrollments
- `AdminTierPlanCard.tsx` — admin plan cards (Edit / Manage Features)
- `AdminTierPlanEditModal.tsx` — edit drawer/modal
- `AdminTierEnrollments.tsx` — pilot enrollment list

### Components removed / replaced

- `AdminSubscriptionsPanel.tsx` (read-only list) → replaced by portal

### Lib / API

- `src/lib/admin/plan-features.ts` — v2 features JSON (description, display features, recommended)
- `src/lib/admin/subscription-stats.ts` — subscriber count, MRR, avg tier from DB
- `PATCH /api/admin/subscriptions/[id]` — persist plan edits to `SubscriptionPlan`
- `updatePlanForAdmin()` in `src/lib/admin/subscriptions.ts`

### CSS

- `src/styles/admin-subscriptions.css` (imported on subscriptions page)

### Save behavior

- **Real persistence** for name, description, monthly price, visibility delay, can view/apply, instructor, active, recommended, display features (stored in `features` JSON v2)
- Recommended tier clears other tiers’ recommended flag in one transaction
- No fake Stripe sync — Stripe fields hidden (not in schema)

### Commission

- Read-only card: 10% from `DEFAULT_COMMISSION_RATE` — editable commission settings pending

### Pilot-facing sync

- `toMembershipTierDto` reads v2 features meta → pilot plan API reflects admin name, price, features, recommended badge
- Job visibility / bid gating unchanged (DB fields `jobVisibilityDelayHours`, `canApply`)
- Marketing `/pricing` static copy unchanged

### Stats

- Active subscribers, MRR, avg tier: **real** from Prisma
- Churn rate: **mock** (documented as pending analytics backend)

### Pending backend (see BUILD_CONTROL M216–M225)

- Stripe product/price mapping and sync
- Proposal limit enforcement by tier
- Editable global commission settings
- Tier MRR/churn analytics API
- Audit log for plan/pricing changes
- Marketing `/pricing` DB sync (optional)

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 34 — Admin Pilot Commissions / Commission Ledger (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Pilot Commissions (Commission Ledger) |
| **Routes** | `/dashboard/admin/payments` (canonical), `/admin/commissions` (alias) |
| **Access** | Moderator+ view; Run Payouts button super admin only |
| **Status** | Implemented |

### Reused modules

- `Payment` + `Commission` Prisma models (M12)
- `DEFAULT_COMMISSION_RATE` / `calculateCommission()` — fixed 10%
- `GET /api/admin/payments` (extended response)
- `recordPaymentForCompletedBooking()` unchanged
- Pilot/client payment pages (display forced to 10%)

### Components created

- `AdminCommissionsPortal.tsx` — hero, metrics, ledger, filters, pagination
- `AdminRunPayoutsModal.tsx` — placeholder payout confirmation
- Replaced `AdminPaymentsPanel.tsx`

### Lib / CSS

- `commission-ledger.ts` (server), `commission-ledger-client.ts` (CSV)
- `admin-commissions.css`

### Fixed 10% rule

- All ledger rows: rate **10%**, commission = gross × 10%
- Metric card: **COMMISSION RATE → 10%** (not avg/weighted)
- No tier-based commission overrides

### CSV / filters / payouts

- Client-side CSV export → `pilot-commissions-ledger.csv`
- Client-side filters: status, pilot, client, mission ID
- Run Payouts: placeholder only — no live execution

### Pending (BUILD_CONTROL M223–M230)

- Stripe Connect, payout execution, server export/filter APIs, audit log

### Production build

Passes (`npm run build`, 2026-06-02).

---

## Phase 35 — Admin Automated Certificates / Certificate Engine (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Automated Certificates (Certificate Engine) |
| **Routes** | `/dashboard/admin/certificates` (canonical), `/admin/certificates` (alias) |
| **Access** | Moderator+ view/preview/manual issue; super admin template CRUD |
| **Status** | Implemented |

### Reused modules

- M22 certificate templates, PDF generation, manual issue APIs
- Pilot `/dashboard/pilot/certificates` unchanged

### Components

- `AdminCertificateEnginePortal`, `AdminCertificateTemplateCard`, `AdminCertificateLivePreview`, `AdminCertificateTemplateModal`
- Replaced `AdminCertificatesPanel`

### Behavior

- Template list + live preview; mock templates when DB empty
- New/edit template: real API (super admin)
- Manual issue + PDF download preserved (moderator+)
- Verification: “Encrypted verification active” — no blockchain

### Pending (M231–M240)

- Automated triggers, QR route, email delivery, analytics API

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 36 — Admin Badges & Wings / Achievements (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Badges & Wings (Admin achievement management) |
| **Routes** | `/dashboard/admin/achievements` (canonical), `/admin/badges` (alias) |
| **Access** | Super admin only (create/edit/assign); page gated in nav + auth config |
| **Status** | Implemented |

### Reused modules

- `WingDefinition` / `PilotWing` Prisma models (wings system — badges are wings)
- `GET/POST /api/admin/wing-definitions`, `PATCH /api/admin/wing-definitions/[id]`
- `GET/POST /api/admin/wings` (manual assign via `grantWingToPilot`)
- `evaluateAndAssignWings` milestone logic (unchanged; not wired to new UI triggers)
- Pilot `PilotWingsPanel`, `WingBadge`, public profile wing display (unchanged)

### Components created

- `AdminBadgesWingsPortal.tsx` — hero, metrics, filters, badge grid, recent awards
- `AdminBadgeCard.tsx` — rarity-styled badge cards with Edit/Assign
- `AdminBadgeModal.tsx` — new/edit badge (wing definition)
- `AdminBadgeAssignModal.tsx` — manual pilot assignment
- Replaced `AdminWingsPanel.tsx`

### Lib / API / CSS

- `badge-engine.ts`, `badge-display.ts`, `badge-stats.ts`, `types/admin-badges.ts`
- `GET /api/admin/badge-engine` — aggregated portal data
- `admin-badges.css`

### Badge grid behavior

- 3-column desktop / 2 tablet / 1 mobile
- Rarity top border + icon tint (LEGENDARY gold, RARE green, EPIC pink, COMMON gray)
- Mock 6-badge catalog when DB has no wing definitions; real data when seeded
- Client-side search, rarity, and active/inactive filters

### New / Edit / Assign behavior

- **New Badge:** `POST /api/admin/wing-definitions` (real persistence)
- **Edit:** `PATCH /api/admin/wing-definitions/[id]` (real persistence); mock cards preview-only
- **Assign:** `POST /api/admin/wings` (real grant); disabled on mock cards
- Rarity is display-layer only (derived from code/category/threshold — no DB rarity column)
- Assignment notes, expiration, evidence links: preview-only

### Automation behavior

- Auto-award checkbox maps to existing `WING_AUTO_RULES` on save
- Triggers like flight hours, night missions, first bid: UI labels only — engine gaps documented
- `evaluateAndAssignWings` not modified

### Pilot profile relation

- Badges/wings display on pilot dashboard achievements, public pilot profile (existing)
- Separate from certificates (M22) and uniform shop

### Pending (BUILD_CONTROL M241–M249)

- Rarity field in schema, badge analytics API, extended automation triggers, assignment audit log, icon media management

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 37 — Admin Uniform Shop Products & Orders (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Uniform Shop — Products & Orders (admin management) |
| **Routes** | `/dashboard/admin/shop` (canonical), `/admin/shop` (alias) |
| **Access** | Moderator+ view; super admin product CRUD |
| **Status** | Implemented |

### Reused modules

- M26 `UniformProduct`, `UniformProductVariant`, `UniformOrder` Prisma models
- `listProductsForAdmin`, `createProduct`, `updateProduct`, `createVariant`, `updateVariant`
- `listOrdersForAdmin`, `updateOrderByAdmin`
- Existing admin shop APIs (`/api/admin/shop/products`, variants, orders)
- Pilot `PilotUniformShop` + `/api/pilot/shop/products` unchanged (same DB catalog)

### Components created

- `AdminUniformShopPortal.tsx` — hero, metrics, inventory + recent orders layout
- `AdminShopInventoryRow.tsx`, `AdminShopOrderRow.tsx`, `AdminShopProductModal.tsx`
- Replaced `AdminUniformShopPanel.tsx`

### Lib / API / CSS

- `shop-engine.ts`, `shop-display.ts`, `shop-stats.ts`, `types/admin-shop.ts`
- `GET /api/admin/shop-engine` — aggregated portal data (moderator+)
- `admin-shop.css`

### Product data source

- Admin inventory reads `UniformProduct` + variants from DB (same source as pilot shop)
- Mock inventory/orders when DB empty; pilot shop still uses mock display cards when catalog empty

### Add Product / Edit behavior

- **Add:** `POST /api/admin/shop/products` + `POST …/variants` (real persistence)
- **Edit:** `PATCH` product + primary variant (real persistence); mock rows preview-only
- Stock threshold field display-only until schema supports per-SKU alerts

### Inventory / orders / fulfillment

- 58/42 two-column layout: inventory left, recent orders right
- Stock status: IN STOCK / LOW STOCK (≤10) / OUT OF STOCK
- Fulfillment % from delivered vs non-cancelled orders (82% mock when no orders)
- VIEW ALL orders list route pending

### Pilot shop preserved

- No changes to `PilotUniformShop`, cart, checkout placeholder, or pilot shop routes

### Pending (BUILD_CONTROL M250–M258)

- Full orders list page, stock threshold schema, shop revenue analytics polish, order fulfillment workflow UI, image upload

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 38 — Admin CMS Collections (Articles & Resources) (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | CMS Collections (WordPress CPT-style admin) |
| **Routes** | `/dashboard/admin/cms` (+ articles/resources CRUD sub-routes), `/admin/cms/*` aliases |
| **Access** | Super admin only |
| **Status** | Implemented (preview persistence) |

### Collections

- **Articles** — help articles, knowledge center posts, guides (seeded from `help-articles` + marketing `resources-content`)
- **Resources** — PDFs, checklists, templates, external links (seeded in `cms-seed.ts`)

### Reused modules

- `getHelpArticlesSeed()` export added to `help-articles.ts` (help center unchanged)
- Marketing `resources-content.ts` imported for article seed only — public `/resources` unchanged

### Components

- `AdminCmsOverviewPortal`, `AdminCmsCollectionCard`, `AdminCmsArticlesList`, `AdminCmsResourcesList`
- `AdminCmsArticleEditor`, `AdminCmsResourceEditor`, `AdminCmsStatusBadge`

### Lib / API / CSS

- `types/cms.ts`, `lib/cms/cms-seed.ts`, `lib/cms/cms-store.ts` (in-memory preview store)
- `GET /api/admin/cms-engine`, CRUD `/api/admin/cms/articles`, `/api/admin/cms/resources`
- `admin-cms.css`

### Persistence behavior

- Saves update in-memory store (resets on server restart) — **not** Prisma/DB
- Banner on overview/editors: preview-only until CMS persistence ships
- Slug uniqueness validated in store

### Public / help center relation

- Public Resources and pilot Help Center still use existing static modules
- CMS prepared for future integration — no public page redesign

### Pending (BUILD_CONTROL M259–M269)

- Prisma CMS models, file upload storage, rich text editor, public/help CMS wiring

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 39 — Admin Platform Configuration (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Platform Configuration (main settings tab) |
| **Routes** | `/dashboard/admin/settings` (canonical), `/admin/configuration` (alias) |
| **Access** | Super admin only; Save/Edit hidden for non–super-admin |
| **Status** | Implemented (preview/read-only settings) |

### Reused modules

- `DEFAULT_COMMISSION_RATE` (fixed 10%) — read-only display
- CMS in-memory stats via `getCmsOverview()` / `listCmsArticles()`
- Notification trigger mapping for email template names
- Env-based integration status detection (no faked CONNECTED)

### Components

- `AdminConfigurationPortal`, `AdminConfigEmailTemplateModal`, `AdminConfigSaveConfirmModal`

### Lib / API / CSS

- `configuration-data.ts`, `types/admin-configuration.ts`
- `GET /api/admin/configuration`
- `admin-configuration.css`

### Fees / commission

- Base platform commission: **10%** read-only from `DEFAULT_COMMISSION_RATE`
- No tier-based or variable commission UI
- Stripe/withdrawal/conversion rows shown as planned read-only reference values

### Email templates

- Six templates mapped to real/planned notification workflows
- EDIT opens read-only preview modal — no template persistence

### Security

- Four settings shown as **disabled** toggles (not integrated)
- No fake functional security changes

### Integrations

- Status from env: Neon DB, Auth.js, SMTP, Stripe, local file storage, Twilio, Mapbox, DocuSign
- Honest NOT CONFIGURED / CONNECTED / CONFIGURED labels

### Save behavior

- SAVE CHANGES → confirmation modal → preview-only notice (no backend persistence)

### Pending (BUILD_CONTROL M270–M280)

- Platform settings DB, security enforcement, email template editor, settings audit log

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 40 — Admin Moderator Permissions / Access Control (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Moderator Permissions (access control) |
| **Routes** | `/dashboard/admin/permissions` (canonical), `/admin/permissions` (alias) |
| **Access** | Super admin manages permissions; moderators subject to per-module matrix |
| **Status** | Implemented (preview persistence) |

### Reused modules

- `isAdminRole`, `roleMeetsRequirement`, `ADMIN_ROUTE_MIN_ROLE` (narrowed to permissions page only)
- `listUsersForAdmin()` for moderator directory when DB has moderator users
- Shared admin layout, `DashboardShell`, `admin-ops-bracket-card` hero pattern

### Permission model

- `types/moderator-permissions.ts` — module keys, action keys, presets (`full`, `limited`, `custom`)
- `lib/auth/moderator-permissions.ts` — `canAccess`, `canPerform`, presets, path/nav mapping, nav filter
- `lib/auth/moderator-permissions-store.ts` — in-memory preview store (resets on restart)
- Default moderator access: **Full Access** preset unless admin changes it

### Components

- `AdminModeratorPermissionsPortal`, `AdminPermissionSaveModal`
- `ModeratorAccessRestricted`, `ModeratorRouteGuard`
- `ModeratorPermissionsProvider` + `useModeratorPermissions` hook

### Lib / API / CSS

- `lib/admin/permissions-engine.ts`
- `GET /api/admin/permissions`, `GET/PATCH /api/admin/permissions/[userId]`
- `admin-permissions.css`

### Sidebar behavior

- Moderator nav filtered via `filterAdminNavForPermissions` in admin layout
- Restricted modules hidden from sidebar
- Permissions management link hidden from moderators (super admin only)

### Route protection

- `ModeratorRouteGuard` in admin layout blocks direct URL access
- Shows “Access restricted” with back-to-dashboard button
- Super admin unrestricted; `/dashboard/admin/permissions` super admin only via `ADMIN_ROUTE_MIN_ROLE`

### Action / button behavior

- Reports export, commission export/run payouts, fleet export/invite, job approve/reject/review, dispute resolve/recommend wired to `canPerform`
- Shop, certificates, badges, configuration pages use permission-based `canManage` flags

### Save behavior

- Save → confirmation modal → PATCH to in-memory store → preview-only banner

### Backend persistence

- **Pending** — no Prisma permission tables; in-memory store only
- Mock moderators (Hana, Elara, Quinn) when no moderator users in DB

### Audit log

- **Pending** — `updatedBy` / `updatedAt` stored in preview config only

### Notes / assumptions

- Codebase uses `super_admin` as Admin; no separate `admin` role enum
- Middleware still role-gates dashboard type; module permissions enforced in layout guard + components
- Dangerous actions (run payouts, config edit, subscription edit, dispute resolve) off by default in Full Access preset

### Pending (BUILD_CONTROL M281+)

- Permission persistence backend, server middleware enforcement, audit log, change notifications

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Phase 41 — Global Design System Alignment (2026-06-02)

| Field | Value |
|-------|--------|
| **Page / module** | Global Design System Alignment |
| **Scope** | Home `/`, client/pilot/admin/moderator dashboards |
| **Status** | Implemented |

### Reference pages (design source of truth)

- `/for-clients` (Hire Pilots)
- `/for-pilots` (Join as Pilot)
- `/how-it-works`
- `/pricing`
- `/safety`

Reference pages unchanged except header/footer token cleanup.

### Shared tokens created / updated

- Extended `:root` in `globals.css` with `--color-bg`, `--color-card`, `--color-card-warm`, `--color-gold`, `--color-text*`, `--radius-card`, `--shadow-card`, `--container-public`, `--dashboard-card-border`
- Legacy `--gold`, `--foreground`, etc. aliased to unified tokens
- `src/styles/brand-shared.css` — `.ras-btn-primary`, `.ras-btn-outline`, `.ras-eyebrow-pill`, `.ras-hero-title`, `.ras-card`, dashboard input focus styles
- Dashboard shell `--dash-*` variables mapped to brand tokens

### Home page changes

- `HomeHeroDual` — reference eyebrow pill, gold CTA, outline pilot CTA, brand typography
- `HomeTrustStrip`, `HomeAudienceCards`, `HomeSopSection`, `HomeCapabilities`, `HomeRankProgression` — brand tokens/classes
- `figma-home-*` CSS aligned to shared palette

### Dashboard changes

- All `src/styles/*.css` modules — hardcoded colors replaced with CSS variables
- `globals.css` client dashboard + shell use brand tokens
- `Button.tsx` primary variant uses dark-on-gold like marketing CTAs
- `.premium-card` / `.dashboard-card` use warm card tokens

### Preserved

- All routes, auth, role dashboards, permissions, CMS, shop, payments logic
- Public container (`public-container` / 1280px canvas)
- Reference page layouts and content

### Known remaining inconsistencies

- Some marketing components still use inline Figma hex
- Per-page dashboard CSS modules retain unique layout classes (colors tokenized)

### Production build

Passes (`npx next build`, 2026-06-02).

---

## Source Document Alignment — Media Kit, Membership Upgrades, Paragraph 5 Clarifications (2026-06-02)

| Field | Value |
|-------|--------|
| **Scope** | Business rules documentation — no marketplace wiring in this pass |
| **Status** | Implemented (docs + agent module + commission constant) |

### Documents reviewed

1. `Remote Air Service Media Kit V.1 Highlighted.pdf` — brand, grades, uniform, proposal→contract, disputes, shop, wings  
2. `Pilot Membership and Upgrades.pdf` — $99.99/yr membership, one-time Fast Forward, upgrade difference  
3. `Paragraph 5 Clarifications.pdf` — 15% commission, lapse/reactivation, instructor, Captain's Club, governance  

### Business rules updated

| Rule | Previous | New (source of truth) |
|------|----------|----------------------|
| Platform commission | 10% Phase 1 | **15% default** (not tier-based) |
| Membership | Per-tier monthly/yearly marketing prices | **$99.99/year** + one-time Fast Forward upgrades |
| Upgrade billing | Full price each tier jump | **Difference only** on later upgrades |
| Instructor | Partial in tiers | **$199.99/year** add-on, min A-4 |
| A-1 proposals | Backend blocked | Confirmed — cannot apply |
| Visibility delays | Backend 48→0h aligned | Confirmed; marketing/Figma may still conflict |
| Chat initiation | Not enforced | **Client only** (M306) |
| Proposal revision | Not implemented | **+20% max** (M305) |
| Captain's Club | Not built | **Public A-6 list** required (M317) |
| Remote Rescue | N/A | **Future 2027 — do not build** |

### Conflicts resolved or pending

| Conflict | Resolution |
|----------|------------|
| 10% vs 15% commission | **Resolved in docs + `DEFAULT_COMMISSION_RATE`**. Per-pilot override deferred (M309). |
| Monthly tier pricing vs $99.99/yr | **Documented** — code/UI update in M297–M299; Figma realign M320. **Pending client Fast Forward fee table.** |
| Generic marketplace vs RAS reputation | **Documented** in IMPLEMENTATION_CONTEXT — not a Fiverr clone. |
| Disputes as simple UI vs mediation | **Documented** — Squadron Vote M318 post-MVP. |
| Static badges vs rule-driven wings | **Documented** — M314. |

### Development plan impact

- New BUILD_CONTROL modules **M295–M320**
- [`FUNCTIONALITY_WIRING_PLAN.md`](FUNCTIONALITY_WIRING_PLAN.md) phases 1–10 updated
- Cursor rule [`.cursor/rules/business-rules-ras.mdc`](../.cursor/rules/business-rules-ras.mdc) for agent context
- [`NEW_FEATURES_COMPARISON.md`](NEW_FEATURES_COMPARISON.md) + [`IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`](IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md) created

### Routes / modules affected (future work)

| Area | Impact |
|------|--------|
| `/dashboard/client/quotes` | Wire bids; client-initiated chat; +20% revision |
| `/dashboard/pilot/subscription` | Split membership vs Fast Forward (not monthly tiers) |
| `/pricing` + Figma | Re-align to $99.99/yr model (M320) |
| `/dashboard/admin/payments` | 15% commission copy; override UI later |
| Captain's Club | New public route (M317) |
| Membership / lapse | New backend modules M300–M302 |
| Disputes | Keep separate from messages/support; M318 later |

### Remaining client clarifications

1. Fast Forward one-time fee amounts per grade  
2. Interaction between paid Fast Forward and automatic time-based promotion  
3. Commission buyout formula confirmation (post-launch)  
4. Definition of "30 approved days" for ID card  
5. Final certificate template assets  
6. Figma screen priority after membership model change  

### Production build

Passes after documentation + commission constant update (2026-06-02).
