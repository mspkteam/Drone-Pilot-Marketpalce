# Architecture Decision Records (ADR)

Decisions that affect structure, stack, and process. Add new rows when choices are made; do not delete — set **Status** to `Superseded` and link to the replacing ADR.

| Field | Description |
|-------|-------------|
| **Decision ID** | ADR-### |
| **Date** | ISO date |
| **Topic** | Short title |
| **Decision** | What we chose |
| **Reason** | Why |
| **Alternatives considered** | What we did not choose |
| **Status** | Proposed \| Accepted \| Superseded \| Deprecated |

---

## ADR-001 — Mobile-first approach

| | |
|---|---|
| **Decision ID** | ADR-001 |
| **Date** | 2026-06-01 |
| **Topic** | Responsive design strategy |
| **Decision** | Build all UI mobile-first; enhance for tablet and desktop with progressive layout |
| **Reason** | Pilots and clients often use phones on-site; marketplace must work in the field |
| **Alternatives considered** | Desktop-first; separate mobile web later |
| **Status** | Accepted |

---

## ADR-002 — Aviation-inspired UI direction

| | |
|---|---|
| **Decision ID** | ADR-002 |
| **Date** | 2026-06-01 |
| **Topic** | Visual design system |
| **Decision** | Premium aviation / flight-operations aesthetic: black, white, gold; clean dashboard UI |
| **Reason** | Aligns with drone industry professionalism and trust |
| **Alternatives considered** | Generic SaaS blue; consumer playful branding |
| **Status** | Accepted |

---

## ADR-003 — Keep Phase 1 MVP limited

| | |
|---|---|
| **Decision ID** | ADR-003 |
| **Date** | 2026-06-01 |
| **Topic** | MVP scope control |
| **Decision** | Phase 1 includes only capabilities listed in `MVP_SCOPE.md`; defer advanced features explicitly |
| **Reason** | Faster validation, lower complexity, clearer module boundaries |
| **Alternatives considered** | Big-bang launch with mobile app and AI matching |
| **Status** | Accepted |

---

## ADR-004 — Build by module, not by random pages

| | |
|---|---|
| **Decision ID** | ADR-004 |
| **Date** | 2026-06-01 |
| **Topic** | Development process |
| **Decision** | Follow `MODULE_WORKFLOW.md`; one module at a time; gate on approval before next module |
| **Reason** | Prevents half-finished cross-cutting features and untestable UI |
| **Alternatives considered** | Page-by-page sprints; feature flags without module boundaries |
| **Status** | Accepted |

---

## ADR-005 — Foundation and auth before marketplace logic

| | |
|---|---|
| **Decision ID** | ADR-005 |
| **Date** | 2026-06-01 |
| **Topic** | Build order |
| **Decision** | Complete M01 (foundation) and M02 (auth/roles) before jobs, bidding, payments, or subscriptions |
| **Reason** | Roles and layouts underpin every marketplace flow |
| **Alternatives considered** | Build job posting first with mock users |
| **Status** | Accepted |

---

## ADR-006 — Next.js + Tailwind stack

| | |
|---|---|
| **Decision ID** | ADR-006 |
| **Date** | 2026-06-01 |
| **Topic** | Frontend stack |
| **Decision** | Next.js (App Router) with Tailwind CSS |
| **Reason** | SSR/SEO for marketing, strong React ecosystem, fast UI iteration, API routes for future mobile backend |
| **Alternatives considered** | Remix, Vite SPA only, separate backend + React |
| **Status** | Accepted |

---

## ADR-007 — Auth.js (NextAuth v5) for authentication

| | |
|---|---|
| **Decision ID** | ADR-007 |
| **Date** | 2026-06-01 |
| **Topic** | Authentication provider |
| **Decision** | Use Auth.js (NextAuth v5) with App Router; credentials provider for Phase 1; session enforced in middleware (M02) |
| **Reason** | First-party Next.js integration, flexible roles, self-hosted, no vendor lock-in for MVP |
| **Alternatives considered** | Clerk; Supabase Auth; custom JWT only |
| **Status** | Accepted |

See also: [`AUTH_PLANNING.md`](AUTH_PLANNING.md)

---

## ADR-008 — Prisma 7 + SQLite for development

| | |
|---|---|
| **Decision ID** | ADR-008 |
| **Date** | 2026-06-02 |
| **Topic** | Database for auth (M02) |
| **Decision** | Prisma ORM 7 with SQLite (`better-sqlite3` adapter) for local dev; `User` model only in M02 |
| **Reason** | No external DB required for development; aligns with `DATA_MODEL_OVERVIEW.md`; PostgreSQL migration path later |
| **Alternatives considered** | In-memory users; Clerk-only auth without local User table |
| **Status** | Accepted |

---

## ADR-009 — Figma as future UI/UX source of truth

| | |
|---|---|
| **Decision ID** | ADR-009 |
| **Date** | 2026-06-02 |
| **Topic** | Visual design direction |
| **Decision** | Current coded UI is an interim foundation; marketing, auth, and dashboards will be updated to match **Figma UI/UX** when designs are delivered |
| **Reason** | Professional product design will be authored in Figma; code should follow tokens and layouts from design, not the reverse |
| **Alternatives considered** | Lock current Tailwind theme as final; redesign only in code without Figma |
| **Status** | Accepted |

See: [`DESIGN_AND_FORMS_ROADMAP.md`](DESIGN_AND_FORMS_ROADMAP.md)

---

## ADR-010 — Extended client/pilot registration fields (planned)

| | |
|---|---|
| **Decision ID** | ADR-010 |
| **Date** | 2026-06-02 |
| **Topic** | Registration form scope |
| **Decision** | M02 register stays minimal (email, password, role). **Additional fields** for Client and Pilot registration will be added later per Figma and M03/M04 onboarding |
| **Reason** | Field set and layout depend on final UX; avoids premature schema/UI churn |
| **Alternatives considered** | Collect all profile fields at signup in M02 |
| **Status** | Accepted |

See: [`DESIGN_AND_FORMS_ROADMAP.md`](DESIGN_AND_FORMS_ROADMAP.md)

---

## Pending decisions (to resolve in later modules)

| Topic | Options | Target sprint |
|-------|---------|---------------|
| Production database | PostgreSQL + `@prisma/adapter-pg` | Before production deploy |
| Payment provider | Stripe (likely) | M11 / M12 |
| Email provider | Resend / SendGrid / SES | M16 |
