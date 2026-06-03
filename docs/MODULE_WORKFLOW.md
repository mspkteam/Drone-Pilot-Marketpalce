# Module Workflow — Development Loop

Every marketplace capability is delivered **one module at a time** using the loop below. This keeps the build organized, testable, and reviewable.

---

## The module loop

For **each module** (M01–M20 in `BUILD_CONTROL.md`):

| Step | Action | Deliverable |
|------|--------|-------------|
| 1 | **Define purpose** | Short statement: what problem this module solves and what “done” means |
| 2 | **Define required data fields** | Fields, types, validations, status enums — align with `DATA_MODEL_OVERVIEW.md` |
| 3 | **Define required screens** | Routes, layouts, components — align with `SITEMAP.md` |
| 4 | **Define user permissions** | Who can view/create/edit/delete — align with `USER_ROLES_PERMISSIONS.md` |
| 5 | **Build only that module** | No scope creep into other modules; stub/mocks only if dependency not ready |
| 6 | **Test** | See [Test matrix](#test-matrix) below |
| 7 | **Mark review status** | Update `BUILD_CONTROL.md` → `Ready for Review` |
| 8 | **Document completion notes** | Module notes in sprint doc or module section; update `CHANGELOG.md` if released |
| 9 | **Move to next module** | Only after current module is **Approved** (see gate rule) |

---

## Gate rule (mandatory)

> **No new module can begin until the current module is documented and approved.**

- **Documented** means: purpose, data fields, screens, and permissions are written (in `/docs` or module-specific doc linked from `BUILD_CONTROL.md`).
- **Approved** means: `BUILD_CONTROL.md` status is `Approved` after review (code review + test matrix passed).
- Then set status to `Done` when merged/deployed per sprint policy.

If a dependency module is not `Approved`, either wait or implement only the minimal interface/stub agreed in `DECISIONS.md`.

---

## Test matrix

Every module must be verified as:

| Persona | What to verify |
|---------|----------------|
| **Admin** (Super Admin / Moderator as applicable) | Admin paths, approvals, overrides per permissions |
| **Pilot** | Pilot dashboard and pilot-only actions |
| **Client** | Client dashboard and client-only actions |
| **Logged-out user** | Public pages, redirects, no unauthorized access |
| **Mobile user** | Mobile-first layout, touch targets, responsive breakpoints |

Record failures in module completion notes; fix before `Ready for Review`.

---

## Review checklist (before Approved)

- [ ] Purpose and scope match `MVP_SCOPE.md` for Phase 1 (or documented exception in `DECISIONS.md`)
- [ ] Data fields match `DATA_MODEL_OVERVIEW.md` (no schema migrations until foundation sprint approves DB approach)
- [ ] Screens match `SITEMAP.md` or sitemap updated with decision recorded
- [ ] Permissions match `USER_ROLES_PERMISSIONS.md`
- [ ] No unrelated files changed
- [ ] Test matrix completed for all five personas
- [ ] `BUILD_CONTROL.md` updated (status, notes, sprint)
- [ ] `CHANGELOG.md` updated if user-visible or version bump

---

## Module documentation template

Copy into sprint notes or a module doc when starting work:

```markdown
## Module: Mxx — Name

### Purpose
...

### Data fields
...

### Screens / routes
...

### Permissions
...

### Out of scope (this module)
...

### Test results
- Admin:
- Pilot:
- Client:
- Logged-out:
- Mobile:

### Completion notes
...
```

---

## Current focus

- **Active module:** M01 — Project Foundation  
- **Next module (after approval):** M02 — Authentication & User Roles  
- **Sprint reference:** `SPRINT_01_FOUNDATION.md`
