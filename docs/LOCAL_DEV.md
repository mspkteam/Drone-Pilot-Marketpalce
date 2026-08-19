# Local development (SQLite)

Work on the app **without Neon** using a SQLite file at `prisma/dev.db`.

## Quick start

1. Copy env file:

   ```powershell
   copy .env.example .env
   ```

   Ensure `.env` includes **`USE_LOCAL_DB=1`** (uses `prisma/dev.db` even if Neon URLs are still present):

   ```env
   USE_LOCAL_DB=1
   DATABASE_URL="file:./prisma/dev.db"
   AUTH_SECRET="your-local-secret-at-least-32-chars"
   ```

2. Create the local database and demo users:

   ```powershell
   npm run db:setup
   ```

If seed fails with `better_sqlite3.node` missing on Windows, run:

```powershell
npm rebuild better-sqlite3
npm run db:seed
```

## Demo logins (after seed)

Password for all seeded accounts: `Demo123!`

| Role | Email |
|------|-------|
| Client | `client@dronepilot.local` |
| Second client | `client-media@dronepilot.local` |
| Captain (A-6) | `pilot@dronepilot.local` |
| Grades A-1–A-7 | `pilot-a1@dronepilot.local` … `pilot-a7@dronepilot.local` |
| Pending pilot | `pending-pilot@dronepilot.local` |
| Admin | `admin@dronepilot.local` |

Full walkthrough: [`DEMO_DEPLOY.md`](DEMO_DEPLOY.md).

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run db:setup` | `generate` + `db push` + seed |
| `npm run db:push` | Apply schema changes to `dev.db` |
| `npm run db:seed` | Re-run seed only |
| `npm run db:studio` | Open Prisma Studio on local DB |

## Switching to Neon later

1. In `prisma/schema.prisma`, change the datasource provider to `postgresql`.
2. Set `USE_NEON=1` and Neon URLs in `.env` (`DATABASE_URL` pooled, `DIRECT_URL` direct). See [`NEON_SETUP.md`](NEON_SETUP.md).
3. Sync the remote database:

   ```powershell
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. Redeploy with PostgreSQL env vars on Vercel (build runs `db push` against Neon).

**Driver selection:**

- **Development (default):** local SQLite — Neon URLs in `.env` are ignored
- **`USE_NEON=1` + postgresql provider:** Neon adapter

## Notes

- `prisma/dev.db` is gitignored — each developer has their own local data.
- Vercel/production builds expect **PostgreSQL**; use the Neon switch steps before deploying.
