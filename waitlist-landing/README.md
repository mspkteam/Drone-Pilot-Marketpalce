# Remote Air Service — Standalone Waitlist Landing

Pre-launch landing page for a **separate Vercel project** and custom domain. Submissions POST to the main marketplace API and are stored in the **same Neon database** (`WaitlistEntry` table).

## Deploy on Vercel

1. In Vercel, **Add New Project** → import this repo.
2. Set **Root Directory** to `waitlist-landing`.
3. Add environment variables:
   - `NEXT_PUBLIC_WAITLIST_API_URL` — marketplace origin, e.g. `https://drone-pilot-marketplace.vercel.app`
   - `NEXT_PUBLIC_WAITLIST_SOURCE` — your landing domain, e.g. `join.remoteairservice.com`
4. Attach your custom domain to this project.

## Marketplace API (main deployment)

On the **main** Vercel project, set:

```env
WAITLIST_ALLOWED_ORIGINS=https://join.remoteairservice.com,https://your-landing.vercel.app
WAITLIST_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

`WAITLIST_ALLOWED_ORIGINS` must include every landing origin so the browser can POST cross-origin.

## Google Sheet (live tracking)

1. Create a Google Sheet with columns: `Email`, `Name`, `Role`, `Region`, `Source`, `Created At`.
2. Extensions → Apps Script → paste:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.email || "",
    data.name || "",
    data.roleInterest || "",
    data.region || "",
    data.source || "",
    data.createdAt || new Date().toISOString(),
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Web app → Anyone can access.
4. Copy the web app URL into `WAITLIST_SHEETS_WEBHOOK_URL` on the **marketplace** project.

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
