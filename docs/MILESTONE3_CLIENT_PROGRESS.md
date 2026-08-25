# REMOTE AIR SERVICE
## Milestone 3 Progress Update | Remote Air Service

**Milestone 3 Progress Update**  
Pilot marketplace, proposals, contracts, delivery, profile, and membership — the live job loop from bid to completed work

Hi,

Please find below a complete progress update for **Milestone 3 (Pilot)**, covering the pilot workspace and the client steps that close the marketplace loop (review bids, accept a proposal, approve deliverables). All listed features use **real, persisted data** in the Neon database — not placeholder or mock content.

---

### Live Environments

| Surface | URL |
|---------|-----|
| Main Platform — Production | https://drone-pilot-marketpalce.vercel.app |

Pilot and client dashboards are accessed after login. Use the demo credentials in the section below to review each role.

---

### Milestone 3 — Scope Completion

The following Week 3 / Milestone 3 deliverables are complete and available for review:

- **3.1 Marketplace — Job Listings** — Pilots browse approved, live jobs from the database after admin approval.
- **3.2 Marketplace Filters** — Filter jobs by search, category, and budget range.
- **3.3 Locked Jobs & Countdown** — Grade-based visibility delay with a server-authoritative countdown (A-1 through A-6 rules).
- **3.4 Eligibility on Job Cards** — Each card shows whether the logged-in pilot qualifies (including A-1 cannot submit proposals).
- **3.5 Submit Proposal** — Full bid form with operational plan, compliance, pricing breakdown, and terms acknowledgment (required for the loop; numbered here even though the original schedule jumped from 3.4 to 3.6).
- **3.6 My Proposals** — Track submitted bids with live status (pending, revised/shortlisted, accepted, rejected, withdrawn).
- **3.7 Proposal Detail Page** — Full detail view per proposal, including cover message and pricing.
- **3.8 Withdraw Proposal** — Pilot can withdraw a bid they no longer wish to pursue.
- **3.9 Active Contracts** — View and manage accepted bookings from live booking records.
- **3.10 Deliver Work** — Submit files and/or links plus notes to the client through the platform.
- **3.11 Client Approval of Delivery** — Client approves submitted work (or requests revisions); completion records commission at the platform default of **15%**.
- **3.12 Raise a Dispute** — Pilot can open a dispute from a contract; staff continue to manage cases in the Dispute Centre from Milestone 2.
- **3.13 Pilot Dashboard** — Live overview of proposals, contracts, earnings indicators, and recommended jobs.
- **3.14 Messages** — Conversations with clients on the live messaging system (client initiates chat after reviewing a proposal, per marketplace rules).
- **3.15 Portfolio Gallery** — Upload and display past work on the pilot profile.
- **3.16 Verifications** — Manage licences, certificates, insurance, and related compliance documents; admin review remains in the staff queue.
- **3.17 Profile & Strength Score** — Profile completion checklist to improve visibility.

**Also delivered in this milestone (beyond the numbered Week 3 list):**

- Membership / Fast Forward (`$99.99/year` base, A-2–A-6 upgrade path) on the pilot Membership page.
- Instructor add-on and Request Wings flow (admin-reviewed wing evidence).
- Issued platform certificates on the pilot Certificates page; admin can issue and **remove** certificates (member numbers are 6-digit IDs starting at **001000**).

**Goal achieved:** The full marketplace loop is live — job posted → admin approves → pilot bids → client accepts → pilot delivers → client approves → commission calculated.

---

### Demo Logins

Password for **all** demo accounts: `Demo123!`

| Role | Email | What to review |
|------|-------|----------------|
| Super Admin | `admin@dronepilot.local` | Approve jobs so they appear in the marketplace |
| Client | `client@dronepilot.local` | Quotes, accept a bid, messages, approve delivery |
| Pilot — Captain (A-6) | `pilot@dronepilot.local` | Full loop: marketplace, proposal, contract, delivery |
| Pilot — Student (A-1) | `pilot-a1@dronepilot.local` | Can view jobs; **cannot** submit proposals |

Login route: `/login`  
- Pilot accounts redirect to `/dashboard/pilot`  
- Client accounts redirect to `/dashboard/client`

---

### Milestone 3 — Pilot Workspace

The pilot workspace is available at **`/dashboard/pilot`**.

#### Pilot Dashboard  
**Route:** `/dashboard/pilot`  
- Live stats and activity (no sample widgets)  
- Recommended and locked jobs from the live API  

#### Marketplace  
**Route:** `/dashboard/pilot/jobs`  
- Approved jobs only  
- Search and filters  
- Open a job → submit proposal (`/dashboard/pilot/jobs/[id]/proposal`)  

#### Locked Jobs  
**Route:** `/dashboard/pilot/locked-jobs`  
- Grade delay countdown  
- Empty state when nothing is locked (not mock cards)  

#### My Proposals  
**Route:** `/dashboard/pilot/proposals`  
- Status tabs including Revised (shortlisted)  
- Detail: `/dashboard/pilot/proposals/[id]`  
- Withdraw on eligible pending bids  

#### Active Contracts  
**Route:** `/dashboard/pilot/contracts`  
- Accepted bookings  
- Booking detail and deliver-work flow: `/dashboard/pilot/bookings/[id]`  

#### Messages  
**Route:** `/dashboard/pilot/messages`  
- Live client–pilot threads  

#### Profile  
**Route:** `/dashboard/pilot/profile`  
- Profile fields and strength checklist  

#### Verification  
**Route:** `/dashboard/pilot/verifications`  
- Document catalog and submission  
- Request Wings: `/dashboard/pilot/verifications/request-wings`  

#### Portfolio  
**Route:** `/dashboard/pilot/portfolio`  
- Gallery upload and persistence  

#### Reviews  
**Route:** `/dashboard/pilot/reviews`  
- Live reviews after completed work  

#### Earnings  
**Route:** `/dashboard/pilot/payments`  
- Payout / commission visibility (demo pay until Stripe)  

#### Membership  
**Route:** `/dashboard/pilot/subscription`  
- `$99.99/year` membership and Fast Forward upgrades  

#### Instructor  
**Route:** `/dashboard/pilot/instructor`  
- Instructor add-on (A-4+ rules)  

#### Uniform Shop  
**Route:** `/dashboard/pilot/shop`  
- Catalog and orders (demo checkout until Stripe)  

#### Certificates  
**Route:** `/dashboard/pilot/certificates`  
- Download certificates issued by admin  

#### Support & Settings  
**Routes:** `/dashboard/pilot/support` · `/dashboard/pilot/settings`

---

### Milestone 3 — Client Steps in the Same Loop

These client screens are required to complete a bid-to-delivery review:

| Screen | Route |
|--------|--------|
| My Projects | `/dashboard/client/jobs` |
| Project Quotes (review / shortlist / accept) | `/dashboard/client/quotes` |
| Messages | `/dashboard/client/messages` |
| Booking / delivery approval | From the accepted project → booking detail |

---

### Suggested Review Path (Captain + Client)

1. As **admin@dronepilot.local**, approve a pending job if the marketplace looks empty.  
2. As **pilot@dronepilot.local**, open Marketplace → submit a proposal.  
3. As **client@dronepilot.local**, open Project Quotes → shortlist and/or accept.  
4. As **pilot**, open Active Contracts → submit a delivery.  
5. As **client**, approve the delivery.  
6. Confirm the booking completes and commission is recorded at **15%**.  
7. (Optional) As **pilot-a1@dronepilot.local**, confirm A-1 cannot submit a proposal.

---

### Platform Behaviour

- All Milestone 3 core-loop screens use the live API and Neon database.  
- **A-1 Student** cannot submit proposals. **A-2+** can bid when the job is visible for their grade.  
- Visibility delays after admin approval follow grade rules (48h down to immediate at Captain / A-6+).  
- Default platform commission is **15%** on completed bookings (approved RAS business rules).  
- Chat is initiated by the **client** after reviewing a proposal.  
- Stripe card processing, production email (SMTP), and remaining launch QA remain **later milestones** (Week 4 / Week 5 on the five-week schedule).  
- File uploads (profile, portfolio, support, verifications, deliveries, certificates) persist on Vercel Blob when configured.

---

### Quality Assurance — Next Phase

Milestone 3 development for the pilot marketplace loop is complete. Formal end-to-end testing and launch QA remain **Phase 4 / Week 4–5** of the project plan. Informal review notes now will be captured and addressed in that dedicated QA phase.

---

### What We Need From You

- Walkthrough of the **pilot** dashboard (Captain account) and the **client** quote / delivery-approval steps.  
- Confirmation the marketplace loop (bid → accept → deliver → approve) matches your intended process.  
- Feedback on any Figma alignment gaps on pilot screens.  
- Approval to proceed into **Milestone 4 — Bug Fixes & Hardening** (cross-role QA, Stripe prep, upload/security hardening).

---

### Summary

**Milestone 3 (Pilot) delivery is now complete.**

Pilots can discover approved jobs, submit and manage proposals, work accepted contracts, deliver files, and complete the loop with client approval — with membership grades, messaging, portfolio, verifications, and certificates backed by real persisted data on the production environment.

The platform is live at **https://drone-pilot-marketpalce.vercel.app**. Please log in with the demo credentials above and share any feedback or revisions you would like addressed before we continue Milestone 4.

Best regards,
