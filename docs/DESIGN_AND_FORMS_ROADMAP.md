# Design & Forms Roadmap

Planning notes for UI/UX and registration — **not implemented yet**. Keep M02/M03 scope minimal until Figma and field requirements are finalized.

---

## Figma-driven UI/UX (active)

The current site uses an **interim** aviation-inspired layout (black / white / gold) in code (`src/app/globals.css`, shared layout components). This is a **foundation shell** being replaced screen-by-screen from Figma.

**Active workflow:** [`FIGMA_IMPLEMENTATION_WORKFLOW.md`](FIGMA_IMPLEMENTATION_WORKFLOW.md)  
**Implementation log:** [`figma-implementation-log.md`](figma-implementation-log.md)

**Direction:**

- Marketing pages, dashboards, and auth screens are **aligned to Figma** (UI/UX source of truth).
- Each screen: Figma URL + written layout summary → pre-implementation review → implement → log.
- Use design tokens / variables from Figma where possible (map to Tailwind or CSS variables).
- Prefer updating existing layout primitives (`MarketingHeader`, `DashboardShell`, `Button`, etc.) rather than one-off page styles.
- Missing functionality becomes a documented module/task, not ad-hoc page code.
- Record major visual shifts in `docs/DECISIONS.md` when needed.

---

## Registration — additional fields (future)

**Current (M02):** `/register` collects role (client | pilot), email, password, confirm password. Data stored on `User` only.

**M03 (pilot):** Extended pilot fields on `/dashboard/pilot/onboarding` (not on `/register`).

**M04 (client):** Company/contact/billing fields on `/dashboard/client/onboarding` (not on `/register`).

**Planned (Figma):** Registration UI may be refined when designs land; field sets may expand per Figma:

| Area | Likely additions (examples — confirm in Figma/spec) |
|------|-----------------------------------------------------|
| **Client** | Company name, contact name, phone, billing region, project types |
| **Pilot** | Display name, location/service area, license number, certifications upload, services offered |

**Implementation guidance when this work starts:**

1. Extend `DATA_MODEL_OVERVIEW.md` and Prisma (`ClientProfile`, `PilotProfile`) — not only `User`.
2. Split or step the register UI (role select → role-specific form) per Figma.
3. Validate and persist in `POST /api/auth/register` (or dedicated onboarding routes in M03/M04).
4. Update `USER_ROLES_PERMISSIONS.md` if new fields affect who can edit what.
5. Follow `MODULE_WORKFLOW.md` — likely spans **M03 Pilot Onboarding** and **M04 Client Onboarding**, not a silent change to M02.

---

## Related modules

| Module | Relevance |
|--------|-----------|
| M17 | Public marketing pages — Figma marketing screens |
| M03 / M04 | Role onboarding + extended registration fields |
| M02 | Auth shell only; extended fields are downstream |

---

## References

- `docs/DECISIONS.md` — ADR-009 (Figma-aligned UI), ADR-010 (extended registration)
- `docs/AUTH_PLANNING.md` — current auth vs future registration
- Figma plugin/skills — use when implementing from design files
