# M17 — Public Marketing Pages

**Status:** Ready for Review  
**Depends on:** M01 (Foundation), M05 (pilot directory link), M11 (pricing plans)

---

## Purpose

Replace placeholder marketing shells with real Phase 1 copy, layouts, and CTAs. Pages use the shared `MarketingPage` wrapper and aviation black/white/gold styling.

---

## Pages

| Route | Content |
|-------|---------|
| `/` | Hero + how-it-works summary + CTA (enhanced links) |
| `/for-clients` | Benefits, client workflow, CTA |
| `/for-pilots` | Benefits, pilot journey, CTA |
| `/how-it-works` | Dual client/pilot step flows + trust |
| `/pricing` | Client pay-per-mission + live pilot plans from DB |
| `/about` | Mission and values |
| `/contact` | Contact form (UI-only submit in Phase 1) |
| `/pilots` | M05 directory (linked from nav) |

---

## Components

- `FeatureGrid`, `MarketingSteps`, `MarketingCta`
- `PricingPlans` — reads `SubscriptionPlan` seed data
- `ContactForm` — client-side thank-you state

---

## Out of scope

- Waitlist backend (M18)
- SEO sitemap / analytics (M19)
- Figma-final visual polish (ADR-009)
