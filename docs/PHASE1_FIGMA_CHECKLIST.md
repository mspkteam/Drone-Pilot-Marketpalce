# Phase 1 Figma Comparison Checklist

**Active milestone:** Week 1 / Phase 1 — Client (`ACTIVE_MILESTONE = 1`)  
**Figma file:** [remote-air-service](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service)  
**Figma page:** `client dashboard` (page id `69:1732`)  
**Process:** A functionality → B Figma compare → C gap list → D UI update → E wire data → F remove mocks → G test → H lock future phases → I sign-off

> **Note:** Older dashboard log references (`179:1002`, `361:911`) are stale. Current frames live under page `69:1732`.

---

## Figma frame index (Phase 1 client)

| Screen | Figma frame | Node ID |
|--------|-------------|---------|
| Dashboard overview | dashboard | `69:1733` |
| Post a Project (service step) | Post a Project | `69:2163` → **`808:10109`** |
| Post a Project (location) | Post a Project - location | `69:2801` → **`808:11231`** |
| Post a Project (requirements) | Post a Project - requirements | `69:3698` → **`808:10483`** |
| Post a Project (budget) | Post a Project - BUDGET & TIMELINE | `69:4603` → **`808:10843`** |
| Post a Project (review) | Post a Project - Review | **`808:16145`** |
| Post a Project (T&C modal) | Terms overlay on submit | **`808:16496`** |
| My Projects (tabs) | my projects - * | `69:5511` … `69:8065` |
| Project Quotes | Project Quotes | `69:8430` |
| Find Pilots | Find Pilots | `69:8897` |
| Messages | Messages | `69:9482` |
| Billing | Billing | `69:9877` |
| Settings | Settings | `69:10280` |

**Not in Figma client page:** Project detail overview, Disputes list, extended Profile editor (onboarding). These remain functional routes with interim UI derived from adjacent Figma patterns.

---

## Checklist

| Screen / area | Current status | Figma difference | Functionality impact | Required code update | Priority | Status |
|---------------|----------------|------------------|----------------------|----------------------|----------|--------|
| **Client shell / sidebar** | Implemented; live nav + milestone lock | Figma: Workspace (Dashboard, Post a Project, My Projects, Project Quotes, Find Pilots) + Account (Messages, Billing, Settings). No Disputes/Profile in sidebar. User card shows real name when wired. | Nav IA must match Figma; Disputes/Profile still reachable via routes | Align `dashboard-client.ts` order/labels; wire shell user from `ClientProfile`; add Disputes link in Settings | **High** | Done |
| **Dashboard overview** | Live API (`getClientDashboardOverviewData`) | Structure matches Figma (`69:1733`): welcome → 4 stats → recent projects + activity → recommended pilots | None — data already live | Use first name in welcome (Figma: “John” not full name); verify empty states | **Medium** | Done |
| **Post a Project wizard** | Live create/submit + `postProjectJson`; steps 1–5 wired | Updated frames `808:10109`–`808:16496` | Travel + terms persist in `postProjectJson`; T&C modal on submit | Location split; budget travel; review summary; T&C checkbox + modal | **High** | Done |
| **My Projects** | Live `GET /api/client/jobs` + status tabs | Header, tabs, cards match Figma tab frames | None | Tab empty states already wired; minor spacing pass if needed | **Low** | Done |
| **Project detail** | Live overview + edit mode | No dedicated Figma frame; uses generic `PageHeader` + Tailwind cards | Flow works; visual inconsistency | Restyle `ClientJobOverview` + page header to client dashboard tokens | **High** | Done |
| **Project Quotes (bids)** | Live bids API, filter, shortlist, decline, accept | Figma title **Project Quotes**; page used “Project Bids” | Terminology only | Rename page heading/copy to “Project Quotes”; keep `/quotes` route | **Medium** | Done |
| **Find Pilots** | Live public pilot directory in shell | Matches `69:8897` layout pattern | None | Verify card grid responsive pass | **Low** | Done |
| **Messages** | Live `/api/client/conversations` | Two-panel inbox matches `69:9482` | None | None | **Low** | Done |
| **Disputes** | Live list/detail API | **Not in Figma sidebar**; list UI implemented | Phase 1 requires dispute access | Keep route; add Settings shortcut; document Figma gap | **Medium** | Done |
| **Billing** | Page exists; **Milestone 4** payments lock | Matches `69:9877`; label “Billing & Payments” | Locked until Week 4 for normal users | No UI change; milestone guard unchanged | **Low** | Done |
| **Settings** | Live profile + notification prefs in DB | Figma: centered 768px column; Profile info + Notifications only; “New quotes” label | Extra sections (company, password) beyond Figma but needed | Center layout; rename “New bids” → “New quotes”; remove mock fallbacks; add Disputes link | **High** | Done |
| **Profile (extended)** | `/dashboard/client/profile` + onboarding | Figma merges basic fields into Settings; extended profile is onboarding-only | Onboarding gate must remain | Remove Profile from sidebar; keep route + settings link | **Medium** | Done |
| **Milestone locks** | `MilestoneRouteGuard` + `ACTIVE_MILESTONE=1` | N/A | Week 2–5 routes show locked message | No regression | **High** | Done |
| **Recommended pilots pricing** | Shows hourly/daily from DB | Figma shows “from $X/day” | Display format differs when only hourly rates exist | Map rates to “from …” copy | **Low** | Done |
| **Accept bid → booking** | Accept API works; booking page locked M3 | N/A | Redirect hits locked milestone | Keep accept flow; show success on quotes page if booking locked | **Medium** | Done |

---

## Implementation log (this pass)

| Date | Item | Status |
|------|------|--------|
| 2026-06-02 | Figma MCP metadata + frame `69:1733` design context | Done |
| 2026-06-02 | Checklist created | Done |
| 2026-06-02 | Shell user wiring, nav alignment, welcome first name | Done |
| 2026-06-02 | Project detail + Settings + Project Quotes title | Done |
| 2026-06-02 | New Post Project frames `808:10109`–`808:16496` mapped; travel + T&C gaps logged | Done |
| 2026-06-02 | Post Project wizard: location split, travel coverage, review summary, T&C modal | Done |
| 2026-06-02 | T&C acknowledgment opens modal; checkbox completes in modal | Done |
| 2026-06-02 | Recommended pilot day-rate copy; accept-quote inline success when bookings locked | Done |

---

## Phase 1 sign-off criteria

- [x] All checklist **High** items **Done**
- [x] Client flow works end-to-end on live data (no mock fallbacks on Phase 1 pages)
- [x] Sidebar matches Figma IA; Disputes reachable without breaking milestone locks
- [x] `npm run test:all` and `npx next build` pass
- [ ] Product visual approval against Figma page `69:1732`

| Step | Figma node | Route / component | Gap vs code |
|------|------------|-------------------|-------------|
| 1 Service | [808:10109](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-10109) | `PostProjectStepService` | Largely aligned (service grid + progress) |
| 2 Location | [808:11231](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-11231) | `PostProjectStepLocation` | Done — City / Country / State fields |
| 3 Requirements | [808:10483](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-10483) | `PostProjectStepRequirements` | Done |
| 4 Budget | [808:10843](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-10843) | `PostProjectStepBudget` | Done — travel coverage + expense inputs |
| 5 Review | [808:16145](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-16145) | `PostProjectStepReview` | Done — travel summary + T&C checkbox |
| T&C modal | [808:16496](https://www.figma.com/design/6E3XlFsDuajsjYjf4LiOPZ/remote-air-service?node-id=808-16496) | `PostProjectTermsModal` | Done |

**Suggested implementation order:** Location fields → Budget travel → Review travel summary → T&C checkbox → T&C modal on submit.

---

## Post a Project — new Figma detail (`808:*`)
