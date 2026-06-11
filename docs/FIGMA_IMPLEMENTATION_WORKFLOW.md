# Figma → Implementation Workflow

Controlled screen-by-screen build loop for Drone Pilot Marketplace UI (ADR-009).

**Inputs per screen (from product/design):**

1. **Figma page/frame URL** — visual source of truth (layout, spacing, type, color, components, responsive)
2. **Written layout summary** — functional source of truth (purpose, sections, flow, business logic, implementation notes)

Both must be used together. Do not implement from only one source.

---

## Per-screen process

1. Read Figma frame via Figma MCP (`get_design_context`, `get_screenshot` as needed)
2. Read written layout summary
3. Inspect current routes, components, layouts, modules, docs
4. Compare Figma vs current implementation
5. Document gaps; split missing functionality into separate module/tasks
6. Publish **pre-implementation review** (see below) — **no code until review is done**
7. Implement screen accurately
8. Update [`figma-implementation-log.md`](figma-implementation-log.md) and relevant module docs if needed

---

## Pre-implementation review (required)

### Figma Screen Review

- Page/screen name
- Route/page mapping
- Main purpose
- Main layout structure
- Key UI sections
- Key user actions
- Required data
- Existing project match
- Missing items
- Recommended implementation approach

### Figma vs Written Summary Notes

- In Figma but not in summary
- In summary but not in Figma
- Conflicts between sources
- Assumptions before implementation

### Existing Project Comparison

- Matching routes
- Reusable components / layouts
- Connected modules
- Missing routes, components, data, functionality
- Conflicts with completed modules

### Missing Module Checklist

For each gap, document:

| Field | Content |
|-------|---------|
| Module/task name | |
| Why needed | |
| Where in Figma | |
| Required UI | |
| Required functionality | |
| Files/routes affected | |
| Priority | High / Medium / Low |
| Status | Pending Implementation |

Do not silently skip implied functionality.

---

## Implementation rules

- Do not overwrite unrelated modules or break completed work
- Do not change business logic unless this screen requires it
- No extra sections not in Figma; no unnecessary simplification
- Reuse existing components; create new ones only when needed
- Responsive: desktop, tablet, mobile
- Accessibility: semantic HTML, contrast, labels, keyboard support
- Mock data only where needed; mark clearly
- Placeholder UI OK for missing backend; document future logic

---

## Design accuracy

Match Figma for structure, section order, grid, cards, chrome (header/sidebar/footer), buttons, forms, icons, type hierarchy, color, borders, radius, shadows, spacing, empty/status states, tables, modals, responsive behavior.

Style direction: professional, aviation-inspired, marketplace-focused.

---

## Post-implementation

Update [`figma-implementation-log.md`](figma-implementation-log.md) with:

- Date, frame name, URL, route
- Components created / reused
- Files created / updated
- Missing modules found and tasks created
- Notes, assumptions, status

If a missing module is significant, also note it in [`BUILD_CONTROL.md`](BUILD_CONTROL.md) or the relevant module doc (e.g. `M17_MARKETING_PAGES.md`) without duplicating long content.

---

## Related docs

- [`DESIGN_AND_FORMS_ROADMAP.md`](DESIGN_AND_FORMS_ROADMAP.md) — ADR-009/010 scope
- [`DECISIONS.md`](DECISIONS.md) — ADR-009 Figma as source of truth
- [`BUILD_CONTROL.md`](BUILD_CONTROL.md) — module status
- [`globals.css`](../src/app/globals.css) — interim tokens (update from Figma variables when defined)
