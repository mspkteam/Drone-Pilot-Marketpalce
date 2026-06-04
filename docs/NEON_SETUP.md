# Neon PostgreSQL setup

The app uses **Neon** for the database ([ADR-011](DECISIONS.md)). Prisma 7 connects with `@prisma/adapter-neon` at runtime and a **direct** URL for CLI commands.

## 1. Create a Neon project

1. Sign in at [neon.tech](https://neon.tech).
2. Create a project (e.g. `drone-pilot-marketplace`).
3. Open **Connect** and copy both connection strings:
   - **Pooled** — hostname contains `-pooler` → `DATABASE_URL`
   - **Direct** — no `-pooler` → `DIRECT_URL`

Both should include `?sslmode=require`.

Example shape:

```ini
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## 2. Local `.env`

Copy `.env.example` to `.env` and paste your Neon strings. **Do not commit `.env`.**

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

Also set `AUTH_SECRET` (32+ random characters).

## 3. Create schema and seed

Uses `DIRECT_URL` (or `DATABASE_URL`) via `prisma.config.ts`:

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Demo logins after seed: `client@dronepilot.local` / `Demo123!` (see README).

## 4. Vercel

In the Vercel project (**mspkteam/Drone-Pilot-Marketpalce**), set **Environment Variables** (Production + Preview):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon **pooled** connection string |
| `DIRECT_URL` or `DATABASE_URL_UNPOOLED` | Yes | Neon **direct** string (for `prisma db push` in build) |
| `AUTH_SECRET` | Yes | Random 32+ chars |
| `AUTH_URL` | Yes | e.g. `https://your-app.vercel.app` |

Do **not** set `DATABASE_URL=file:./dev.db` on Vercel.

Build command (in `vercel.json`) runs `prisma db push` and seed against Neon.

## 5. Optional: migrations

For production you may switch from `db push` to versioned migrations:

```bash
npx prisma migrate dev --name init
```

Use `DIRECT_URL` for migrate commands.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL is not set` | Add pooled Neon URL to `.env` / Vercel |
| `DIRECT_URL` / CLI errors on migrate | Add direct (non-pooler) URL |
| P1001 connection timeout | Check Neon project is active; cold start may take a few seconds |
| Old SQLite `file:./dev.db` | Replace with Neon URLs; SQLite is no longer used |

Reference: [Neon — Connect from Prisma](https://neon.com/docs/guides/prisma)
