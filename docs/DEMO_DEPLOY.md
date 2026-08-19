# Internal demo deploy (Vercel)

**Not for production.** Demo/mock only — no Stripe, no real SMTP.

Production database is **Neon PostgreSQL** (ADR-011). Setup: [`NEON_SETUP.md`](NEON_SETUP.md).

## GitHub

- Repo: `https://github.com/mspkteam/Drone-Pilot-Marketpalce`
- **`main`** — integration (PRs only; Preview on Vercel)
- **`production`** — live testing site (Vercel Production)

See [`GIT_WORKFLOW.md`](GIT_WORKFLOW.md) for the full branch flow.

## Vercel environment variables

**Vercel Git:** set **Production Branch** to `production` (not `main`). See [`GIT_WORKFLOW.md`](GIT_WORKFLOW.md).

Set these in the Vercel project **Settings → Environment Variables** (Production + Preview):

| Variable | Required | Value |
|----------|----------|--------|
| `DATABASE_URL` | **Yes** | Neon **pooled** connection string (`-pooler` host) |
| `DIRECT_URL` or `DATABASE_URL_UNPOOLED` | **Yes** | Neon **direct** connection (for build `db push`) |
| `AUTH_SECRET` | **Yes** | Random string (32+ chars). Generate: `openssl rand -base64 32` |
| `AUTH_URL` | **Yes** | Your Vercel URL, e.g. `https://your-project.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | **Yes** (for uploads) | From Vercel Blob store `drone-pilot-marketpalce-blob` (Storage → Blob). Persists public admin media **and** private files (support, verifications, deliveries, issued PDFs) on Vercel. |

**Do not set** `SMTP_URL` or any Stripe keys. Emails log to the build/runtime console only; payments use internal demo pay.

### `500` / `MIDDLEWARE_INVOCATION_FAILED` on `/login`

Almost always **missing `AUTH_SECRET`** on the Vercel **Production** environment (not only Preview). Auth middleware runs on `/dashboard`; if you still see this on `/login` after a deploy, redeploy after adding variables below.

### Login shows “problem with the server configuration”

Almost always **missing `AUTH_SECRET`** on Vercel (Production **and** Preview). Fix:

1. Generate: `openssl rand -base64 32`
2. Add env var `AUTH_SECRET` with that value (not the placeholder from `.env.example`)
3. Redeploy after saving variables

Also confirm `DATABASE_URL` (Neon pooled) and `DIRECT_URL` are set so login/register can reach the same database you seeded.

Optional: set `AUTH_URL` to your exact Vercel URL (e.g. `https://your-app.vercel.app`). `trustHost` is enabled in code if you omit it.

## Build

`vercel.json` runs: `prisma generate`, `prisma db push --accept-data-loss`, seed (`npx tsx prisma/seed.ts`), then `next build`. (`--accept-data-loss` is required for non-interactive CI when Prisma warns about new unique indexes such as `User.memberNumber`.)

## Demo logins (after seed)

Password for **every** seeded account: `Demo123!`

| Role | Email | What to test |
|------|-------|----------------|
| Super Admin | `admin@dronepilot.local` | Approvals, verifications, disputes, personnel |
| Admin | `ops@dronepilot.local` | Same operational admin tools |
| Moderator | `moderator@dronepilot.local` | Moderation |
| Client (primary) | `client@dronepilot.local` | Projects, bids, chat, contracts, dispute |
| Client (second) | `client-media@dronepilot.local` | Extra pending job in admin queue |
| Pilot A-6 Captain | `pilot@dronepilot.local` | Full marketplace: proposals, contract, messages, payouts, reviews |
| Pilot A-1 … A-7 | `pilot-a1@` … `pilot-a7@dronepilot.local` | Grade visibility delays + Captain’s Club (A-6/A-7) |
| Instructor A-4 | `pilot-a4@dronepilot.local` | Instructor add-on + student code `INSTRUCTOR-A4DEMO` |
| Pending pilot | `pending-pilot@dronepilot.local` | Admin profile approval queue |

### Suggested client walkthrough

1. **Admin** — job queue (`Aerial survey — downtown Austin`, `Oil pad inspection — Eagle Ford`), pending insurance verification, open bridge dispute.
2. **Client** — My Projects: draft, pending, rejected, bidding, assigned, closed. Open **Ranch mapping** messages + delivery. Review bids on **Lake Travis** and **Domain** (shortlisted).
3. **Captain** (`pilot@`) — Proposals: Pending, Revised (shortlisted), Accepted, Rejected, Withdrawn. Contracts + payments. Locked jobs: **Solar farm** (approved ~1h ago).
4. **A-1** — marketplace: cannot bid; solar job still locked; **ACL Festival** visible (approved >48h).

Seed is **idempotent** (upserts demo emails/jobs). It does **not** delete real users the client creates. Re-running seed on Vercel (every Production build) refreshes demo rows only.

## Known demo limitations

- Neon free tier may sleep after inactivity (cold start on first request).
- Uploaded verification files and generated certificate PDFs use local `storage/` (not durable on Vercel).
- Marketplace and uniform shop payments are **demo internal pay** only.
- No real email delivery without `SMTP_URL`.
- Interim UI (not final Figma); M19 SEO and M20 launch QA deferred.
