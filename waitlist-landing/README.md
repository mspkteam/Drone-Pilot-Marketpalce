# Remote Air Service — Standalone Waitlist Landing

Pre-launch landing page for a **separate Vercel project** and custom domain. Submissions POST to the main marketplace API and are stored in the **same Neon database** (`WaitlistEntry` table).

## Deploy on Vercel

**Use a separate Vercel project** — do not link this folder to `drone-pilot-marketpalce` (the main app runs Prisma on build and will fail here).

### Dashboard

1. **Add New Project** → import this repo (same repo as the marketplace is fine).
2. Set **Root Directory** to `waitlist-landing` (type the path manually if the picker only shows the repo name).
3. Add environment variables:

### CLI (from `waitlist-landing/`)

```bash
npx vercel project add ras-waitlist-landing   # once
npx vercel link --yes --project ras-waitlist-landing
npx vercel --prod
```

4. Add environment variables:
   - `WAITLIST_API_URL` — marketplace origin (server proxy; recommended), e.g. `https://drone-pilot-marketplace.vercel.app`
   - `NEXT_PUBLIC_WAITLIST_SOURCE` — your landing domain, e.g. `join.remoteairservice.com`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key (spam protection)
4. Attach your custom domain to this project.

## Marketplace API (main deployment)

On the **main** Vercel project, set (optional if using the landing proxy — only needed for direct cross-origin POST):

```env
WAITLIST_ALLOWED_ORIGINS=https://join.remoteairservice.com,https://your-landing.vercel.app
WAITLIST_MAKE_WEBHOOK_URL=https://hook.us1.make.com/xxxxxxxx
```

`WAITLIST_ALLOWED_ORIGINS` must include every landing origin so the browser can POST cross-origin.

## Google Sheet via Make.com (recommended)

Each new waitlist signup POSTs JSON to your Make webhook; Make appends a row to Google Sheets.

### 1. Google Sheet

Create a sheet with row 1 headers:

`Email` · `Name` · `Role` · `Region` · `Source` · `Created At`

### 2. Make scenario

1. [make.com](https://www.make.com) → **Create a new scenario**
2. **Module 1 — Webhooks → Custom webhook**
   - Add item structure (or run once and use automatic detection):
     - `email` (text)
     - `name` (text)
     - `roleInterest` (text)
     - `region` (text)
     - `source` (text)
     - `createdAt` (text)
   - Copy the webhook URL (e.g. `https://hook.us1.make.com/...`)
3. **Module 2 — Google Sheets → Add a row**
   - Connect your Google account
   - Select the spreadsheet and sheet
   - Map columns from the webhook bundle:
     - Email ← `email`
     - Name ← `name`
     - Role ← `roleInterest`
     - Region ← `region`
     - Source ← `source`
     - Created At ← `createdAt`
4. **Save** → turn the scenario **ON**

### 3. Vercel (marketplace project)

```env
WAITLIST_MAKE_WEBHOOK_URL=https://hook.us1.make.com/your-hook-id
```

Redeploy **production** after saving.

### Cloudflare Turnstile (spam protection)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Turnstile** → **Add site**
2. Add your domains (e.g. `join.remoteairservice.com`, `ras-waitlist-landing.vercel.app`, marketplace `/launch` host)
3. Copy **Site key** and **Secret key**
4. **Marketplace** Vercel project:
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAAA...
   ```
5. **Waitlist landing** Vercel project (site key only — verification runs on marketplace API):
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
   ```

Until keys are set, forms work without CAPTCHA (backward compatible).

### 4. Test

Submit a **new email** on the waitlist landing. A row should appear in the sheet within seconds.

### 5. Backfill existing Neon signups

```bash
# .env needs DATABASE_URL + WAITLIST_MAKE_WEBHOOK_URL
npm run waitlist:backfill-sheet -- --dry-run
npm run waitlist:backfill-sheet
```

> **Legacy:** `WAITLIST_SHEETS_WEBHOOK_URL` still works for Google Apps Script web apps (form-encoded payload).

Admins can also view all signups at `/dashboard/admin/waitlist` in the marketplace app.

## Local dev

```bash
cd waitlist-landing
npm install
cp .env.example .env.local
# Edit NEXT_PUBLIC_WAITLIST_API_URL to http://localhost:3000
npm run dev
```

Landing runs on http://localhost:3001.

## Preview in main app

`/launch` on the marketplace app uses the same copy and API (same-origin, no CORS).

## Launch day

When the marketplace opens, use `WaitlistEntry` emails from the admin panel (or Sheet) to send credentials. Status field supports `subscribed` / `unsubscribed` for future campaigns.
