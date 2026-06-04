# Internal demo deploy (Vercel)

**Not for production.** Demo/mock only — no Stripe, no real SMTP.

Production database is **Neon PostgreSQL** (ADR-011). Setup: [`NEON_SETUP.md`](NEON_SETUP.md).

## GitHub

- Repo: `https://github.com/mspkteam/Drone-Pilot-Marketpalce`
- Branch: `main`

## Vercel environment variables

Set these in the Vercel project **Settings → Environment Variables** (Production + Preview):

| Variable | Required | Value |
|----------|----------|--------|
| `DATABASE_URL` | **Yes** | Neon **pooled** connection string (`-pooler` host) |
| `DIRECT_URL` or `DATABASE_URL_UNPOOLED` | **Yes** | Neon **direct** connection (for build `db push`) |
| `AUTH_SECRET` | **Yes** | Random string (32+ chars). Generate: `openssl rand -base64 32` |
| `AUTH_URL` | **Yes** | Your Vercel URL, e.g. `https://your-project.vercel.app` |

**Do not set** `SMTP_URL` or any Stripe keys. Emails log to the build/runtime console only; payments use internal demo pay.

### Login shows “problem with the server configuration”

Almost always **missing `AUTH_SECRET`** on Vercel (Production **and** Preview). Fix:

1. Generate: `openssl rand -base64 32`
2. Add env var `AUTH_SECRET` with that value (not the placeholder from `.env.example`)
3. Redeploy after saving variables

Also confirm `DATABASE_URL` (Neon pooled) and `DIRECT_URL` are set so login/register can reach the same database you seeded.

Optional: set `AUTH_URL` to your exact Vercel URL (e.g. `https://your-app.vercel.app`). `trustHost` is enabled in code if you omit it.

## Build

`vercel.json` runs: `prisma generate`, `prisma db push`, seed (`npx tsx prisma/seed.ts`), then `next build`.

## Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@dronepilot.local` | `Demo123!` |
| Moderator | `moderator@dronepilot.local` | `Demo123!` |
| Pilot | `pilot@dronepilot.local` | `Demo123!` |
| Client | `client@dronepilot.local` | `Demo123!` |

## Known demo limitations

- Neon free tier may sleep after inactivity (cold start on first request).
- Uploaded verification files and generated certificate PDFs use local `storage/` (not durable on Vercel).
- Marketplace and uniform shop payments are **demo internal pay** only.
- No real email delivery without `SMTP_URL`.
- Interim UI (not final Figma); M19 SEO and M20 launch QA deferred.
