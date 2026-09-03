# Changelog

All notable project changes are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.27.71] — 2026-09-03

### Fixed

- **Mobile-first pass:** dashboard drawer locks body scroll, closes on Escape/resize, and uses correct `aria-expanded` / `inert` when closed.
- Pilot My Proposals switches to stacked cards under 900px (no forced sideways table scroll).
- Notification panel fits narrow phones; marketplace filter fields and client welcome title scale better; home dual-hero panels are shorter on small screens; marketing mobile menu locks scroll.

---

## [0.27.70] — 2026-09-03

### Fixed

- Public and dashboard profiles show the **highest earned digital wing**, approved verification credentials, and issued platform certificates.
- Hourly rate field uses a real `$` (no mirrored SVG). Public rate copy uses `$150/hr`.
- Aerial Video and Photography service chips toggle independently; unselected chips no longer look gold/active.
- LICENSE & COMPLIANCE is read-only from approved Verification uploads (FAA Part 107, FAA Aircraft Registration, EASA C-1/C-2/C-3/STS/LPC, Insurance, Business Registration).
- Request Wings is in the pilot sidebar (`/dashboard/pilot/verifications/request-wings`); Certificates remains at `/dashboard/pilot/certificates`.
- Public pilot profile, Request Wings, and profile editor stack more cleanly on phones (single-column wing cards under 480px, wrapping hero stats).

### Added

- Verification catalog entries for EASA classes, FAA aircraft registration, insurance, and business registration.

---

## [0.27.69] — 2026-09-02

### Fixed

- **Platform UX audit:** client nav adds Bookings and Disputes; pilot nav adds Certificates and Digital Wings.
- Correct proposal/job links on dashboard recommended jobs and marketplace cards; remove hardcoded client rating.
- Deliver Work links scroll to `#deliver`; disable non-functional admin briefing and invoice PDF controls.
- Remove distance marketplace filter; update stale bid-accept copy; add retry on billing and reviews fetch errors.

---

## [0.27.68] — 2026-08-28

### Fixed

- **Vercel deploy failure:** stop bundling `pdfkit` into booking and notification API routes — lazy-load certificate PDF code and scope pdfkit file tracing to certificate download routes only.

---

## [0.27.67] — 2026-08-28

### Added

- **Hostinger SMTP** delivery for transactional email when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are set (e.g. `support@remoteairservice.com`).
- `.env.example` documents Stripe test keys and Hostinger SMTP variables.

---

## [0.27.66] — 2026-08-25

### Fixed

- Production build: import `SendIcon` on the client messages composer (same missing-import pattern as PaperclipIcon).

---

## [0.27.65] — 2026-08-25

### Fixed

- Production build: import `PaperclipIcon` on the client messages composer so `next build` typecheck passes.

---

## [0.27.64] — 2026-08-25

### Fixed

- Public pilot profile now mirrors dashboard extras: service chips (including Thermal/Construction/Emergency), languages, license country, miles for service radius, and a single hourly rate when min and max match.
- Saving a pilot profile now includes a drone or payload still sitting in the text field (no extra Add click required).

### Added

- Admin **Delete** on issued certificates from the certificate engine and from the pilot member profile. Deleting an issued copy removes it from the pilot account and public listing; templates stay in the catalog.

---

## [0.27.63] — 2026-08-25

### Fixed

- Issuing a certificate now **always writes the PilotCertificate row** even if PDF generation or Blob storage fails, so it appears on the pilot account and public profile.
- Pilot **Save Draft** on a proposal persists to the database (status `draft`), not only the browser. Drafts show under My Proposals and can be finished later.
- Portfolio gallery add/edit modal no longer crashes on open (React hooks ran after an early return), so gallery items save (3.15).
- Pilot dashboard earnings, contracts, and proposals cards use live counts and link to those pages (3.13).

---

## [0.27.62] — 2026-08-25

### Added

- Pilot **notification preference** toggles persist on the pilot profile (Neon).
- Marketplace message **file attachments** (images/PDF) persist on the conversation and Vercel Blob.
- Pilot **account deactivation** persists `deactivated` status; signing in within **30 days** restores the account and grade.

### Fixed

- Client billing no longer shows sample invoices or a fake saved card.
- Pilot dashboard reviews no longer display placeholder 4.9 / 47 counts when there are no live reviews.

---

## [0.27.61] — 2026-08-24

### Added

- Admin **Remove** on issued certificates deletes the database record (pilot account + public profile) and the stored PDF.

### Fixed

- File uploads (support, verifications, deliveries, certificates, avatars, shop, CMS) now surface the real storage error and allow overwrite on the public Blob store so attachments no longer fail silently.

---

## [0.27.60] — 2026-08-24

### Fixed

- Certificate issue now **saves the database record even if PDF/Blob storage fails**; the PDF is regenerated on download so issued certificates still appear in the audit trail, pilot account, and public profile.
- Member numbers that were stored as names/slugs are cleared and reassigned as **6-digit IDs starting at 001000**. Certificates and member profiles no longer print a lengthy name in the member-number field.

---

## [0.27.59] — 2026-08-20

### Fixed

- Support chat attachments (and other app-gated Blob writes) no longer call `access: "private"` against a **public** Vercel Blob store. Default is `public`; set `BLOB_ACCESS_MODE=private` only for a private store.

---

## [0.27.58] — 2026-08-20

### Added

- Authenticated **`/api/uploads/image`** route for profile avatars, client logos, portfolio previews, and post-project reference files — stored on **Vercel Blob** when `BLOB_READ_WRITE_TOKEN` is set (local `/public` fallback otherwise).
- `npm run qa:users` creates a fresh Client + approved A-3 Pilot pair for testing.

### Changed

- Pilot avatar, client logo, and portfolio preview uploads no longer use ephemeral data/object URLs; they persist via Blob.

---

## [0.27.57] — 2026-08-19

### Added

- Admin **Squadron Voting** (`/dashboard/admin/squadron-voting`) now matches Figma Peer Moderation (`808:32708`): metrics, client vs pilot vote cards, VIEW EVIDENCE / OVERRIDE / CLOSE EARLY. Send to squadron vote opens a real 48-hour ballot instead of a placeholder.

### Changed

- Admin dispute detail layout: compact case header (DSP id, parties, facts) with a stable two-column thread + actions sidebar.

---

## [0.27.56] — 2026-08-19

### Fixed

- Pilot **Submit Proposal** now opens the Terms popup on Submit Application (and on the off-platform billing acknowledgment) so the required confirm checkbox is in the modal, matching client post-project. Confirm & Submit proceeds from there.

---

## [0.27.55] — 2026-08-19

### Fixed

- Pilot **Submit Proposal** estimated delivery date now uses the same calendar date picker as client post-project (dd/mm/yyyy + popup calendar), instead of the native browser date input

---

## [0.27.54] — 2026-08-19

### Fixed

- Pilot **contract/booking detail** (`/dashboard/pilot/bookings/[id]`) now uses the same OPERATIONS header, gold cards, and action bar as Active Contracts / proposal detail instead of the old light PageHeader layout

---

## [0.27.53] — 2026-08-19

### Fixed

- Pilot **Messages** two-panel layout: conversation list/composer styles now apply (they were scoped only to the client shell), and the chat fills the remaining viewport under the OPERATIONS header instead of overflowing

---

## [0.27.52] — 2026-08-19

### Added

- Rich **client-test seed** (idempotent): grades A-1–A-7, second client, jobs in draft/pending/rejected/open/locked/bidding/assigned/closed, proposal states, in-progress contract + chat + delivery, completed payout + reviews, open dispute. Vercel Production build re-runs seed. See `docs/DEMO_DEPLOY.md`.

---

## [0.27.51] — 2026-08-19

### Fixed

- Pilot **My Proposals** status filters wrap as chips (All / Pending / Revised / Accepted / Rejected / Withdrawn) instead of clipping off-screen; counts sit in badges; `?status=` persists the active filter

---

## [0.27.50] — 2026-08-19

### Added

- Pilot portfolio items can be **edited** and **removed** from `/dashboard/pilot/portfolio` (prefilled editor, preview change/remove, delete confirmation)

---

## [0.27.49] — 2026-08-19

### Fixed

- Profile photos now appear globally after upload: dashboard sidebar, public `/pilots` cards, Find Pilots, recommended pilots, bid cards, messages, marketplace job cards, Captain’s Club, and admin verification identity

---

## [0.27.48] — 2026-08-18

### Added

- **Request Wings** (`/dashboard/pilot/verifications/request-wings`, Figma `1229:6885`): pilots choose Recreational / Student / Aviator / Senior / Master wings, upload evidence, save draft or submit for admin review
- Admin **Remote Aviator Verification** now has a **Wings requests** queue — approve awards the matching digital wing and runs certificate evaluation; deny returns a draft for resubmit
- Distinct from instructor student awards (`InstructorWingRequest`) — this flow is admin-reviewed aviator wings

---

## [0.27.47] — 2026-08-18

### Added

- **Instructor Membership Dashboard** (`/dashboard/pilot/instructor`, Figma `808:3626`): activate $199.99/year A-4+ add-on, generate/copy student discount code, review student wing requests (Silver Pilot / Gold Basic only)
- Students apply instructor codes on Membership for **20% off** the $99.99 basic membership and can request wings; linked students get **15% off** epaulettes/wings in the shop (demo, no Stripe)
- Public `/pilots/[id]` lists active instructors as **Remote Pilot Instructor**

---

## [0.27.46] — 2026-08-18

### Changed

- **Pilot Active Contracts** (`/dashboard/pilot/contracts`): Figma `808:19635` layout — `OPERATIONS / CONTRACTS` bracket header, contract cards with value badge, deadline row, Deliver Work / Message Client / Open Dispute; live bookings API unchanged
- **Pilot Messages** (`/dashboard/pilot/messages`): Figma `808:20108` — `OPERATIONS / MESSAGES` header, job + contract context in chat header; live conversations API unchanged

### Milestone

- **Milestone 3 — Pilot signed off** (`ACTIVE_MILESTONE = 4`); Week 4 Bug Fixes & Hardening unlocked

---

## [0.27.45] — 2026-08-17

### Changed

- **Pilot profile extras persist** (`profileExtrasJson`): call sign, languages, drones, payloads, extra chips, and avatar save with the live profile; Flight Gallery on profile shows `portfolioJson` items
- Public `/pilots/[id]` shows call sign, avatar, equipment chips, and flight gallery
- **Uniform & Insignia Shop** (`/dashboard/pilot/shop`): Figma Container `808:22235` layout — 3-col catalog, cart aside, locked A-6 polo, Configure Polo, rules banner; catalog SKUs and eligibility wired (Stripe still demo)

---

## [0.27.44] — 2026-08-17

### Changed

- **Pilot Submit Proposal** (`/dashboard/pilot/jobs/[id]/proposal`): Figma `1171:4661` layout (split description/requirements, bid form, operational/compliance/pricing, order summary) with live job and proposal fields
- **Submit Application** opens Terms overlay (`1171:5545`); **Confirm & Submit** posts `POST /api/pilot/jobs/[id]/applications`

---

## [0.27.43] — 2026-08-17

### Changed

- **Week 3 remaining pilot screens unlocked** at Milestone 3: Verification, Portfolio, Reviews, Earnings, Membership, Uniform Shop, Support, Settings
- Figma UI pass (layout from Figma, site color tokens): Portfolio `808:21066`, Reviews `808:23643`, Uniform `808:22234`, Support `808:22755`, Settings `808:23194`; Verification/Earnings chrome aligned to marketplace headers

---

## [0.27.42] — 2026-08-11

### Fixed

- **Vercel build:** `prisma db push --accept-data-loss` so CI can apply `User.memberNumber` unique index without interactive confirm

---

## [0.27.41] — 2026-08-11

### Changed

- **Pilot nav pause:** lock Verification, Portfolio, Reviews, Earnings, Membership, Uniform Shop, Support, and Settings behind Week 4 until Figma UI resume

---

## [0.27.40] — 2026-08-11

### Changed

- **Pilot Profile UI** (`/dashboard/pilot/profile`): Figma Main `808:19441` — marketplace header chrome, drones/equipment + payload panel, section order, site color tokens

---

## [0.27.39] — 2026-08-11

### Changed

- **Pilot job detail** (`/dashboard/pilot/jobs/[id]`): marketplace-aligned layout — bracket header, mission/action cards, site tokens

---

## [0.27.38] — 2026-08-11

### Changed

- **Pilot proposal detail** (`/dashboard/pilot/proposals/[id]`): marketplace-aligned layout — bracket header, card grid, field rows, site tokens

---

## [0.27.37] — 2026-08-11

### Changed

- **Pilot My Proposals UI** (`/dashboard/pilot/proposals`): Figma Main `808:18982` — header/tabs/table chrome, uppercase status pills, site color tokens

---

## [0.27.36] — 2026-08-11

### Changed

- **Pilot Locked Jobs UI** (`/dashboard/pilot/locked-jobs`): Figma Main `808:18477` — title/notice chrome, locked cards, live countdown, site color tokens

---

## [0.27.35] — 2026-08-11

### Changed

- **Pilot Mission Marketplace UI** (`/dashboard/pilot/jobs`): Figma Main `808:17880` — header/toolbar, six filter pills, mission card hierarchy, site color tokens
- Marketplace filters: LOCATION query param, DEADLINE client sort/filter; GRADE/DISTANCE deferred with note panels

---

## [0.27.34] — 2026-08-10

### Added

- **Pilot membership Instructor add-on** (Figma `1160:4705`): $199.99/year, A-4+ gate, demo activate/cancel API, listing preview UI
- Catalog helpers + tests for instructor eligibility and genuine membership prices

### Changed

- Membership page layout aligned to Figma Main (annual, Fast Forward statuses, upgrade-difference, uniform policy, footer blocks) using site color tokens

---

## [0.27.33] — 2026-08-10

### Changed

- **Pilot dashboard Main UI** (`/dashboard/pilot`): Figma frame `808:17230` alignment — tokens, hero CTAs/icons, job chips, panel headers, reviews, activity icons (APIs unchanged)

---

## [0.27.32] — 2026-08-04

### Changed

- **Milestone 3 — Pilot unlocked:** `ACTIVE_MILESTONE = 3`; membership + earnings pilot routes moved from M4 → M3 (Stripe still deferred)

---

## [0.27.31] — 2026-08-03

### Added

- **Vercel Blob** for uploads when `BLOB_READ_WRITE_TOKEN` is set:
  - Public: certificate artwork, wings, shop, CMS
  - Private: support attachments, verification docs, delivery files, issued certificate PDFs
  - Local `/public` or `/storage` fallback without the token

---

## [0.27.30] — 2026-08-03

### Fixed

- Certificate Studio image upload: send JSON/base64 instead of multipart FormData so Next.js 16 + Turbopack no longer returns a false “Server action not found” / Upload failed on create

---

## [0.27.29] — 2026-08-03

### Added

- Honorary grades **A-7–A-10** (Senior Captain → Commodore): seeded membership plans with A-6 marketplace visibility, **no fee**, excluded from Fast Forward
- Super Admin–only assignment of A-7–A-10 from pilot profile grade picker
- Captain’s Club includes A-6–A-10; new sorts: member number, last name A–Z/Z–A, wing type awarded

### Changed

- Documented client-confirmed A-7–A-10 rules in IMPLEMENTATION_CONTEXT

---

## [0.27.28] — 2026-07-30

### Added

- Platform **RAS member numbers** on `User` (6 digits, starting at `001000`) for pilots and clients; assigned on register and backfilled for existing accounts
- Certificate issue uses platform member number (not free-text license / name)

### Changed

- Replaced all six fillable certificate background PNGs with latest client artwork
- Overlay defaults: certificate number digits aligned after printed labels; wings member line is `######  MM/DD/YY`
- Issued certificates audit trail moved above Manual issue and always renders when engine data loads
- Certificate studio is a single fullscreen placement workspace (upload + fields + details + canvas)
- Default cert-number placements nudged after printed labels (recreational / promotion / wings); stale saved coords auto-migrated
- Issued list UI strengthened (count badge, clearer rows); audit trail always shows RAS member # when available

### Fixed

- Certificate builder: saved overlay positions were wiped on every Certificates page load (canonical ensure no longer clears `overlayPositionsJson` / artwork)
- Member overlay no longer prefixes `#` or falls back to lengthy license strings / names
- Certificate number overlay uses zero-padded 6-digit sequence (label stays on artwork)
- PDF download resolves platform member # (and repairs stored value) when an old issue saved a name/license
- Issue flow refuses to store non-numeric member identifiers on `PilotCertificate.licenseNumber`

### Changed

- Certificate builder UX: step guide, field presets, nudge pad, quick align, A+/A− size, keyboard arrows, advanced numbers collapsed

---

## [0.27.27] — 2026-07-29

### Added

- Admin pilot profile: manual **Set grade** control (A-1–A-6 promote/demote or enroll if no membership)
- `POST /api/admin/pilots/[id]/grade` for admin grade override
- A-7–A-10 listed as disabled invitation-only options in the grade picker

### Fixed

- Certificate builder overlay: certificate number field renders digits only (background already has “CERTIFICATE NO.”)
- Badge rarity order: Basic Silver = Rare, Basic Gold = Epic (Common → Mythic progression)

---

## [0.27.26] — 2026-07-28

### Fixed

- Admin Achievements: rarity is persisted on `WingDefinition` and round-trips on create/edit/filter (Common/Uncommon no longer collapse)
- Create wing respects Active checkbox; removed non-functional “Visible on profile” duplicate
- Icon style selector wired to save; Rarest metric uses stored rarity tier

### Changed

- Default six wings seed/update with explicit rarity values

---

## [0.27.25] — 2026-07-28

### Added

- Admin Job Approval: status tabs for All / Awaiting review / Approved / Rejected
- Clickable queue stats jump to matching status filter; URL `?status=` support
- Status badges on mission rows; Approve/Reject only on awaiting-review jobs

### Fixed

- Job queue refresh after approve/reject reloads the active status list (no broken pending-only refresh)

---

## [0.27.24] — 2026-07-28

### Fixed

- Admin client profiles: draft ClientProfile is auto-created for client accounts missing onboarding, so every client gets the same full profile UI
- Legacy `/dashboard/admin/clients` redirects to Fleet & Personnel client roster

---

## [0.27.23] — 2026-07-27

### Added

- Admin client profile: preferences editing, suspend/reactivate login, jobs/bookings/disputes/messages/reviews sections, and ops deep-links
- Client member stats: jobs, bookings, messages, open disputes, reviews

### Changed

- Member profile layout matches Fleet & Personnel ops look (warm hero, bracket panels, gold accent stats)

---

## [0.27.22] — 2026-07-27

### Added

- Unified Fleet & Personnel action: **Open profile** for all members (pilots and clients)
- Full **client profile** page with inline edit (contact, company, phone, billing, status)
- Pilot profile: assign **wings & badges** inline; links to certificates and badge catalog
- Client roster filter (`?role=client`) and **All clients** directory filter

### Changed

- Roster no longer mixes PROFILE / VIEW / EDIT — all management happens on the profile page
- Account modal renamed to **Account settings** (email, login status, moderation)

---

## [0.27.21] — 2026-07-27

### Added

- Admin pilot profile page on Fleet & Personnel: full read view, inline edit, approve/reject, commission link
- Pilot roster mode (`?role=pilot`): updated copy, PROFILE action, back-navigation to pilot list

### Changed

- Users with edit permission can use roster EDIT (not Super Admin only)
- Pilot profile API supports license, location, rates, bio, and service radius updates

---

## [0.27.20] — 2026-07-27

### Changed

- Platform Settings “See All Pilots” opens Fleet & Personnel (`/dashboard/admin/users?role=pilot`) with pilot filter and VIEW profile links
- Legacy `/dashboard/admin/pilots` redirects to the personnel directory; ops dashboard pilot approvals link to member profiles

---

## [0.27.19] — 2026-07-27

### Added

- Admin Platform Settings: editable default commission, all six grade rates (A-1–A-6), and manage rules
- Per-grade commission rates apply to pilot payouts (after per-pilot override)

### Changed

- Legacy A-4+ commission row migrates to A-4; missing A-5/A-6 rows backfilled on load
- Subscriptions portal links to Platform Settings for commission editing

---

## [0.27.18] — 2026-07-27

### Fixed

- Certificate PDF: externalize `pdfkit` for Next.js and stop using built-in Helvetica (fixes missing `Helvetica.afm` on download)

---

## [0.27.17] — 2026-07-27

### Fixed

- Certificate PDF download: pass image `format` to PDFKit when background is a Buffer (fixes Vercel/production downloads)
- Background loader tries multiple app URLs; API returns the real error message instead of a generic failure

---

## [0.27.16] — 2026-07-27

### Fixed

- Certificate PDF downloads use the exact template artwork (not a generic text layout)
- Assigned pilot appears immediately in Issued certificates with name and email
- Manual issue preview reflects the selected pilot before PDF generation

---

## [0.27.15] — 2026-07-27

### Fixed

- Admin badges: swapped **Common** / **Uncommon** titles for Recreational Aviator Gold and Remote Aviation Crew Silver (icons unchanged)
- Certificate manual issue: template-aware fields (member #, award/issue date, grade) per certificate layout
- Issued certificates list always visible with empty state; pilot name/email shown on each row; instant update after issue
- PDF download always renders the **exact fillable template** (background PNG + overlays), including on Vercel; no generic fallback when a template exists
- Manual issue preview shows selected pilot on the certificate before issuing

---

### Added

- Public `/jobs` and `/jobs/[id]` pages with Google Jobs `JobPosting` JSON-LD for approved open missions
- Uniform shop eligibility: min grade, exact grade (epaulettes), and required wing code
- Admin Fleet & Personnel edit modal: email, account status, profile fields, moderation note, pending_review holds
- Admin member detail view (`/dashboard/admin/users/[id]`) for pilots and clients
- Pricing/membership cards use new grade icons (`pricing-rank-a1`–`a6`)

### Changed

- Membership pricing copy: annual recurring (not monthly) in admin stats and plan cards
- Client profile status includes `pending_review` for ToS holds
- Fleet & Personnel roster shows pilots/clients only (management users excluded)

### Schema

- `User.moderationNote`
- `UniformProduct.minTierCode`, `exactTierCode`, `requiredWingCode` (v40)

---

## [0.27.13] — 2026-07-23

### Added

- Client certificate fonts embedded (Engravers MT, Harrowgate, Colchester) for preview + PDF
- Certificate auto-issue rules (grade A-1–A-5, Captain A-6, recreational/aviator wings, senior/master perfect contracts)
- Builder: field checklist, named font picker, assign-mode selector
- `evaluatePilotAwards()` runs wings then certificates on status changes

### Changed

- Canonical templates reduced to six fillable RAS forms (examples no longer seeded as active)
- Overlay fonts use named client faces instead of generic blackletter/serif/sans roles
- Member number on wings certificates uses pilot license number
- Builder preview matches issued PDF (shared layout/fonts/scale; no legacy text canvas)
- Editor slimmed: removed PDF body-template UI; save persists effective overlay fields
- Overlay overrides are authoritative (unchecked fields no longer appear on PDF)

### Schema

- `CertificateTemplate.autoRule`, `ruleParam`, `threshold` (v39)

---

## [0.27.12] — 2026-07-22

### Added

- Uniform shop product gallery: up to 6 images per product with admin upload API
- Variable products: size, color, SKU, price, and stock per variant in admin modal
- Pilot shop image gallery thumbnails and size/color selectors on multi-variant products

### Changed

- Admin product create/update sends `imageUrls` and full `variants` array in one request
- `UniformProductImage` model (schema v38) stores ordered gallery images per product

---

## [0.27.11] — 2026-07-22

### Added

- All 10 client certificate PNGs (6 fillable issuable + 4 reference examples)
- Professional overlay editor: center H/V, font size, align, max width, font style
- Snap-to-center guides when dragging fields on certificate artwork

### Changed

- Fillable templates use official `-fillable.png` artwork from client folder
- Example certificates shown as inactive reference templates in admin grid

---

## [0.27.10] — 2026-07-22

### Added

- Certificate builder: drag name, grade, date, and other overlay fields to align with PNG artwork
- Saved overlay positions apply to live preview and issued PDFs

---

## [0.27.9] — 2026-07-22

### Added

- Certificate builder: upload custom PNG/JPEG/WebP artwork and create custom certificate templates
- Admin certificate cards show thumbnail previews of the official RAS fillable PNGs
- Auto-seed/upsert of all six client-provided certificate templates on Certificates page load

### Changed

- Certificate builder restyled for PNG-based artwork preview (paper frame + wider modal)
- “NEW CUSTOM CERTIFICATE” CTA for creating uploaded/custom templates

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

## [0.27.1] — 2026-07-15

### Changed

- **Global dashboard visual consistency pass** — dashboards inherit marketing brand tokens
  - `--dashboard-card-border` → marketing gold-subtle
  - Shared `--brand-*` aliases + form/table/badge/button unification in `dashboard-theme.css`
  - Hardcoded cream borders in dashboard CSS modules replaced with tokens
  - Status badges / filter pills aligned (no SaaS blue)

### Docs

- `docs/dashboard-implementation-log.md` — Global Dashboard Visual Consistency Pass
- `docs/BUILD_CONTROL.md` — M330–M332

---

## [0.27.0] — 2026-07-15

### Added

- **Milestone 2 completion — Admin & Moderator**
  - `ModeratorPermissionAuditLog` append-only history on Super Admin permission saves
  - Staff Permissions polish: Admin + Moderator list, toggle switches, Add Admin/Moderator modal styles
  - Seed/management user: `ops@dronepilot.local` Admin role alongside Super Admin + Moderator

### Changed

- Shop / certificate / badge admin KPIs return real zeros (no fake empty-state numbers)
- Dispute center stats no longer invent avg resolution / satisfaction when data is missing
- Removed dead `moderator-permissions-store.ts`
- Docs: `PLATFORM_MILESTONE_PLAN` + `FUNCTIONALITY_WIRING_PLAN` admin modules marked WIRED
- Milestone 2 status → `complete` (active milestone remains 2 until Pilot unlock)

### Docs

- `docs/PLATFORM_MILESTONE_PLAN.md`
- `docs/FUNCTIONALITY_WIRING_PLAN.md`

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

### Changed

- Ops dashboard **Platform Growth** chart: hover/click weeks for tooltips, toggle series via legend, clickable week labels (same visual design).
- Ops dashboard **System Integrity**: was static preview copy; now live DB probe latency, operational error rate (cancelled bookings + open disputes / 30-day activity), dynamic status subtitle + strip. Metrics are clickable for detail.
- **Badges & Wings** (client Milestone 2 review): silver before gold — Remote Aviation Crew (Silver) then Recreational Aviator (Gold); Basic Silver then Basic Gold. Senior copy: 500 hours OR five perfect-rating contracts. Master copy: 1,000 hours OR ten perfect-rating contracts.

### Fixed

- Admin **CMS** article/resource management pages (`/dashboard/admin/cms/articles*`, `/dashboard/admin/cms/resources*`) were hard-gated to `super_admin` only, contradicting the CMS overview page, the CMS APIs, the sidebar nav, and the `cmsArticles`/`cmsResources` permission modules. Admins/moderators with CMS access saw the CMS section and "Manage" buttons but were bounced to the dashboard on click. Now gated by the permission map (via `ModeratorRouteGuard`) like the rest of the admin surface.
- Admin **Subscriptions** edit/features popups: layout broken by unscoped hero button flex + whole-dialog scroll. Now body-portal, sticky head/foot, scrollable body; theme modal selectors tightened; regression tests added.

### Verified (Phase 2 — Admin / Moderator / Super Admin)

- Ran a live role-based smoke test (`scripts/phase2-smoke.mjs`) authenticating as `super_admin`, `admin`, and `moderator` against all 27 admin pages and 31 admin GET APIs.
- All pages render and all data APIs return 200 for the appropriate roles. Remaining non-200s are correct-by-design: `permissions` + `configuration`/`regions` are Super-Admin-only (the "full" preset disables the `configuration` module and the nav hides those items); `reviews` is an intentionally removed route with no nav link; `management-users` GET is 405 (POST-only route).
- Mutation guards verified: admin/moderator receive 403 from Super-Admin-only endpoints; permission enforcement (`requireAdminPermission` / `requireAdminModuleView`) is active on admin routes.

### Added

- **Client certificate PNG templates** (Milestone 2 review): six official RAS fillable certificates under `public/certificates/` (Promotion A-1–A-5, Captain Promotion, Recreational Pilot Wings, Aviator Wings, Senior, Master). `CertificateTemplate` now has `backgroundImageUrl` + `layoutKey`; admin live preview overlays name/grade/date/number on the PNG; issued PDFs draw the same artwork via PDFKit. Promotion/Captain issue requires a grade/rank field (`awardGrade` on `PilotCertificate`). Staff-designed defaults retired (inactive). Schema version 36.
- **Custom Pilot Rates** (Configuration → Fees & Commission) is now a working per-pilot commission override, replacing the static James-Sterling preview. Super Admins can search real pilots (name/email) via a live dropdown, toggle Manual Override, set a custom commission rate (%), reason, and effective date, and save. Overrides persist on `PilotProfile` (`commissionOverride*` fields) and are applied at payout via `getEffectiveCommissionRateForPilot` in `recordPaymentForCompletedBooking` (override → else persisted platform default → else 15%). New lib `src/lib/admin/pilot-rates.ts` + `GET/PATCH /api/admin/configuration/pilot-rates` (view-gated search/detail, `manageSettings`-gated save) + `AdminCustomPilotRates` client component. (Schema version 35.)
- CMS **media uploads**: article featured images and resource featured images / downloadable files can now be uploaded directly from the editors (PNG/JPEG/WebP/GIF/SVG for images, plus PDF for resource files). Files are stored under `public/cms/` and served as static assets. New `POST /api/admin/cms/upload` (permission-gated by `cmsArticles`/`cmsResources` create/edit) + shared `AdminCmsMediaField` control with inline preview. Mirrors the existing wing image upload pattern. Replaces the URL-only "upload storage pending" fields.
- Uniform Shop **All Orders** page (`/dashboard/admin/shop/orders`): full order history with status-count filter tabs, per-order item breakdown/totals, and inline status + payment updates (gated by `shop.updateOrderStatus`). Replaces the dead "VIEW ALL" button, which now links here.
- Badge/Wing **manual assignment note** is now persisted with the award (stored in `PilotWing.metadata`) instead of being preview-only.
- Badges & Wings **award condition catalog** (membership grade, active membership, bids count, average rating, verification counts, certificate template slug, etc.) with typed create/edit UI; engine + membership/bid hooks; certificate template slug guidance for wing rules.
- Uniform Shop product create/edit **WooCommerce-style** editor (title, description, Product data tabs, Publish / image / category sidebar).
- Reports & Analytics interactivity (stat select, chart hover/legend toggle, category select, expandable segmentation) without redesigning the page chrome.

### Planned
- M18 Waitlist backend
- M20 Launch prep
