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
4. Attach your custom domain to this project.

## Marketplace API (main deployment)

On the **main** Vercel project, set (optional if using the landing proxy — only needed for direct cross-origin POST):

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
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let data;

    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      return jsonResponse({ ok: false, error: "No payload received" });
    }

    sheet.appendRow([
      data.email || "",
      data.name || "",
      data.roleInterest || "",
      data.region || "",
      data.source || "",
      data.createdAt || new Date().toISOString(),
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this from the editor to test — do NOT click Run on doPost directly. */
function testSheetAppend() {
  doPost({
    postData: {
      contents: JSON.stringify({
        email: "manual-test@example.com",
        name: "",
        roleInterest: "both",
        region: "",
        source: "apps-script-test",
        createdAt: new Date().toISOString(),
      }),
    },
  });
}
```

3. Deploy → **New deployment** (or edit → **New version**)
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← required for Vercel to POST (not “Only myself”)
4. Copy the `/exec` URL into `WAITLIST_SHEETS_WEBHOOK_URL` on the **marketplace** Vercel project → **Redeploy production**.

**Verify public access:** open the `/exec` URL in an incognito window. If you see Google Sign-in, redeploy with **Anyone**.

**Backfill existing Neon signups** (after webhook returns 200):

```bash
# .env needs DATABASE_URL + WAITLIST_SHEETS_WEBHOOK_URL
npm run waitlist:backfill-sheet
npm run waitlist:backfill-sheet -- --dry-run
```

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
