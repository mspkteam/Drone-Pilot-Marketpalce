# Development Roadmap — Post-MVP Features

**Current focus:** Priority 1 → 7 in order. One module at a time until production-ready.

## Deferred (do not implement now)

- Stripe Payments Integration
- Stripe Connect Pilot Payouts
- SMTP / Real Email Infrastructure
- SEO & Analytics (M19)
- QA, Accessibility & Launch Preparation (M20)
- Production publishing / hosting

Architecture may reference future payment/email hooks; no implementation.

---

## Priority queue

| P | Module | Status | Doc |
|---|--------|--------|-----|
| 1 | **Messaging System** | Ready for Review | `M21_MESSAGING.md` |
| 2 | Certificate System | Ready for Review | `M22_CERTIFICATE_SYSTEM.md` |
| 3 | Dispute Resolution | Ready for Review | `M23_DISPUTE_RESOLUTION.md` |
| 4 | Verification Uploads | Ready for Review | `M24_VERIFICATION_UPLOADS.md` |
| 5 | Dashboard Completion | Ready for Review | `M25_DASHBOARD_COMPLETION.md` |
| 6 | Digital Wings (M15) | Ready for Review | `M15_DIGITAL_WINGS.md` |
| 7 | Uniform Shop | Ready for Review | `M26_UNIFORM_SHOP.md` |

---

## Rules

- Do not refactor working modules unless required for the active priority.
- Preserve existing marketplace flows.
- Database relations, APIs, validation, and UI for each module.
- Update `BUILD_CONTROL.md` when a priority ships.
