# M22 — Certificate System (Priority 2)

**Status:** Ready for Review  
**Depends on:** M03 (Pilot profiles), M13 (Admin)

---

## Purpose

Admins define certificate templates and issue downloadable PDF certificates to pilots. Issued records store metadata and files on disk (ready for S3 migration later).

---

## Data model

**CertificateTemplate:** name, slug, title, bodyTemplate (placeholders), isActive

**PilotCertificate:** certificateNumber (unique `DPM-YYYY-######`), pilot, template, issuedAt, issuedByUserId, pdfFileName, notes

**PDF storage:** `storage/certificates/` (gitignored)

### Template placeholders

`{{pilotName}}`, `{{licenseNumber}}`, `{{certificateNumber}}`, `{{issueDate}}`, `{{templateName}}`

---

## Routes

| Route | Access |
|-------|--------|
| `/dashboard/admin/certificates` | Admin — templates, issue, audit |
| `/dashboard/pilot/certificates` | Pilot — download issued PDFs |
| `/dashboard/pilot/verifications` | Pilot — document verifications (M14) |

### APIs

- `GET/POST /api/admin/certificate-templates`
- `PATCH /api/admin/certificate-templates/[id]`
- `GET/POST /api/admin/certificates`
- `GET /api/admin/certificates/[id]/download`
- `GET /api/pilot/certificates`
- `GET /api/pilot/certificates/[id]/download`

---

## Test matrix

| Persona | Expected |
|---------|----------|
| Admin | Create template; issue to approved pilot; download PDF |
| Pilot | List certificates; download own PDF only |
| Pilot | 403 on admin issue APIs |
| Client | No access |

---

## Demo

After seed: `pilot@dronepilot.local` has one **Platform Verified Pilot** certificate.

---

## Out of scope

- Public profile certificate gallery (optional later)
- Pilot self-request certificates
- External CA integration
