# Design & Forms Roadmap

Planning notes for UI/UX and registration — **not implemented yet**. Keep M02/M03 scope minimal until Figma and field requirements are finalized.

---

## Figma-driven UI/UX (future)

The current site uses an **interim** aviation-inspired layout (black / white / gold) in code (`src/app/globals.css`, shared layout components). This is a **foundation shell**, not the final product design.

**Planned direction:**

- Final marketing pages, dashboards, and auth screens will be **aligned to Figma** (UI/UX source of truth).
- Implementation should follow the Figma → code workflow when designs exist:
  - Use design tokens / variables from Figma where possible (map to Tailwind or CSS variables).
  - Prefer updating existing layout primitives (`MarketingHeader`, `DashboardShell`, `Button`, etc.) rather than one-off page styles.
  - Record major visual shifts in `docs/DECISIONS.md`.

**Until Figma is ready:** Do not over-invest in pixel-perfect marketing copy or complex UI on placeholder pages. Keep components modular so swaps are straightforward.

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
