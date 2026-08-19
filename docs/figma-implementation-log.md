# Figma Implementation Log

Screen-by-screen log for the Figma → code phase (ADR-009).  
Workflow: [`FIGMA_IMPLEMENTATION_WORKFLOW.md`](FIGMA_IMPLEMENTATION_WORKFLOW.md)

**Status values:** Pending Review | In Progress | Implemented | Blocked

---

## Summary

| Screens implemented | Missing modules logged | Last updated |
|--------------------|------------------------|--------------|
| 35 | 7 | 2026-08-19 |

---

#### Admin Squadron Voting (Peer Moderation)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-19 |
| **Figma frame** | `808:32708` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-32708 |
| **Route** | `/dashboard/admin/squadron-voting` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** `AdminSquadronVotingPortal`, `POST /api/admin/squadron-voting`, dispute send-to-vote modal  
**Notes:** Layout from Figma; site color tokens. Approve maps to client, reject to pilot. Open ballot from dispute detail. Close early writes majority recommendation.

---

#### Pilot Request Wings

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Figma frame** | `1229:6885` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1229-6885 |
| **Route** | `/dashboard/pilot/verifications/request-wings` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** verification shell tabs, admin verification queue, `grantWingToPilot`, private asset storage  
**Notes:** Layout from Figma; site color tokens. Conditional FTN/IACRA/certificate/hours/logbook fields. Admin review on `/dashboard/admin/verifications`. No Stripe.

---

#### Pilot Instructor Membership

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Figma frame** | `808:3626` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-3626 |
| **Route** | `/dashboard/pilot/instructor` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** `PilotInstructorDashboard`, `POST /api/pilot/subscription/instructor`, discount + wing-request APIs  
**Notes:** Layout from Figma; site color tokens. Activate add-on generates student code; instructors award Silver/Gold basic wings only. Stripe later.

---

#### Pilot Active Contracts

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Figma frame** | `808:19635` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-19635 |
| **Route** | `/dashboard/pilot/contracts` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** `PilotActiveContracts`, `PilotContractCard`, `GET /api/pilot/bookings`, `mapBookingToActiveContract`  
**Notes:** `OPERATIONS / CONTRACTS` bracket header; contract cards with value badge, deadline, Deliver Work / Message Client / Open Dispute. Layout from Figma; site color tokens.

---

#### Pilot Messages

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Figma frame** | `808:20108` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-20108 |
| **Route** | `/dashboard/pilot/messages` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** `PilotMessagesView`, client-messages panel styles, `GET/POST /api/pilot/conversations`  
**Notes:** `OPERATIONS / MESSAGES` header; chat header shows `RE: {jobTitle} · {contractId}`. Live threads unchanged.

---

#### Pilot Submit Proposal

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | `1171:4661` (container) / overlay `1171:5545` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1171-4661 |
| **Route** | `/dashboard/pilot/jobs/[id]/proposal` |
| **Status** | Implemented (UI + functionality pass) |

**Components reused:** `PilotSubmitProposalView`, `POST /api/pilot/jobs/[id]/applications`, live terms copy (`TERMS_INTRO` + `TermsLegalBody`)  
**Notes:** Layout from Figma; site color tokens. Job description/requirements and order summary from live job + post-project metadata. Submit Application validates then opens terms overlay (`1171:5545` dim + blur). Confirm & Submit posts the proposal. Shell Back/bell unchanged.

---

#### Pilot Settings

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | `808:23194` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-23194 |
| **Route** | `/dashboard/pilot/settings` |
| **Status** | Implemented (UI pass) |

**Components reused:** `PilotAccountSettings`, account/password APIs  
**Notes:** Layout from Figma; site color tokens. Title **Flight Officer Settings**. Danger Zone 30-day reactivation (not Stripe). Notification category toggles still deferred. Shell Back/bell unchanged.

---

#### Pilot Support & Help Center

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | `808:22755` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-22755 |
| **Route** | `/dashboard/pilot/support` |
| **Status** | Implemented (UI pass) |

**Components reused:** `PilotSupportHelpCenter`, help article seed, support chat widget  
**Notes:** Layout from Figma; site color tokens. Search + popular articles + Ground Control ticket + open tickets. Shell Back/bell unchanged.

---

#### Pilot Uniform & Insignia Shop

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | Uniform `808:22234` / Container `808:22235` |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-22235 |
| **Route** | `/dashboard/pilot/shop` |
| **Status** | Implemented (UI + catalog wiring) |

**Components reused:** `PilotUniformShop`, shop products/orders APIs  
**Notes:** Layout from Container `808:22235`; site color tokens. 3-col cards + CART aside; ineligible polo shown locked (`UNLOCKED AT A-6 CAPTAIN`); **+ ADD** / **Configure Polo**. Catalog seeded to Figma SKUs. Stripe later. Shell Back/bell unchanged.

---

#### Pilot Reviews — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | Main `808:23643` (parent reviews `808:23642`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-23643 |
| **Route** | `/dashboard/pilot/reviews` |
| **Status** | Implemented (UI pass) |

**Components reused:** `PilotReviewsView`, `GET /api/pilot/reviews`  
**Notes:** Layout from Figma; site color tokens. Summary + list + Review Dispute → contracts, Review Reset → support (no reset API). Shell Back/bell unchanged.

---

#### Pilot Portfolio / Flight Gallery — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | Main `808:21066` (parent Portfolio `808:21065`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-21066 |
| **Route** | `/dashboard/pilot/portfolio` |
| **Status** | Implemented (UI pass) |

**Components reused:** `PilotPortfolioView`, `GET/POST /api/pilot/portfolio`  
**Assets:** `public/icons/pilot-dashboard/portfolio-play.svg`  
**Notes:** Layout from Figma; site color tokens. Header + Add Item bar + 3-col cards (VIDEO play overlay / PHOTOSET). Shell Back/bell unchanged.

---

#### Pilot Earnings (no dedicated Figma frame)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | — (aligned to marketplace header chrome) |
| **Route** | `/dashboard/pilot/payments` |
| **Status** | Implemented (UI chrome) |

**Notes:** Eyebrow `BUSINESS / EARNINGS`; title **Earnings**. 15% commission copy. Stripe Connect later.

---

#### Pilot Verification (no dedicated Figma frame)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | — (aligned to marketplace header chrome) |
| **Route** | `/dashboard/pilot/verifications` |
| **Status** | Implemented (UI chrome) |

**Notes:** Eyebrow `PILOT / VERIFICATION`; existing catalog/upload flow. Shell Back/bell unchanged.

---

#### Pilot Profile — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Figma frame** | Main `808:19441` (parent Profile `808:19119`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-19441 |
| **Route** | `/dashboard/pilot/profile` |
| **Status** | Implemented (UI + functionality pass) |

**Components created:** —  
**Components reused:** `PilotProfileCompletionView`, `ProfileStrengthPanel`, `POST/PATCH /api/pilot/profile`, `/api/pilot/portfolio`  
**Notes:** Layout from Figma; site color tokens. Call sign / drones / payloads / extra chips / avatar persist in `profileExtrasJson`. Flight Gallery shows live `portfolioJson` items; `+` and Manage Flight Gallery go to `/dashboard/pilot/portfolio`. Shell Back/bell unchanged.

---

#### Pilot My Proposals — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-11 |
| **Figma frame** | Main `808:18982` (parent My Proposals `808:18659`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18982 |
| **Route** | `/dashboard/pilot/proposals` |
| **Status** | Implemented (UI pass) |

**Components created:** —  
**Components reused:** `PilotMyProposalsView`, `PilotProposalStatusBadge`, `GET /api/pilot/applications`  
**Notes:** Layout from Figma; site color tokens. Status tabs with counts; uppercase badges (SHORTLISTED for Revised tab). Shell Back/bell unchanged.

---

#### Pilot Locked Jobs — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-11 |
| **Figma frame** | Main `808:18477` (parent Locked Jobs `808:18154`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-18477 |
| **Route** | `/dashboard/pilot/locked-jobs` |
| **Status** | Implemented (UI pass) |

**Components created:** —  
**Components reused:** `PilotLockedJobsView`, `PilotLockedJobCardView`, `PilotCountdownTimer`, `GET /api/pilot/jobs`  
**Assets:** `public/icons/pilot-dashboard/locked-crown.svg`, `locked-lock.svg`  
**Notes:** Layout from Figma; site color tokens. Grade-visibility notice copy; live unlock countdown; CTA to membership. Shell Back/bell unchanged. `REQUIRES` row removed (not in Figma).

---

#### Pilot Mission Marketplace — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-11 |
| **Figma frame** | Main `808:17880` (parent Mission Marketplace `808:17557`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-17880 |
| **Route** | `/dashboard/pilot/jobs` |
| **Status** | Implemented (UI pass) |

**Components created:** —  
**Components reused:** `PilotMissionMarketplace`, `PilotMissionCardView`, `GET /api/pilot/jobs`  
**Assets:** `public/icons/pilot-dashboard/marketplace-search.svg`, `marketplace-star.svg`; pin via `location.svg`  
**Notes:** Layout from Figma; site color tokens. Filters: LOCATION (API), SERVICE, BUDGET, DEADLINE (client). GRADE/DISTANCE deferred panels. CTA “View & Submit Proposal”. Shell Back/bell unchanged. Client rating still placeholder 4.9 (M86).

---

#### Pilot Membership — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-10 |
| **Figma frame** | Main `1160:4705` (parent Membership `1160:4704`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=1160-4705 |
| **Route** | `/dashboard/pilot/subscription` |
| **Status** | Implemented (layout + instructor + prices/statuses) |

**Components created:** `PilotInstructorAddonSection`, `instructor-addon.ts`, `GET/POST /api/pilot/subscription/instructor`  
**Components reused:** `PilotSubscriptionView`, `PilotFastForwardCards`, membership catalog  
**Notes:** Layout from Figma; site color tokens. Genuine prices: $99.99/yr, FF fees, instructor $199.99/yr A-4+. Statuses: Current / Recommended / Starting Grade / upgrade difference / instructor locked|available|active. Stripe still demo.

---

#### Pilot Dashboard — Main

| Field | Value |
|-------|--------|
| **Date** | 2026-08-10 |
| **Figma frame** | Main `808:17230` (parent dashboard `808:16888`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-17230 |
| **Route** | `/dashboard/pilot` |
| **Status** | Implemented (UI pass) |

**Components created:** —  
**Components reused:** `PilotDashboardOverview`, Hero, Stats, RecommendedJobs, LockedJobs, ProfileStrength, Reviews, ActivityFeed  
**Assets:** `public/icons/pilot-dashboard/*` (Figma SVGs)  
**Notes:** UI layout pass only (site color tokens); shortlisted count / membership days / on-time % deferred. Parent shell sidebar not in this node. Color rule: Figma layout + site `:root` palette.

---

## QA — Full marketing site unlock (2026-07-07)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-07 |
| **Routes unlocked** | `/about`, `/contact`, `/terms`, `/privacy`, `/cookies`, `/resources`, `/pilots`, `/captains-club`, `/reputation`, `/waitlist` |
| **New page** | `/reputation` — hero, pillars, grade CTA, gold dual-path CTA |
| **Contact** | `ContactForm` wired to `POST /api/contact` |
| **For Pilots** | Reputation CTA → `/reputation` |
| **Public access** | All marketing routes in `DEFAULT_UNLOCKED_PUBLIC_PATHS` |

---

## QA — Figma 808 alignment pass (2026-07-06)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-06 |
| **Frames** | For Pilots `808:42998`, Safety `808:44504` |
| **Routes** | `/for-pilots`, `/safety` |
| **Changes** | Hero copy/layout, icon cards, onboarding grid, profile card, membership preview, reputation CTA, safety verify/certification/workflow/operations panels |
| **Header/footer** | Unchanged |

---

## QA — Remaining header nav pages (2026-07-06)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-06 |
| **Pages** | `/for-pilots`, `/pricing`, `/safety` |
| **Public unlock** | All six header nav routes live in `DEFAULT_UNLOCKED_PUBLIC_PATHS` |
| **Pricing** | $99.99/yr membership intro + Fast Forward grade cards from `pilot-membership-catalog` |
| **For Pilots** | Hero/onboarding/CTAs aligned to shared `ras-*` brand pattern |
| **Safety** | Hero aligned to shared brand pattern |
| **Build / tests** | `npm test` 97/97, `npm run build` pass |

---

## QA — Marketing phase pages (2026-06-02)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Pages tested** | `/contact`, `/about`, `/terms`, `/privacy`, `/cookies`, `/resources`, `/resources/[slug]`, `/safety`, `/pricing#faq` |
| **Commands run** | `npm run build`, `npm run dev`, HTTP route checks (200/404), HTML marker verification |
| **Production build** | Passed |
| **Final QA status** | Passed (with documented pending integrations) |

**Issues found**
- `/safety` missing from `PUBLIC_PATHS` (auth config consistency only; middleware does not block marketing routes)

**Issues fixed**
- Added `/safety` to `PUBLIC_PATHS` in `auth/config.ts`

**Issues still pending (documented, not faked)**
- M17-Contact form submission (UI-only thank-you state)
- M17-Cookie consent banner (referenced in Cookie Policy copy)
- M30-Resources CMS (placeholder `/resources/[slug]` pages)
- Final legal copy review (Terms, Privacy, Cookies placeholder text)

**Page-specific confirmation**
- Contact: hero, support cards, form, quick help, gold CTA; FAQ → `/pricing#faq`
- About: `Rectangle 11.png` / `Rectangle 12.png`; For Clients differentiator icons
- Terms / Privacy / Cookies: legal heroes on `public-container`; body uses `legal-content-inner` (1063px); 14 / 12 / 11 sections
- Privacy → `/cookies` link verified
- Resources: `SVG.png` featured, `SVG (1).png` grid; waitlist reused; card content padding only; icon band `rounded-b-[14px]`
- Safety: six `icon-audience-*.png` verify icons
- Footer: Privacy → `/privacy`, Terms → `/terms`
- Invalid `/resources/[slug]` → 404

**Responsive / visual notes**
- Code review: no page-level custom max-width overrides beyond hero `max-w-3xl` intro copy and legal `legal-content-inner`
- Breakpoint testing (1440 / 1280 / 1024 / 768 / 390 / 360): not automated; layouts use existing responsive Tailwind patterns (`sm:` / `lg:` grids, pill scroll, featured stack)
- Manual Figma pixel comparison recommended for final design sign-off

---

## Screen entries

#### Resources / Knowledge Center

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Resources |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-6534 |
| **Route** | `/resources` |
| **Status** | Partial |

**Components created:** `ResourcesHero`, `ResourcesFeatured`, `ResourcesArticleBrowse`, `ResourcesWaitlistSection`, `ResourceBookIcon`  
**Components reused:** `MarketingWaitlistSection`, `MarketingHeader`, `MarketingFooter`, `public-container`  
**Files created:** `src/lib/marketing/resources-content.ts`, `src/components/marketing/resources/*`, `resources/page.tsx`, `resources/[slug]/page.tsx` (placeholder)  
**Files updated:** `auth/config.ts`, `globals.css`, `figma-implementation-log.md`

**Missing modules found:** CMS/blog backend, article search, pagination, featured article admin  
**Missing modules/tasks created:** M30-Resources CMS (article detail content, filtering persistence, search)

**Notes / assumptions:**
- Category pills filter grid client-side; empty categories show placeholder message
- Article cards + featured card link to `/resources/[slug]` placeholder pages
- Waitlist reuses `MarketingWaitlistSection` with `source: "resources"`, `roleInterest: "both"`
- Featured book icon → `SVG.png`; card book icon → `SVG (1).png`
- Style pass: unified `#0e0e0d` section bg, warm radial featured gradient, `#201f1d` cards, `#a39684`/`#8f8980` body text, pill active gold border/text, merged featured+pills+grid section
- Card components aligned to Figma nodes [323:6564](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-6564) (featured) and [323:6579](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-6579) (grid card): inset icon panel, horizontal featured flex, left-side gold wash
- Status **Partial** until CMS article bodies and admin are wired

---

#### Cookie Policy

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Cookie Policy |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=328-10684 |
| **Route** | `/cookies` |
| **Status** | Implemented |

**Components created:** `CookieHero`, `CookieContent`  
**Components reused:** `LegalContentInner`, `MarketingHeader`, `MarketingFooter`, `public-container` (hero only)  
**Files created:** `src/lib/marketing/cookie-content.ts`, `src/components/marketing/cookies/*`, `cookies/page.tsx`  
**Files updated:** `privacy-content.ts`, `PrivacyContent.tsx` (Cookie Policy link), `auth/config.ts`, `globals.css`, `figma-implementation-log.md`

**Missing modules found:** Cookie consent banner UI, final legal copy review  
**Missing modules/tasks created:** M17-Cookie consent banner (referenced in copy)

**Notes / assumptions:**
- Placeholder legal copy from Figma — requires client/legal review before launch
- Hero uses `public-container`; policy body uses standalone `legal-content-inner` (1063px centered)
- Privacy Policy “Cookies and Tracking” section now links to `/cookies`
- Cookie consent banner mentioned in copy; not yet implemented

---

#### Privacy Policy

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Privacy Policy |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=328-10192 |
| **Route** | `/privacy` |
| **Status** | Implemented |

**Components created:** `PrivacyHero`, `PrivacyContent`  
**Components reused:** `LegalContentInner`, `MarketingHeader`, `MarketingFooter`, `public-container` (hero only)  
**Files created:** `src/lib/marketing/privacy-content.ts`, `src/components/marketing/privacy/*`, `privacy/page.tsx`  
**Files updated:** `marketing.ts` (footer Privacy → `/privacy`), `auth/config.ts`, `globals.css`, `figma-implementation-log.md`

**Missing modules found:** Cookie consent banner, final legal copy review  
**Missing modules/tasks created:** M17-Cookie consent banner

**Notes / assumptions:**
- Placeholder legal copy from Figma — requires client/legal review before launch
- Hero uses `public-container`; policy body uses standalone `legal-content-inner` (1063px centered)
- Contact section links to `/contact`
- “Cookies and Tracking” links to `/cookies`

---

#### Terms & Conditions

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Terms & Conditions |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=328-9362 |
| **Route** | `/terms` |
| **Status** | Implemented |

**Components created:** `TermsHero`, `TermsContent`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `public-container`  
**Files created:** `src/lib/marketing/terms-content.ts`, `src/components/marketing/terms/*`, `terms/page.tsx`  
**Files updated:** `marketing.ts` (footer Terms → `/terms`), `auth/config.ts`, `globals.css`, `figma-implementation-log.md`

**Missing modules found:** Privacy Policy page, final legal copy review  
**Missing modules/tasks created:** None (M17-Legal partially addressed — Terms only)

**Notes / assumptions:**
- Placeholder legal copy from Figma — requires client/legal review before launch
- Contact section links to `/contact`
- Footer “Terms of Service” now routes to `/terms`; Privacy Policy remains `/contact` placeholder
- No cards, accordions, or icons in legal body
- Hero uses global `public-container` (1280px); legal body uses standalone `legal-content-inner` (1063px centered, not nested in `public-container`) via `LegalContentInner`

---

#### About

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | About |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-8209 |
| **Route** | `/about` |
| **Status** | Implemented |

**Components created:** `AboutHero`, `AboutMission`, `AboutStory`, `AboutDifferentiators`, `AboutAudience`, `AboutPathCta`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `MarketingSectionLabel`, `public-container`, `figma-home-waitlist`, `hero-drone.jpg`, `hero-pilot.jpg`  
**Files created:** `src/lib/marketing/about-content.ts`, `src/lib/marketing/about-assets.ts`, `src/components/marketing/about/*`  
**Files updated:** `about/page.tsx`, `globals.css`, `figma-implementation-log.md`

**Missing modules found:** None  
**Missing modules/tasks created:** None

**Notes / assumptions:**
- Replaced interim `MarketingPage` layout with full Figma section stack
- Mission image → `Rectangle 11.png`; story image → `Rectangle 12.png`
- Differentiator card icons reuse same six `icon-audience-*.png` assets as For Clients (grid order)
- Gold CTA: Hire → `/for-clients`; Apply → `/register?role=pilot`
- Uses global `public-container` only — no page-specific max-width overrides

---

#### Contact

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Contact |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-7132 |
| **Route** | `/contact` |
| **Status** | Implemented |

**Components created:** `ContactHero`, `ContactSupportCards`, `ContactMessageSection`, `ContactQuickHelp`, `ContactPathCta`  
**Components reused:** `ContactForm`, `MarketingHeader`, `MarketingFooter`, `MarketingSectionLabel`, `public-container`, `figma-home-waitlist` gold CTA pattern  
**Files created:** `src/lib/marketing/contact-content.ts`, `src/components/marketing/contact/*`  
**Files updated:** `contact/page.tsx`, `ContactForm.tsx`, `globals.css`, `PricingFaq.tsx` (`id="faq"`), `figma-implementation-log.md`

**Missing modules found:** Contact form backend / email delivery  
**Missing modules/tasks created:** M17-Contact form submission (API + mailer)

**Notes / assumptions:**
- Replaced interim `MarketingPage` layout with full Figma section stack (hero → support cards → form → quick help → gold CTA)
- Form UI-only submit with thank-you state; no mailer wired
- Quick help: Hire → `/for-clients`; Join → `/for-pilots`; Plans → `/pricing`; FAQ → `/pricing#faq`; Safety → `/safety`
- Gold CTA: Hire → `/for-clients`; Apply → `/register?role=pilot`
- Support card icons use inline gold-outline SVGs (no dedicated Figma asset export)
- Uses global `public-container` only — no page-specific max-width overrides

---

#### Safety and Verification

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Safety |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-5900 |
| **Route** | `/safety` |
| **Status** | Implemented |

**Components created:** `SafetyHero`, `SafetyVerifyOverview`, `SafetyCertification`, `SafetyOperationsCta`, `SafetyWorkflow`, `SafetyPathCta`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `MarketingSectionLabel`, `public-container`, `icon-trust-verified.png`, `hero-pilot.jpg`  
**Files created:** `src/lib/marketing/safety-content.ts`, `src/lib/marketing/safety-assets.ts`, `src/components/marketing/safety/*`, `safety/page.tsx`  
**Files updated:** `marketing.ts`, `globals.css`, `ClientSafetyCta.tsx`, `figma-implementation-log.md`

**Missing modules found:** None  
**Missing modules/tasks created:** None

**Notes / assumptions:**
- Header “Safety” nav + footer “Safety Standards” now route to `/safety`
- Hero CTA scrolls to `#safety-overview`
- Workflow section shows 6 cards per Figma (heading copy unchanged: “5 Simple Steps”)
- “Hire a Pilot” → `/for-clients`; “Apply as Pilot” → `/register?role=pilot`
- Verification icons reuse same six `icon-audience-*.png` assets as For Pilots “Why Join” (grid order); certification image → `safety-certification.png`

---

#### Pricing (Pilot Membership Plans)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | Pricing |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-5052 |
| **Route** | `/pricing` |
| **Status** | Implemented |

**Components created:** `PricingHero`, `PricingPlanCards`, `PricingComparison`, `PricingFaq`, `PricingCta`, `PricingFeatureIcon`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `MarketingSectionLabel`, `public-container`, rank badge images (`home-assets`)  
**Files created:** `src/lib/marketing/pricing-content.ts`, `src/components/marketing/pricing/*`  
**Files updated:** `pricing/page.tsx`, `globals.css`

**Missing modules found:** Stripe/checkout subscription flow, auth-aware “current plan” state, tier-specific upgrade deep links  
**Missing modules/tasks created:** M29-Stripe pilot subscription checkout (new pending)

**Notes / assumptions:**
- Monthly Figma prices ($0–$399) are static marketing UI; backend tiers remain yearly in `MEMBERSHIP_TIER_DEFINITIONS` until billing sync
- `CURRENT` badge and disabled button follow the logged-in pilot’s active subscription tier (none when logged out)
- A-4 `RECOMMENDED` shows when it is not the pilot’s current plan
- Plan upgrade buttons → `/register?role=pilot` (guests) or `/dashboard/pilot/subscription` (logged-in pilots) until checkout is wired
- FAQ accordion: first item open by default; client-side toggle implemented
- Comparison table scrolls horizontally on mobile
- Uses global 1280px `public-container` — no custom page max-width
- Legacy `PricingPlans` server component retained but no longer used on `/pricing`
- **2026-06-02 style pass:** Plan cards use Figma rank insignia aspect, header row (code + badge), warm `#211D12` gradient cards, gold check feature icons, equal-height grid; FAQ accordion layout refined

---

#### How It Works

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | How It Works (`808:46297`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-46297 |
| **Route** | `/how-it-works` |
| **Status** | Implemented (2026-06-02 alignment pass) |

**Components created:** `HowItWorksHero`, `HowItWorksProcess`, `HowItWorksPathCta`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `public-container`, client/pilot step copy from `for-clients-content` / `for-pilots-content`  
**Files created:** `src/lib/marketing/how-it-works-content.ts`, `src/components/marketing/how-it-works/*`  
**Files updated:** `how-it-works/page.tsx`, `globals.css`

**Missing modules found:** None (tab switching implemented client-side)  
**Missing modules/tasks created:** None

**Notes / assumptions:**
- Default tab: **For Clients**; pilot tab shows onboarding steps from For Pilots page
- Workflow grid: 3 columns desktop (3+2 rows), 2 columns tablet, 1 column mobile
- “How It Works” nav active on `/how-it-works` (global header unchanged)
- Header “Safety” still links to `/how-it-works` until `/safety` exists
- “Apply as Pilot” → `/register?role=pilot`; “View Pilot Plans” → `/pricing`
- Uses global 1280px `public-container` — no custom page max-width
- **2026-06-02:** Frame `808:46297`; dedicated 6-step pilot tab copy; Figma tab control + gold path CTA; header/footer untouched

---

#### For Pilots (Landing)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-02 |
| **Figma frame** | for pilot |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=323-4399 |
| **Route** | `/for-pilots` |
| **Status** | Implemented |

**Components created:** `PilotPageHero`, `PilotWhyJoin`, `PilotOnboarding`, `PilotProfileSection`, `PilotMembershipPreview`, `PilotReputationCta`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `MarketingSectionLabel`, `MarketingWaitlistSection`, waitlist API (`/api/waitlist`)  
**Files created:** `src/lib/marketing/for-pilots-content.ts`, `src/components/marketing/for-pilots/*`  
**Files updated:** `for-pilots/page.tsx`, `globals.css`, `MarketingWaitlistSection`, `HomeWaitlistSection`

**Missing modules found:** Dedicated reputation system page (`/reputation` or similar), logged-in “Apply as Pilot” deep link to onboarding  
**Missing modules/tasks created:** M28-Reputation system page (new pending)

**Notes / assumptions:**
- “Join as Pilot” nav active on `/for-pilots` with gold underline (global header unchanged)
- “Apply as Pilot” → `/register?role=pilot`
- “View Pilot Plans” / “View All Pilot Plans” → `/pricing`
- “Explore Reputation System” → `/how-it-works` until dedicated reputation page exists
- Why Join icons reuse For Clients `icon-audience-*.png` assets (same Figma icon set, matched by grid position)
- Pilot profile card is static mockup (John Smith) — not live profile data
- Onboarding copy reflects confirmed flow: apply → admin review → approval notification → login → membership → tier access
- Waitlist uses `roleInterest: "pilot"` and `source: "for-pilots"`
- Homepage waitlist fixed to `roleInterest: "both"` (was incorrectly hardcoded to client)

---

#### For Clients (Landing)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-08 |
| **Figma frame** | For Clients (`808:42364`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-42364 |
| **Route** | `/for-clients` |
| **Status** | Implemented (2026-06-02 alignment pass) |

**Components created:** `ClientPageHero`, `ClientWhoItsFor`, `ClientHowItWorks`, `ClientBenefits`, `ClientSafetyCta`, `MarketingSectionLabel`, `MarketingWaitlistSection`  
**Components reused:** `MarketingHeader`, `MarketingFooter`, `Logo`, waitlist API (`/api/waitlist`)  
**Files created:** `src/lib/marketing/for-clients-content.ts`, `src/lib/marketing/for-clients-assets.ts`, `src/components/marketing/for-clients/*`, `src/components/marketing/figma/*`  
**Files updated:** `for-clients/page.tsx`, `MarketingHeader`, `marketing.ts`, `HomeWaitlistSection`, `globals.css`

**Missing modules found:** Dedicated `/safety` page, logged-in “Post a Drone Project” deep link  
**Missing modules/tasks created:** M17-Safety page (existing pending)

**Media mapped (2026-06-02):** Audience card icons → `icon-audience-*.png` in `public/marketing/`. Benefit shield reuses `icon-trust-verified.png`.

**Notes / assumptions:**
- Header unified on all marketing pages (including `/`): Login + Get Started CTA, active nav gold underline, desktop nav `margin-top: 10px`
- “Hire Pilots” active on `/for-clients` with gold underline
- “Post a Drone Project” → `/register?role=client` (M06 job posting requires auth)
- “Learn About Safety” → `/safety`
- Waitlist uses `roleInterest: "client"` and `source: "for-clients"`
- **2026-06-02:** Frame updated to `808:42364`; hero eyebrow `FOR CLIENTS`; gold CTAs; step badges; responsive grids; header/footer untouched

---

#### Homepage (Landing)

| Field | Value |
|-------|--------|
| **Date** | 2026-06-04 |
| **Figma frame** | Homepage (`808:8249`) |
| **Figma URL** | https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-8249 |
| **Route** | `/` |
| **Status** | Implemented (2026-06-02 alignment pass) |

**Components created:** `HomeHeroDual`, `HomeTrustStrip`, `HomeAudienceCards`, `HomeSopSection`, `HomeRankProgression`, `HomeCaptainsClub`, `HomeCapabilities`, `HomeWaitlistSection`  
**Components reused:** `Logo`, `PublicPageContainer` pattern (`public-container`), existing waitlist API  
**Files created:** `src/lib/marketing/home-content.ts`, `src/components/marketing/home/*`, `public/marketing/*.jpg`  
**Files updated:** `src/app/(marketing)/page.tsx`, `MarketingHeader`, `MarketingFooter`, `marketing.ts`, `globals.css`

**Missing modules found:** Safety page, Legal pages, Grade Benefits doc page, Fast Forward waitlist tier logic, Footer social links  
**Missing modules/tasks created:** See Pending missing modules below

**Media mapped (2026-06-04):** See `src/lib/marketing/home-assets.ts` — logo, trust icons, rank badges A-1–A-6, capability icons, footer social, hero/map photos.

**Notes / assumptions:**
- Header “Safety” links to `/how-it-works` until dedicated page exists
- Footer legal links route to `/contact` as placeholder
- “Grade Benefits Documentation” links to `/pricing` (M27 tiers)
- Homepage waitlist form posts email only with `roleInterest: "both"` and `source: "homepage"`
- A-4 hours use Figma copy (1000+) not summary (1500+)
- Brand footer copyright uses Figma “Remote Air Service”; logo text unchanged (interim)
- **2026-06-02:** Frame updated to `808:8249`; Captain's Club section added with mock A-6 cards; header/footer untouched

---

## Pending missing modules

| Module/task | Priority | Status | Linked screen | Notes |
|-------------|----------|--------|---------------|-------|
| M17-Safety page | Medium | Implemented | `/safety` | Figma frame 323:5900 |
| M17-Legal pages | Medium | Implemented | Footer | Terms `/terms`, Privacy `/privacy`, Cookies `/cookies` |
| M17-Cookie consent banner | Low | Pending | Cookie Policy copy | Accept/manage preferences banner not wired |
| M27-Grade benefits doc | Low | Pending | Rank section CTA | Standalone doc or pricing section anchor |
| M18-Fast Forward waitlist | Low | Pending | Waitlist section | Priority tier logic for A-3+ fast-forward |
| M17-Footer social | Low | Pending | Footer | Social/share icon targets TBD |
| M28-Reputation system page | Medium | Pending | For Pilots CTA | Dedicated route for badges, wings, rank upgrades |
| M29-Stripe pilot subscription checkout | Medium | Pending | Pricing page | Wire plan buttons to real subscription/billing flow |
| M17-Contact form submission | Medium | Pending | `/contact` | API route + email/CRM integration for contact messages |
| M30-Resources CMS | Medium | Pending | `/resources` | Article bodies, CMS admin, search, pagination, featured management |
