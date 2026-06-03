# Sprint 01 — Foundation

**Sprint goal:** Build the base foundation only — no marketplace business logic.

**Duration:** Planning sprint (documentation + next implementation step)  
**Active modules:** M01 (In Progress), M02 (planning only)

---

## Sprint 1 includes

| Item | Description |
|------|-------------|
| Project setup | Next.js project initialization (next step after docs) |
| Folder structure | App Router layout: marketing, auth, dashboard shells |
| Tailwind setup | Tailwind CSS with project conventions |
| Base layout | Root layout, header/footer patterns, dashboard shell |
| Design tokens | Black, white, gold — aviation-inspired CSS variables / Tailwind theme extension |
| Authentication planning | Session strategy, role model, protected route map (no full auth UI required in Sprint 1 if scoped to shells only) |
| Role-based route planning | `/dashboard/pilot`, `/dashboard/client`, `/dashboard/admin` guards documented |
| Dashboard shell planning | Empty states, nav sidebars, mobile-first breakpoints |

---

## Sprint 1 explicitly excludes

Do **not** implement in Sprint 1:

- Job posting
- Bidding
- Payments
- Subscriptions
- Certificates
- Achievements
- Reviews
- Admin approval workflows
- Email sending (beyond placeholder planning)

---

## Tasks checklist

### Documentation (this sprint — control foundation)

- [x] Create `/docs` structure
- [x] `BUILD_CONTROL.md` — module table
- [x] `MVP_SCOPE.md` — Phase 1 definition
- [x] `MODULE_WORKFLOW.md` — development loop
- [x] `USER_ROLES_PERMISSIONS.md` — permissions matrix
- [x] `DATA_MODEL_OVERVIEW.md` — entity overview
- [x] `SITEMAP.md` — route map
- [x] `DECISIONS.md` — ADRs
- [x] `CHANGELOG.md` — v0.1.0
- [x] Root `README.md`

### Implementation (Sprint 1 foundation)

- [x] Initialize Next.js + TypeScript + Tailwind
- [x] Configure folder structure per plan
- [x] Add design tokens (colors, typography, spacing)
- [x] Implement base layout and dashboard shells (placeholder content)
- [x] Document auth approach in `DECISIONS.md` and `AUTH_PLANNING.md`
- [x] Mark M01 `Ready for Review` per `MODULE_WORKFLOW.md`
- [ ] M01 `Approved` → `Done` after review sign-off

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Documentation files created | ✅ |
| 2 | MVP scope is clear | ✅ |
| 3 | User roles are clear | ✅ |
| 4 | Data model overview is clear | ✅ |
| 5 | Sitemap is clear | ✅ |
| 6 | Build workflow is clear | ✅ |
| 7 | Next step is ready: project foundation setup | ✅ |

---

## Definition of done (Sprint 1 — documentation phase)

- All `/docs` files reviewed and consistent with each other
- `BUILD_CONTROL.md` shows M01 In Progress, M02 P0 Not Started
- Team can begin Next.js foundation without ambiguity on scope

## Definition of done (Sprint 1 — implementation phase)

- Runnable Next.js app with Tailwind and base layouts
- Design tokens applied globally
- Dashboard route shells exist with role-based layout separation (content optional)
- No marketplace features merged
- M01 marked Done in `BUILD_CONTROL.md` after review

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into jobs/payments | Enforce `MODULE_WORKFLOW.md` gate and this sprint exclusion list |
| Auth choice delays layout work | Use placeholder middleware; record ADR in `DECISIONS.md` |
| Inconsistent branding | Single tokens file / Tailwind theme as source of truth |

---

## Next sprint preview (not started)

**Sprint 2 (planned):** M02 Authentication & User Roles — login, register, session, role-based redirects, minimal dashboards.
