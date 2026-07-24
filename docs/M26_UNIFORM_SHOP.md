# M26 — Uniform Shop

**Version:** 0.25.0  
**Depends on:** M02 (Auth), M03 (Pilot)

## Overview

Pilots purchase branded apparel through a **separate shop** from marketplace job payments. Catalog includes products with size/color **variants**, stock tracking, flat-rate shipping, and order + **payment status** workflows (internal demo pay — no Stripe).

## Data model

- `UniformProduct` — catalog item (`minTierCode`, `exactTierCode`, `requiredWingCode` gate pilot visibility/orders)
- `UniformProductVariant` — SKU, price, stock
- `UniformOrder` — shipping address, subtotal, shipping, total, `status`, `paymentStatus`
- `UniformOrderItem` — line snapshots

### Eligibility (pilot shop)

| Field | Behavior |
|-------|----------|
| `minTierCode` | Pilot membership grade must be at least this tier (e.g. Captain polo → `A6_CAPTAIN`) |
| `exactTierCode` | Must match current grade exactly (epaulettes) |
| `requiredWingCode` | Pilot must already hold that wing award |

Unset fields = no restriction. Admin configures these on product Advanced tab.

### Order status

`pending_payment` → `paid` → `processing` → `shipped` → `delivered` (or `cancelled`)

### Payment status (shop only)

`pending` | `paid` | `failed` | `refunded`

## APIs

| Method | Path | Role |
|--------|------|------|
| GET | `/api/pilot/shop/products` | Pilot |
| GET/POST | `/api/pilot/shop/orders` | Pilot |
| GET | `/api/pilot/shop/orders/[id]` | Pilot |
| POST | `/api/pilot/shop/orders/[id]/pay` | Pilot (demo internal pay) |
| GET/POST | `/api/admin/shop/products` | Super Admin |
| PATCH | `/api/admin/shop/products/[id]` | Super Admin |
| POST | `/api/admin/shop/products/[id]/variants` | Super Admin |
| PATCH | `/api/admin/shop/variants/[id]` | Super Admin |
| GET | `/api/admin/shop/orders` | Moderator+ |
| PATCH | `/api/admin/shop/orders/[id]` | Moderator+ |

## UI

- Pilot: `/dashboard/pilot/shop`, `/dashboard/pilot/shop/orders`, order detail with Pay now (demo)
- Admin: `/dashboard/admin/shop` — orders tab (all admins), catalog tab (Super Admin)

## Seed

Three products with variants (polo, jacket, cap).

## Smoke test

1. `npm run db:push && npm run db:seed`
2. `pilot@dronepilot.local` → **Uniform Shop** → add to cart → checkout → **Pay now (demo)**
3. `moderator@dronepilot.local` → **Uniform Shop** → set order to processing/shipped
4. `admin@dronepilot.local` → catalog tab → add product/variant
