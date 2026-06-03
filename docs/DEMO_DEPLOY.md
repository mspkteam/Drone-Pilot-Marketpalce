# Internal demo deploy (Vercel)

**Not for production.** Demo/mock only — no Stripe, no real SMTP.

## GitHub

- Repo: `https://github.com/MalikTayyabDev/Drone-Marketpalce`
- Branch: `main`

## Vercel environment variables

Set in the Vercel project **Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `file:./dev.db` |
| `AUTH_SECRET` | Random string (32+ chars). Generate: `openssl rand -base64 32` |
| `AUTH_URL` | Your Vercel URL, e.g. `https://your-project.vercel.app` |

**Do not set** `SMTP_URL` or any Stripe keys. Emails log to the build/runtime console only; payments use internal demo pay.

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

- SQLite on serverless: data may not persist across cold starts or regions; fine for UI walkthrough, not load testing.
- Uploaded verification files and generated certificate PDFs use local `storage/` (not durable on Vercel).
- Marketplace and uniform shop payments are **demo internal pay** only.
- No real email delivery without `SMTP_URL`.
- Interim UI (not final Figma); M19 SEO and M20 launch QA deferred.
