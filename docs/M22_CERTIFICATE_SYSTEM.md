# M22 — Certificate System

**Status:** Implemented (v0.27.13+)  
**Depends on:** M03 (Pilot profiles), M13 (Admin), M15 (Wings)

---

## Purpose

Admins define certificate templates from **client fillable PNG artwork**, drag-align overlay fields with named fonts (Engravers MT, Harrowgate, Colchester, Arial), and issue downloadable PDFs — manually or automatically when conditions are met.

---

## Data model

**CertificateTemplate:** name, slug, title, bodyTemplate, backgroundImageUrl, layoutKey, overlayPositionsJson, autoRule, ruleParam, threshold, isActive

**PilotCertificate:** certificateNumber (`DPM-YYYY-######`), pilot, template, awardGrade, issuedAt, issuedByUserId, pdfFileName, notes

**PDF storage:** `storage/certificates/` (gitignored)  
**Fonts:** `public/fonts/` + `src/assets/fonts/` (Engravers MT, Harrowgate, Colchester)

### Overlay fields

`pilotName`, `gradeOrTitle`, `issuedAt`, `awardDateShort`, `certificateNumber`, `memberNumber`, `day`, `month`, `year`

### Auto rules

| Rule | When |
|------|------|
| `manual_only` | Admin issue only |
| `grade_promotion_a1_a5` | Active grade A-1…A-5 (one cert per grade title) |
| `grade_captain_a6` | Grade A-6 Captain |
| `wing_recreational` | Recreational / UAS wing earned |
| `wing_aviator` | Basic aviator wing earned |
| `hours_or_perfect_contracts_senior` | 5× 5★ completed contracts or senior wing |
| `hours_or_perfect_contracts_master` | 10× 5★ completed contracts or master wing |

Evaluation runs via `evaluatePilotAwards()` (wings first, then certificates) on membership, booking, review, verification, and profile approval paths.

### Template placeholders

`{{pilotName}}`, `{{licenseNumber}}`, `{{certificateNumber}}`, `{{issueDate}}`, `{{templateName}}`, `{{gradeOrTitle}}`

---

## Canonical fillable templates

Six RAS fillable PNGs under `/certificates/*-fillable.png` (examples on disk are reference-only, not seeded as active templates).

---

## Routes

| Route | Access |
|-------|--------|
| `/dashboard/admin/certificates` | Admin — builder, issue, audit |
| `/dashboard/pilot/certificates` | Pilot — download issued PDFs |

### APIs

- `GET/POST /api/admin/certificate-templates`
- `PATCH /api/admin/certificate-templates/[id]`
- `POST /api/admin/certificate-templates/upload`
- `GET/POST /api/admin/certificates`
- `GET /api/admin/certificates/[id]/download`
- `GET /api/pilot/certificates`
- `GET /api/pilot/certificates/[id]/download`

---

## Out of scope

- Public profile certificate gallery
- Pilot self-request certificates
- External CA integration
