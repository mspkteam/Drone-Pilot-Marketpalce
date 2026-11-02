# TESTING_ANALYSIS.md — Drone Pilot Marketplace QA Analysis

**Application:** Drone Pilot Marketplace (Remote Air Service)  
**Live URL:** https://drone-pilot-marketpalce.vercel.app/  
**Repository:** https://github.com/mspkteam/Drone-Pilot-Marketpalce  
**App version analyzed:** `0.27.110`  
**Analysis date:** 2026-11-02 (Asia/Karachi)  
**Scope:** Application analysis only — no test implementation, no application code changes.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Technology stack](#2-technology-stack)
3. [Application routes and pages](#3-application-routes-and-pages)
4. [Client, Pilot, and Admin modules](#4-client-pilot-and-admin-modules)
5. [Authentication and authorization](#5-authentication-and-authorization)
6. [Forms and validation rules](#6-forms-and-validation-rules)
7. [CRUD operations matrix](#7-crud-operations-matrix)
8. [API endpoints and backend integrations](#8-api-endpoints-and-backend-integrations)
9. [File uploads and document verification](#9-file-uploads-and-document-verification)
10. [Payment and subscription workflows](#10-payment-and-subscription-workflows)
11. [Important user journeys](#11-important-user-journeys)
12. [Module-by-module QA catalog](#12-module-by-module-qa-catalog)
13. [Shared test data catalog](#13-shared-test-data-catalog)
14. [Out of scope / blocked for automation](#14-out-of-scope--blocked-for-automation)
15. [Recommended next steps (analysis only)](#15-recommended-next-steps-analysis-only)

---

## 1. Executive summary

This is a **Next.js App Router** marketplace connecting licensed drone pilots with clients. Core product behavior is:

**Client posts job → Admin approves → Grade-based visibility → Pilot proposes → Client reviews / initiates chat → Revision (+20% cap) → Booking → Delivery → Approve → Internal payout minus 15% → Reviews / awards.**

Roles under test: **Guest, Client, Pilot (A-1–A-10), Moderator, Admin, Super Admin**.

Auth is **Auth.js (NextAuth v5) Credentials + JWT**. Persistence is **Prisma** against **Neon PostgreSQL** (or local SQLite via `USE_LOCAL_DB=1`). File storage uses **Vercel Blob** (or local fallback). Stripe / escrow / production SMTP are **stubbed or deferred** — payments use demo/internal providers.

Existing automated coverage today is primarily **Node `tsx --test` unit tests** under `src/lib/**/*.test.ts`, plus smoke scripts under `scripts/`. Playwright is a **devDependency** but end-to-end suites are not the primary shipped suite yet. This document is the foundation for future E2E / API / regression automation.

---

## 2. Technology stack

| Layer | Technology | Notes for QA |
|-------|------------|--------------|
| Frontend framework | **Next.js 16.2.6** (App Router) | Server + client components; route groups `(marketing)`, `(auth)` |
| UI library | **React 19.2.4** | Client forms, dashboards, modals |
| Styling | **Tailwind CSS 4** + `globals.css` tokens | Dark aviation theme (black / white / gold) |
| Language | **TypeScript 5** | Strict app + API types under `src/types/` |
| Auth | **next-auth 5.0.0-beta** (Auth.js) | Credentials provider; JWT 30 days |
| Password hashing | **bcryptjs** (12 rounds) | Register + password change |
| ORM / DB | **Prisma 7.8** + Neon Postgres or Better SQLite | Schema: `prisma/schema.prisma` |
| File storage | **@vercel/blob** (+ local fallback) | Public vs private buckets |
| Email | **nodemailer** | Verification / contact; fails closed without SMTP for real domains |
| PDF | **pdfkit** | Certificates |
| Icons | **lucide-react** | UI only |
| Hosting | **Vercel** | Production branch deploy pattern |
| Unit test runner | **tsx --test** | `npm run test` / `npm run test:qa` |
| E2E tooling available | **Playwright** (devDependency) | Present; not yet primary suite |
| Seed / QA helpers | `prisma/seed.ts`, `scripts/create-qa-users.ts`, smoke scripts | Demo password `Demo123!` |

**Project layout (high level):**

```
src/app/          # Pages + API routes
src/components/   # UI (auth, dashboards, marketing, forms)
src/lib/          # Business rules per domain
src/types/        # Shared types / statuses
prisma/           # schema + seed
docs/             # Module docs M03–M27, business rules
scripts/          # Seed, smoke, QA helpers
```

---

## 3. Application routes and pages

Canonical dashboards live under `/dashboard/{role}/*`. Top-level `/admin`, `/pilot`, `/client`, `/moderator` are **redirect aliases**.

### 3.1 Marketing (public)

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/for-clients`, `/for-pilots` | Role marketing |
| `/pricing`, `/how-it-works`, `/about`, `/contact` | Product education / contact |
| `/jobs`, `/jobs/[id]` | Public job browse / detail |
| `/pilots`, `/pilots/[id]` | Public pilot directory / profile |
| `/resources`, `/resources/[slug]` | CMS resources |
| `/reputation`, `/safety`, `/captains-club` | Brand / policy pages |
| `/privacy`, `/terms`, `/cookies` | Legal |
| `/launch` | Waitlist landing variant |

### 3.2 Auth

| Route | Purpose |
|-------|---------|
| `/login` | Credentials sign-in |
| `/register` | Client/Pilot signup (email, password, role) |
| `/verify-email` | Email verification result / instructions |
| `/waitlist` | Pre-launch waitlist capture |

### 3.3 Client dashboard (`/dashboard/client`)

| Route | Purpose |
|-------|---------|
| `/` | Client home |
| `/onboarding` | Required profile completion |
| `/profile`, `/settings` | Profile + account settings |
| `/jobs`, `/jobs/new`, `/jobs/[id]`, `/jobs/[id]/offers` | Job CRUD, submit, review offers |
| `/quotes` | Quote / proposal inbox views |
| `/find-pilots`, `/find-pilots/[id]` | Hire / browse pilots |
| `/bookings`, `/bookings/[id]` | Booking lifecycle + delivery review |
| `/messages`, `/messages/[id]` | Client-initiated messaging |
| `/payments`, `/reviews` | Ledger + ratings |
| `/disputes`, `/disputes/[id]` | Formal disputes |

### 3.4 Pilot dashboard (`/dashboard/pilot`)

| Route | Purpose |
|-------|---------|
| `/` | Pilot home |
| `/onboarding` | Required onboarding |
| `/profile`, `/portfolio`, `/settings` | Profile, gallery, account |
| `/jobs`, `/jobs/[id]`, `/jobs/[id]/proposal`, `/locked-jobs` | Marketplace + proposals + locked by grade |
| `/applications`, `/proposals`, `/proposals/[id]` | Bid management |
| `/bookings`, `/bookings/[id]`, `/contracts` | Fulfillment |
| `/messages`, `/messages/[id]` | Reply in client-started threads |
| `/payments`, `/reviews`, `/disputes`, `/disputes/[id]` | Payouts, ratings, disputes |
| `/subscription` | Membership + Fast Forward + instructor add-on |
| `/achievements`, `/certificates` | Wings / certificates |
| `/verifications`, `/verifications/request-wings` | Docs + wing requests |
| `/instructor`, `/students` | Instructor add-on tools |
| `/shop`, `/shop/orders`, `/shop/orders/[id]` | Uniform shop |
| `/support`, `/support/articles/[slug]` | Support chat + help articles |

### 3.5 Admin dashboard (`/dashboard/admin`)

| Route | Min role (typical) | Purpose |
|-------|--------------------|---------|
| `/` | Moderator+ | Ops home / stats |
| `/users`, `/users/[id]`, `/pilots`, `/clients` | Moderator+ / Super Admin for destructive | Member management |
| `/jobs`, `/jobs/[id]`, `/applications`, `/bookings` | Moderator+ | Marketplace ops |
| `/verifications` | Moderator+ | Document review |
| `/messages`, `/messages/[id]` | Moderator+ (read-only composer) | Thread tracking |
| `/support`, `/support/[id]` | Moderator+ | Support inbox |
| `/disputes`, `/disputes/[id]`, `/squadron-voting` | Moderator+ | Dispute center |
| `/payments`, `/subscriptions` | Moderator+ / Super Admin | Ledger + memberships |
| `/certificates`, `/achievements` | Moderator+ / Super Admin | Cert + wings engines |
| `/shop`, `/shop/orders` | Moderator+ | Uniform catalog / orders |
| `/cms`, `/cms/articles/*`, `/cms/resources/*` | Moderator+ | Content |
| `/reviews`, `/waitlist`, `/regions`, `/reports` | Moderator+ | Moderation / geo / reporting |
| `/permissions` | **Super Admin only** | Moderator ACL maps |
| `/settings` | Super Admin / elevated | Platform configuration |

### 3.6 Alias redirects (smoke-test these)

- `/admin/*` → `/dashboard/admin/*`
- `/pilot/*` → `/dashboard/pilot/*`
- `/client/profile` → `/dashboard/client/profile`
- `/moderator/*` → `/dashboard/admin/*`

---

## 4. Client, Pilot, and Admin modules

### 4.1 Client module

**Functionality:** Onboard, post jobs, hire/find pilots, review proposals, initiate chat, manage bookings/delivery approval, pay (demo ledger), review, dispute.

**Key libs:** `src/lib/client/`, `src/lib/jobs/`, `src/lib/applications/`, `src/lib/bookings/`, `src/lib/deliveries/`, `src/lib/messaging/`, `src/lib/disputes/`, `src/lib/reviews/`.

**Gates:** `requireClientSession`, `requireOnboardedClient`, onboarding redirect layout.

### 4.2 Pilot module

**Functionality:** Onboard, membership enroll/upgrade, verification uploads, browse grade-gated jobs, propose/revise/withdraw, fulfill bookings + delivery, reply to messages, shop, instructor tools, certificates/wings.

**Key libs:** `src/lib/pilot/`, `src/lib/membership/`, `src/lib/subscriptions/`, `src/lib/verification/`, `src/lib/wings/`, `src/lib/certificates/`, `src/lib/shop/`, `src/lib/instructor/`.

**Gates:** `requirePilotSession`, `requirePilotEligibleToBid` (onboarded + approved + active membership + grade canApply).

### 4.3 Admin / Moderator / Super Admin module

**Functionality:** Approve/reject jobs and pilots, verify documents, override bookings, read marketplace messages, support chat, resolve disputes, manage subscriptions/shop/CMS/certificates/wings, configure rates, manage users and moderator permissions.

**Key libs:** `src/lib/admin/`, `src/lib/auth/moderator-permissions.ts`, `src/lib/auth/require-admin*.ts`.

**Gates:** `requireAdminSession`, `requireAdminPermission` / module maps, `requireSuperAdminSession` for permissions and some settings.

---

## 5. Authentication and authorization

### 5.1 Mechanisms

| Concern | Implementation |
|---------|----------------|
| Provider | Credentials (email + password) only |
| Session | JWT, `maxAge` 30 days; session carries `id` + `role` |
| Middleware | `src/middleware.ts` — dashboard role enforcement + marketing lock guard |
| Registerable roles | `client`, `pilot` only |
| Staff creation | Super Admin via management-users API (not public register) |
| Email verification | Token (SHA-256, 48h); auto-verify for non-deliverable domains (`.local`, `.test`, …) |
| Deactivation | Soft deactivate + **30-day reactivation** window |
| Password rules | ≥10 chars; upper, lower, digit, special |

### 5.2 Role matrix (test expectations)

| Role | Dashboard home | Cross-dashboard | Notes |
|------|----------------|-----------------|-------|
| Guest | — | Dashboard → `/login` | Marketing + auth only |
| Client | `/dashboard/client` | Pilot/Admin → redirect home | Onboarding required for posting |
| Pilot | `/dashboard/pilot` | Client/Admin → redirect home | Membership + grade gates on bidding |
| Moderator | `/dashboard/admin` | Permissions path blocked | Fine-grained ACL modules |
| Admin | `/dashboard/admin` | Same shell | Staff map |
| Super Admin | `/dashboard/admin` | Full access incl. `/permissions` | Always passes permission checks |

### 5.3 Authorization test scenarios (cross-cutting)

| Scenario | Expected |
|----------|----------|
| Unauthenticated `/dashboard/client` | Redirect to `/login` |
| Client opens `/dashboard/pilot` | Redirect to `/dashboard/client` |
| Pilot opens `/dashboard/admin` | Redirect to `/dashboard/pilot` |
| Moderator opens `/dashboard/admin/permissions` | Redirect to `/dashboard/admin` |
| API without session | `401` |
| Wrong role on role API | `403` |
| A-1 pilot POST application | Rejected (cannot bid) |
| Client POST `/api/pilot/*` | `403` |

---

## 6. Forms and validation rules

Validation is largely **manual helpers** (not Zod) in `src/lib/**/validation.ts` and domain modules.

### 6.1 Auth forms

| Form | Fields | Rules |
|------|--------|-------|
| Register | email, password, confirm (UI), role, optional inviteCode | Valid email; unique; password strength; role ∈ {client,pilot}; invite must exist if provided |
| Login | email, password | Valid email; non-empty password |
| Verify / resend | email or token | Token valid/unexpired; resend rate/availability depends on SMTP |
| Password change | current, new | Current must match; new same strength as register |
| Waitlist | email, roleInterest, name?, region?, source? + Turnstile | email required; roleInterest ∈ pilot\|client\|both; captcha required |
| Contact | fullName, email, subject, message, phone?, role? | Required fields; valid email |

### 6.2 Client forms

| Form | Key rules |
|------|-----------|
| Onboarding / profile | contactName ≥2; phone optional (`/^[\d\s+().-]{7,20}$/`); company + billing address fields; preferences |
| Post job | title ≥5; description ≥20; category allowlist; location required; budgetMin/Max ≥0 and min≤max; currency default USD |
| Job submit | Only from `draft`/`rejected` edit → `pending_approval` |
| Accept / reject / shortlist bid | Own job; application in valid state |
| Delivery review | Approve or request revision |
| Review | rating 1–5 int; comment optional (≥10 if present) |
| Dispute open / entry | Booking-eligible; evidence/comments per dispute rules |
| Start conversation | **Client initiates only** |

### 6.3 Pilot forms

| Form | Key rules |
|------|-----------|
| Onboarding / profile | displayName ≥2; city+country; ≥1 service; compliance acknowledgments; rates min≤max; radius ≥0 |
| Portfolio item | Media via upload API; title/caption constraints in UI |
| Proposal | amount >0; pricing breakdown (4 cost buckets); message 10–1000; duration; delivery date; ≥1 deliverable; operational plan + compliance required; accuracyConfirmed=true |
| Proposal revise | Increase ≤ **+20%** of original |
| Verification upload | type ∈ license\|insurance\|identity\|other; ≤5MB; pdf/jpeg/png/webp; one pending per type |
| Wing request | Docs ≤25MB same MIME family |
| Membership enroll/upgrade | planId; upgrades only increase sortOrder; difference fee |
| Instructor add-on | A-4+; $199.99/yr |
| Shop order | Non-empty cart; shipping name/line1/city/postal; stock + eligibility |

### 6.4 Admin forms

| Form | Key rules |
|------|-----------|
| Job approve/reject | Pending jobs; reject reason as applicable |
| Pilot approve/reject/grade | Profile statuses; A-7–A-10 Super Admin only |
| Verification approve/reject/amendments | Keep amendments in queue |
| User PATCH | Edit/suspend without exposing unrelated features |
| Shop product | name + description ≥10; ≥1 variant; positive price |
| CMS article/resource | draft/published/archived lifecycle |
| Certificate issue | Recipient name editable; template required |
| Configuration / pilot rates | Commission override + platform settings |
| Moderator permissions | Super Admin; presets full/limited/custom |

---

## 7. CRUD operations matrix

| Entity | Create | Read | Update | Delete / terminal |
|--------|--------|------|--------|-------------------|
| User | Register; admin management-users | Account / admin users | Password, deactivate/reactivate, admin PATCH | Admin DELETE; soft deactivate |
| ClientProfile | Onboarding POST | Own + admin | PATCH preferences/profile | Suspend via admin |
| PilotProfile | Onboarding POST | Own + public + admin | PATCH; admin approve/reject/grade | Suspend / reject |
| Job | Client POST | Owner / pilots (gated) / admin | Client PATCH draft/rejected; admin approve/reject | cancelled / closed |
| Application | Pilot POST (+ draft PUT) | Pilot / client / admin | revise, shortlist, view, accept/reject | withdraw |
| Booking | Side-effect of accept | Parties + admin | Status transitions; admin override | completed / cancelled / disputed |
| Delivery | Pilot upload/submit | Parties | Client approve / revision | approved / rejected |
| Review | On completed booking | Parties + admin | Admin hide/flag | Reset-request flow |
| Verification | Pilot submit | Pilot + admin | Admin approve/reject/amend | Pilot delete pending |
| Wing / WingRequest | Award / request | Pilot + admin | Definitions CRUD | Delete award / reject request |
| Certificate | Admin issue | Pilot + admin download | Templates PATCH | Delete cert/template |
| Dispute | Open on booking | Parties + admin | Entries; review; resolve | resolved |
| Conversation / Message | Client start; both reply | Parties; admin read-only | Read/unread | No delete API |
| Subscription | Pilot enroll | Pilot + admin | Upgrade / admin PATCH | Cancel |
| Shop Product / Order | Admin product; pilot order | Pilot catalog; admin | Order status; demo pay | Soft deactivate / cancel |
| CMS | Admin | Admin + public pages | PATCH | DELETE |
| Notification | System | User list | Mark read | No hard delete |
| Support Chat | User open | User + admin | Messages / close | closed |
| Waitlist | Public POST | Admin GET | unsubscribe status | — |
| Region | Admin | Admin | PATCH | DELETE |

---

## 8. API endpoints and backend integrations

**~176** `route.ts` handlers under `src/app/api`.

### 8.1 Domain groups

| Domain | Base paths | Integration notes |
|--------|------------|-------------------|
| Auth | `/api/auth/*` | Auth.js + register/verify/resend |
| Account | `/api/account/*` | Password, deactivate, invite |
| Client | `/api/client/*` | Jobs, bookings, delivery, reviews, disputes, conversations, payments, profile |
| Pilot | `/api/pilot/*` | Profile, jobs/applications, bookings, delivery, subscription, verification, wings, certificates, shop, instructor, conversations |
| Admin | `/api/admin/*` | Full ops surface + engines |
| Uploads | `/api/uploads/image` | Public user images |
| Notifications | `/api/notifications/*` | In-app |
| Messages | `/api/messages/unread-count` | Badge |
| Support | `/api/support/*` | Support chat + private files |
| Waitlist | `/api/waitlist` | + Turnstile; optional Google Sheets sync |
| Contact | `/api/contact` | Transactional email |

### 8.2 External / infra integrations (test implications)

| Integration | Status | QA implication |
|-------------|--------|----------------|
| Neon Postgres | Production DB | Use staging/seed DB for automation |
| Vercel Blob | Production uploads | Without token, local/public fallback; prod fails closed |
| Nodemailer / SMTP | Optional | Real email domains need SMTP; `.local` auto-verifies |
| Cloudflare Turnstile | Waitlist | Captcha required for waitlist POSTs |
| Google Sheets | Waitlist backfill script | Optional sync |
| Stripe / Connect / Escrow | **Not implemented** | Demo pay / internal ledger only |
| Auth secret | Required | Missing secret weakens middleware enforcement |

---

## 9. File uploads and document verification

| Upload kind | Max size | Allowed types | Storage | Primary routes |
|-------------|----------|---------------|---------|----------------|
| User images (avatar, logo, portfolio, job-ref, message) | 10 MB | PNG/JPEG/WebP/GIF (+ PDF for job-ref/message) | Public | `POST /api/uploads/image` |
| Verification docs | **5 MB** | PDF/JPEG/PNG/WebP | Private | `/api/pilot/verifications`, admin document |
| Wing request docs | **25 MB** | PDF/JPEG/PNG/WebP | Private | `/api/pilot/wing-requests/documents` |
| Wing definition art | 2 MB | PNG/JPEG/WebP/SVG | Public | Admin wing-definitions upload |
| Certificate backgrounds | 8 MB | PNG/JPEG/WebP | Public | Admin certificate-templates upload |
| Issued certificate PDF | generated | PDF | Private | Download routes |
| Delivery files | **50 MB**, max **10** items | PDF/JPEG/PNG/WebP/MP4/ZIP | Private | Pilot/client delivery APIs |
| Support attachments | 5 MB, max 5 | JPEG/PNG/WebP/PDF | Private | Support chat |
| Shop product images | 5 MB, max 6/product | Images | Public | Admin shop upload |
| CMS media | Image 3 MB / file 15 MB | Images (+SVG); files +PDF | Public | Admin CMS upload |

### Verification workflow (test focus)

1. Pilot submits type + file (or URL) → `pending`
2. Admin approves / rejects / **amendments_required** (must remain in queue)
3. Pilot may delete **pending** only
4. Admin can download private document
5. Membership lapse → verification benefits inactive (business rule)

---

## 10. Payment and subscription workflows

### 10.1 Commission (implemented in-app)

- Default **15%** (`DEFAULT_COMMISSION_RATE = 0.15`)
- On booking → `completed`: internal `Payment` (`provider: "internal"`, `succeeded`) + `Commission` (`calculated`)
- Pilot net = gross − commission
- Per-pilot override via admin configuration / rates (where wired)

### 10.2 Membership / Fast Forward (demo internal — no Stripe charge)

| Item | Value |
|------|-------|
| Base annual membership | **$99.99** (all pilots) |
| Fast Forward one-time | A-1 $0 · A-2 $49.99 · A-3 $69.99 · A-4 $89.99 · A-5 $109.99 · A-6 $129.99 |
| Signup total | 99.99 + Fast Forward fee |
| Later upgrade | **difference only** (new FF − prior FF paid) |
| Instructor add-on | **$199.99/year**, min A-4 |
| Student instructor discount | **20% off base membership only** |
| Visibility delays | 48 / 36 / 24 / 12 / 6 / 0 hours |
| A-1 bidding | **Forbidden** |
| A-7–A-10 | Super Admin invite only; $0; marketplace same as A-6; no certificates |
| Provider id | `demo_internal` |

### 10.3 Shop payments

- Order `pending_payment` → pilot `POST …/pay` demo → paid
- Flat shipping **$12**
- Eligibility by `minTierCode` / `exactTierCode` / `requiredWingCode`

### 10.4 Explicitly not testable as real money yet

- Stripe card capture, invoices PDF from Stripe, Connect payouts, escrow hold/release

---

## 11. Important user journeys

These journeys should become end-to-end smoke and regression suites.

### J1 — Guest → Register → Verify → Onboard (Client)

1. Open `/register`, choose Client  
2. Submit valid email/password  
3. Verify email (or use `.local` auto-verify)  
4. Login → redirected to client dashboard / onboarding  
5. Complete onboarding → dashboard unlocked  

### J2 — Guest → Register → Onboard → Membership (Pilot)

1. Register as Pilot  
2. Complete onboarding + compliance  
3. Enroll A-1 ($99.99 demo) or Fast Forward to higher grade  
4. Submit verification docs  
5. Admin approves profile + docs  

### J3 — Happy path marketplace (core revenue path)

1. Client creates + submits job  
2. Admin approves job (`approvedAt` set)  
3. Wait/simulate visibility delay for pilot grade  
4. Eligible pilot (A-2+) submits proposal  
5. Client shortlists / views / starts chat  
6. Optional revise (≤ +20%)  
7. Client accepts → Booking `pending`  
8. Client confirms → Pilot starts → Delivery submit  
9. Client approves delivery → complete  
10. Internal payment + 15% commission recorded  
11. Both parties leave reviews  

### J4 — A-1 / grade gating

1. As A-1, see job only after 48h  
2. Attempt bid → blocked  
3. Upgrade to A-2 (difference fee) → bid allowed after 36h rule  

### J5 — Delivery revision + complete

1. Pilot submits delivery  
2. Client requests revision  
3. Pilot resubmits  
4. Client approves → complete job  

### J6 — Dispute path

1. Open dispute on eligible booking  
2. Parties add entries/evidence  
3. Admin review → resolve (`full_payout` / `partial_payout` / `refund`)  
4. Confirm ratings/awards blocked until resolved  

### J7 — Verification amendments

1. Pilot uploads license  
2. Admin requests amendments (stays in queue)  
3. Pilot re-uploads / responds  
4. Admin approves  

### J8 — Uniform shop

1. Eligible pilot adds variants to cart  
2. Checkout with shipping  
3. Demo pay  
4. Admin advances order status  

### J9 — Support vs Messages vs Disputes isolation

1. Client–pilot thread: admin read-only (no staff composer)  
2. Support chat: staff can reply  
3. Dispute: formal workflow separate from both  

### J10 — Account deactivate / reactivate

1. Deactivate account  
2. Attempt login outside rules → fail  
3. Reactivate within 30 days → grade retained (pilots)  

---

## 12. Module-by-module QA catalog

For each module below: **Functionality · Test scenarios · Positive · Negative · Expected results · Required test data**.

---

### M-AUTH — Authentication & registration

**Functionality:** Register (client/pilot), login, logout, email verification, resend, password change, session persistence, registration gate flag.

**Test scenarios**

1. Register valid client/pilot  
2. Register duplicate email  
3. Weak password rejection  
4. Login success / wrong password / unverified email  
5. Verify token success / expired / reused  
6. Authenticated user hitting `/login` or `/register` redirects to role home  
7. Registration disabled via env flag  

**Positive**

- Valid register → user created `active`, verification started (or auto-verified for `.local`)  
- Valid login → JWT session; land on correct dashboard  
- Password change with correct current → subsequent login works with new password  

**Negative**

- Role `admin` on register → rejected  
- Password without special char → validation error  
- Login with deactivated account outside reactivation → rejected  
- Invalid verify token → `/verify-email?error=…`  

**Expected results**

- HTTP 201/200 on success; field-level errors on failure  
- Session cookie present after login  
- Cross-role dashboards inaccessible  

**Required test data**

| Field | Example |
|-------|---------|
| Client email | `qa.client.+ts@example.test` or seeded `client@dronepilot.local` |
| Pilot email | `qa.pilot.+ts@example.test` / `pilot@dronepilot.local` |
| Password | `Demo123!` (meets rules) |
| Weak password | `password` |

---

### M-CLIENT-ONBOARD — Client onboarding & profile

**Functionality:** Force onboarding; edit profile (edit mode); billing address; preferences; logo upload.

**Test scenarios**

1. New client blocked from posting until onboarded  
2. Complete minimum onboarding  
3. Edit profile only after clicking Edit  
4. Invalid phone / empty contactName  

**Positive**

- contactName ≥2 + required fields → profile `active` / onboarded  
- Logo upload valid image → path saved  

**Negative**

- Skip onboarding and POST job → blocked  
- Phone `abc` → validation error  
- Oversized logo → rejected  

**Expected results**

- Onboarding redirect until complete  
- Field errors under inputs  

**Required test data**

- New client account  
- Valid PNG < 10MB; invalid EXE; 11MB PNG  

---

### M-PILOT-ONBOARD — Pilot onboarding & profile

**Functionality:** Display name, location, services, rates, compliance acknowledgments, portfolio, profile strength %, draft save.

**Test scenarios**

1. Complete onboarding with all acknowledgments  
2. Partial save draft  
3. Service chip single-select behavior  
4. Portfolio add/remove without wiping profile fields  
5. Profile progress % matches checklist  

**Positive**

- Valid onboarding → pending_review / approved path depending on seed/admin  
- Portfolio item appears with caption  

**Negative**

- Missing city/country → blocked  
- Unchecked compliance → blocked  
- Rate min > max → error  

**Expected results**

- First login shows complete-profile messaging with screens reachable  
- Draft save confirms location of draft  

**Required test data**

- Fresh pilot; services allowlist categories; sample portfolio image  

---

### M-JOBS — Client job posting & admin approval

**Functionality:** Multi-step post project, draft/edit, submit, admin approve/reject, public/pilot visibility after approval.

**Test scenarios**

1. Create draft with all steps  
2. Submit → `pending_approval`  
3. Admin approve → `approvedAt` set; becomes open/in_bidding  
4. Admin reject → client can edit and resubmit  
5. Guest sees marketing/public jobs only as allowed  

**Positive**

- title/description/category/location/budget valid → created  
- Approve notifies admins/pilots per rules  

**Negative**

- title 3 chars → error  
- budgetMin > budgetMax → error  
- Pilot trying to create job → 403  
- Edit approved job as client → denied  

**Expected results**

- Status transitions only along allowed edges  
- Date pickers show dd/mm/yyyy where UI requires  

**Required test data**

- Onboarded client; moderator/admin; job fixture categories from allowlist  

---

### M-MEMBERSHIP — Grades, visibility, Fast Forward

**Functionality:** Annual membership, Fast Forward upgrades (difference), instructor add-on, visibility delays, A-1 no-bid, honorary grades.

**Test scenarios**

1. Enroll A-1 → pay 99.99 demo  
2. Upgrade A-2→A-4 → charge difference only  
3. Visibility matrix for each grade  
4. A-1 Fast Forward button disabled appropriately  
5. Instructor add-on blocked below A-4  
6. Super Admin assigns A-7–A-10 (no fee)  

**Positive**

| Grade | Sees job after | Can bid |
|-------|----------------|---------|
| A-1 | 48h | No |
| A-2 | 36h | Yes |
| A-3 | 24h | Yes |
| A-4 | 12h | Yes |
| A-5 | 6h | Yes |
| A-6+ | 0h | Yes |

**Negative**

- Downgrade via self-serve → not allowed  
- Instructor on A-3 → rejected  
- Apply without active membership → rejected  

**Expected results**

- Locked jobs page lists delayed jobs  
- Pricing UI shows base + FF, not monthly tier subscriptions  

**Required test data**

- Seeded `pilot-a1` … `pilot-a7`, `pilot@` (A-6); controllable `approvedAt` timestamps  

---

### M-BIDDING — Proposals / applications

**Functionality:** Draft proposal, submit, withdraw, revise (+20%), client view/shortlist/reject/accept; quote types / budget cap rules.

**Test scenarios**

1. Full valid proposal submit  
2. Draft save and resume  
3. Revise within +20%  
4. Revise above +20%  
5. Accept creates booking and rejects other submitted bids  
6. A-1 submit attempt  

**Positive**

- Complete proposal with breakdown + compliance → `submitted`  
- Accept → booking `pending`; job `assigned`  

**Negative**

- Message <10 chars → error  
- accuracyConfirmed false → error  
- Missing deliverables → error  
- Second accept on same job → rejected  

**Expected results**

- Client offers page lists applications with actions  
- Pilot applications list shows status  

**Required test data**

- Approved open job; A-2+ eligible pilot; second pilot for multi-bid  

---

### M-MESSAGING — Client/pilot messages

**Functionality:** Client starts conversation; both reply; unread counts; admin read-only tracking.

**Test scenarios**

1. Client initiates from offer/pilot profile  
2. Pilot replies  
3. Pilot attempts to start new client thread → blocked  
4. Admin opens thread → no composer  

**Positive**

- Message persisted; unread increments for recipient  

**Negative**

- Empty message → error  
- Cross-user access to foreign thread → 403  

**Expected results**

- Separate from Support Chat UI/nav  

**Required test data**

- Client + pilot with accepted or shortlisted relationship as product requires  

---

### M-BOOKINGS — Booking lifecycle & delivery

**Functionality:** Status transitions, delivery upload/submit, client approve/revision, completion side effects.

**Allowed transitions (assert strictly)**

| Actor | From | To |
|-------|------|-----|
| Client | pending | confirmed, cancelled |
| Client | confirmed | cancelled |
| Client | in_progress | completed, cancelled |
| Pilot | confirmed | in_progress, cancelled |
| Pilot | in_progress | cancelled (completion primarily via delivery/client path) |

**Test scenarios**

1. Full happy path to completed  
2. Illegal transition (pilot confirm)  
3. Delivery file type/size limits  
4. Revision request then approve  
5. Cancel paths  

**Positive**

- Confirm → start → deliver → approve → completed; job closed; payment+commission  

**Negative**

- 11th delivery file → rejected  
- 51MB file → rejected  
- Complete while `disputed` without resolution → blocked per rules  

**Expected results**

- Delivery download works for authorized parties only  

**Required test data**

- Accepted booking fixture; sample PDF/MP4/ZIP within limits  

---

### M-PAYMENTS-COMMISSION — Ledgers

**Functionality:** Client payment history; pilot payout ledger; admin payments; 15% commission on complete.

**Test scenarios**

1. Complete booking → Payment succeeded + Commission calculated  
2. Net amount = gross × 0.85 (default)  
3. Admin override rate (if configured) applies  

**Positive**

- Ledgers show matching gross/commission/net  

**Negative**

- Incomplete booking → no commission row  

**Expected results**

- CSV/table formatters consistent  

**Required test data**

- Booking with known `agreedAmount` (e.g. 1000 → commission 150 → net 850)  

---

### M-REVIEWS — Ratings

**Functionality:** Post-completion reviews; admin hide/flag; pilot reset-request for non-5★.

**Test scenarios**

1. Both parties review after complete  
2. Review before complete → blocked  
3. Rating 0 or 6 → blocked  
4. Admin flags review  
5. Dispute open → ratings blocked until resolved  

**Positive**

- rating 5 + optional long comment → published  

**Negative**

- Duplicate review → rejected  
- Comment length 1–9 → error  

**Required test data**

- Completed booking without existing reviews  

---

### M-VERIFICATION — Document verification

**Functionality:** Upload by type; admin approve/reject/amendments; private download; remove pending.

**Test scenarios**

1. Upload each type  
2. Duplicate pending same type → blocked  
3. Wrong MIME / oversize  
4. Amendments keeps queue + comments on cards  
5. Approve unlocks verification badge behaviors  

**Positive**

- Valid PDF 1MB license → pending → approved  

**Negative**

- 6MB file → error  
- `.exe` → error  
- Delete approved doc as pilot → denied  

**Required test data**

- PDF/JPEG/PNG/WebP samples; oversized sample; `pending-pilot@dronepilot.local`  

---

### M-WINGS-CERTS — Wings & certificates

**Functionality:** Auto/manual wings; wing requests; instructor awards; certificate templates; issue/download PDF; A-7–A-10 no certificates.

**Test scenarios**

1. Pilot requests aviator wing with docs  
2. Admin approve/reject  
3. Admin issues certificate with editable recipient name  
4. Pilot downloads PDF  
5. Honorary grade has no certificate issuance  

**Positive**

- Issued cert downloadable by pilot and admin  

**Negative**

- Unauthorized download → 403  
- Invalid template image type → upload error  

**Required test data**

- Wing definition; certificate template; eligible pilot  

---

### M-DISPUTES — Dispute resolution

**Functionality:** Open dispute; entries; admin review/resolve; squadron voting tooling; block ratings until resolved.

**Test scenarios**

1. Client opens dispute  
2. Pilot adds entry  
3. Admin resolves with each resolution type  
4. Squadron vote open/cast/close (admin tooling)  

**Positive**

- Status `open` → `under_review` → `resolved`  

**Negative**

- Open dispute on cancelled unrelated booking → denied  
- Non-party access → 403  

**Required test data**

- In-progress or completed booking; admin user  

---

### M-SHOP — Uniform shop

**Functionality:** Tier/wing gated catalog; cart; shipping; demo pay; admin products/variants/orders.

**Test scenarios**

1. Eligible product purchase  
2. Ineligible tier product hidden/blocked  
3. Out of stock  
4. Admin ship order  

**Positive**

- Order total = items + $12 shipping; pay → paid  

**Negative**

- Empty cart checkout → error  
- Missing postal code → error  

**Required test data**

- Seeded uniform catalog (`scripts/seed-uniform-catalog.ts`); A-4+ pilot for gated SKUs  

---

### M-SUPPORT — Support chat

**Functionality:** User opens chat; messages; typing; attachments; admin inbox; close.

**Test scenarios**

1. Pilot/client open support chat  
2. Admin replies  
3. Attachment limits  
4. Close chat  

**Positive**

- Thread visible both sides  

**Negative**

- 6th attachment → rejected  
- Messaging in closed chat → rejected  

**Required test data**

- Any authenticated non-guest; moderator with support permission  

---

### M-CMS-MARKETING — Marketing + CMS

**Functionality:** Public pages render; resources/articles from CMS; contact form; waitlist; hire CTAs by role.

**Test scenarios**

1. All marketing routes 200  
2. Hire a Captain CTA: guest→register; client→find pilots; hidden for pilots  
3. Contact valid/invalid  
4. Waitlist with/without Turnstile  
5. CMS publish appears on `/resources/[slug]`  

**Positive**

- Published resource reachable; draft not public  

**Negative**

- Waitlist without captcha → fail  
- Contact missing subject → fail  

**Required test data**

- CMS published article/resource; Turnstile test keys if configured  

---

### M-ADMIN-OPS — Admin operations & permissions

**Functionality:** Users, pilots, clients, jobs, bookings, payments, subscriptions, regions, reports, settings, moderator ACL.

**Test scenarios**

1. Moderator limited preset cannot access denied modules  
2. Super Admin creates moderator and sets custom map  
3. Approve/reject pilot; set grade A-1–A-6 vs A-7+  
4. Admin edit user (GET/PATCH)  
5. Alias routes redirect correctly  

**Positive**

- Permission map enforced on API and UI (`ModeratorRouteGuard`)  

**Negative**

- Moderator PATCH `/api/admin/permissions/*` → 403  
- Delete user without privilege → 403  

**Required test data**

- `admin@`, `ops@`, `moderator@` seed accounts; optional limited-permission moderator  

---

### M-ACCOUNT — Settings, invites, deactivate

**Functionality:** Settings pages; invite code copy/link; password; deactivate/reactivate.

**Test scenarios**

1. Copy invite code / link  
2. Register with valid invite  
3. Deactivate → login behavior  
4. Reactivate within 30 days retains grade  

**Positive**

- Invite redemption applied on register  

**Negative**

- Unknown inviteCode → register error  
- Reactivate after window → permanent loss path per rules  

**Required test data**

- User with inviteCode; clock control or DB `deactivatedAt` fixtures  

---

### M-NOTIFICATIONS — In-app notifications

**Functionality:** List, mark read, triggers (job submit, wing request, revision, welcome, etc.).

**Test scenarios**

1. Trigger job submit → admin notification  
2. Mark single/all read  
3. Unauthorized read of others’ notifications  

**Expected results**

- Unread badge updates; timezone display may be blocked on client (known)  

**Required test data**

- Actors for each trigger event  

---

### M-INSTRUCTOR — Instructor add-on

**Functionality:** Add-on purchase A-4+; student discount codes (20% off base membership); student links; wing awards tools.

**Test scenarios**

1. A-4 enrolls instructor  
2. Student applies code → 20% off $99.99 only (not FF)  
3. A-3 enroll attempt fails  
4. Invalid code field error under input  

**Required test data**

- A-4 instructor pilot; new student pilot; discount code fixture  

---

## 13. Shared test data catalog

### 13.1 Seeded demo accounts (password `Demo123!`)

| Email | Role / notes |
|-------|----------------|
| `client@dronepilot.local` | Client — Demo Productions LLC |
| `client-media@dronepilot.local` | Second client |
| `pilot@dronepilot.local` | Pilot A-6 Captain |
| `pilot-a1@dronepilot.local` … `pilot-a7@…` | Grade matrix |
| `pending-pilot@dronepilot.local` | `pending_review` profile |
| `moderator@dronepilot.local` | Moderator (full preset) |
| `ops@dronepilot.local` | Admin |
| `admin@dronepilot.local` | Super Admin |

`.local` emails **auto-verify** (no SMTP).

### 13.2 Suggested generated fixtures for automation

- Unique emails per run: `qa+{role}+{timestamp}@example.test`
- Job budgets: `1000/1500 USD` for commission asserts  
- Proposal amounts: `1200` then revise to `1440` (+20%) and `1441` (fail)  
- Files: small valid PDF/PNG; 6MB PNG (fail verification); empty file; wrong MIME  

### 13.3 Environment prerequisites for QA

| Variable / capability | Need |
|-----------------------|------|
| `AUTH_SECRET` | Required for real auth middleware |
| DB (Neon or `USE_LOCAL_DB=1`) | Seeded |
| `BLOB_READ_WRITE_TOKEN` | For upload tests in cloud-like env |
| SMTP | Only for real-domain verification tests |
| Turnstile keys | Waitlist negative/positive |
| `REGISTRATION_ENABLED` | Gate tests |

---

## 14. Out of scope / blocked for automation

From product rules and `docs/FINAL_TESTING_QA_CHECKLIST.md`:

| Area | Reason |
|------|--------|
| Stripe card billing / invoice PDF | Blocked — not implemented |
| Stripe Connect / escrow release | Out of scope until milestone |
| Production SMTP deliverability | Env-dependent; use `.local` for core auth |
| Geo/phone worldwide localization | Blocked on client |
| Support chat automation bots | Blocked on client |
| Shop product-specific artwork | Blocked on client assets |
| Notification timezone-by-region | Blocked on client |
| Remote Rescue / advanced Squadron Vote product rules | Future |
| Native mobile apps | Not in Phase 1 |

Automate **demo/internal** payment paths and clearly tag Stripe cases as `@blocked`.

---

## 15. Recommended next steps (analysis only)

No tests are implemented in this change. Suggested implementation order when QA automation starts:

1. **API contract suite** — auth, role 401/403, job/application/booking state machines  
2. **Playwright smoke** — J1, J2, J3 against seeded local DB  
3. **Grade matrix tests** — reuse/extend `src/lib/membership/*.test.ts` patterns for E2E visibility  
4. **Upload boundary tests** — verification 5MB, delivery 50MB, MIME allowlists  
5. **Admin ACL suite** — moderator presets vs Super Admin  
6. **Regression pack** from `FINAL_TESTING_QA_CHECKLIST.md` Done items (UI assertions)

**Non-goals of this document:** implementing Playwright specs, modifying application source, deleting/overwriting existing files.

---

## Appendix A — Status enums quick reference

| Domain | Values |
|--------|--------|
| User.status | `active`, `deactivated` |
| PilotProfile | `draft`, `pending_review`, `approved`, `rejected`, `suspended` |
| ClientProfile | `draft`, `active`, `pending_review`, `suspended` |
| Job | `draft`, `pending_approval`, `approved`, `rejected`, `open`, `in_bidding`, `assigned`, `closed`, `cancelled` |
| Application | `draft`, `submitted`, `withdrawn`, `accepted`, `rejected`, `expired` |
| Booking | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `disputed` |
| Delivery | `draft`, `submitted`, `approved`, `rejected` |
| Dispute | `open`, `under_review`, `resolved` |
| Verification | `pending`, `amendments_required`, `approved`, `rejected`, `expired` |
| Subscription | `trialing`, `active`, `past_due`, `cancelled`, `expired` |
| Payment | `pending`, `processing`, `succeeded`, `failed`, `refunded` |
| Commission | `calculated`, `invoiced`, `collected`, `waived` |
| Review | `published`, `hidden`, `flagged` |
| Shop order | `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled` |
| Support chat | `open`, `pending`, `resolved`, `closed` |
| Roles | `guest`, `client`, `pilot`, `moderator`, `admin`, `super_admin` |

---

## Appendix B — Source artifacts consulted

- `package.json`, `README.md`, `prisma/schema.prisma`, `prisma/seed.ts`
- `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/lib/auth/**`
- `src/app/**/page.tsx` (157 pages), `src/app/api/**/route.ts` (~176 routes)
- `src/lib/{membership,jobs,applications,bookings,verification,payments,subscriptions,shop,storage}/**`
- Docs: `SITEMAP.md`, `USER_ROLES_PERMISSIONS.md`, `IMPLEMENTATION_CONTEXT_FOR_NEW_FEATURES.md`, `FINAL_TESTING_QA_CHECKLIST.md`, `M03`–`M27` module docs, `DEVELOPMENT_ROADMAP.md`

---

*End of TESTING_ANALYSIS.md — analysis complete; ready for test design/implementation in a follow-up task.*
