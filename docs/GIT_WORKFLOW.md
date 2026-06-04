# Git branch workflow (testing phase)

**Repository:** [mspkteam/Drone-Pilot-Marketpalce](https://github.com/mspkteam/Drone-Pilot-Marketpalce)

## Branch roles

| Branch | Purpose | Vercel |
|--------|---------|--------|
| **`main`** | Stable integration — merge PRs here after review | **Preview only** (not production) |
| **`production`** | Live demo / testing site | **Production** deployment |
| **`feature/*`**, **`fix/*`**, **`ui/*`** | Day-to-day work | Preview per branch |

During testing, **never treat `main` as the live site**. Only **`production`** is what users hit on your production URL.

## Daily workflow

### 1. Start work (not on `main` or `production`)

```bash
git checkout main
git pull origin main
git checkout -b feature/name-of-change
```

Examples: `feature/support-chat`, `ui/dashboard-polish`, `fix/login-error`

### 2. Push your branch → Preview deploy

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/name-of-change
```

Vercel builds a **Preview** URL for that branch (check GitHub commit status or Vercel dashboard).

### 3. Merge into `main` (via Pull Request)

On GitHub: open a **Pull Request** into `main`. Review, then merge.

- `main` stays protected (no direct pushes if branch protection is on).
- Merging to `main` does **not** update the live site while Production Branch is `production`.

### 4. Ship to live testing → merge `main` into `production`

When the integration on `main` is ready for the public demo URL:

```bash
git checkout production
git pull origin production
git merge main
git push origin production
```

Or open a PR: **`main` → `production`** on GitHub and merge.

That push triggers the **Production** deployment on Vercel.

## One-time setup (you must do in dashboards)

### GitHub — protect `main`

**Settings → Branches → Add rule** for branch `main`:

- Require a pull request before merging
- Do not allow bypassing the above settings (recommended)
- Restrict who can push (optional: admins only)
- Block force pushes

`production` can stay mergeable by PR from `main` without the same strict rules during testing, or protect it too if you want only PRs to go live.

### Vercel — Production Branch = `production`

**Project → Settings → Git → Production Branch**

1. Change from `main` to **`production`**
2. Save

Result:

- Pushes to **`production`** → your production domain
- Pushes to **`main`** and feature branches → Preview only

### Vercel — environment variables

Set for **Production** and **Preview** (same Neon project is fine for testing):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_URL` or `DATABASE_URL_UNPOOLED` | Neon **direct** URL |
| `AUTH_SECRET` | 32+ random characters |
| `AUTH_URL` | Your **production domain** (Settings → Domains), no trailing slash |

Redeploy **Production** after changing env vars.

### Neon

Neon does not use “git branches.” One Neon project = one database; connection strings go in Vercel env vars.

- **Testing:** Production and Preview on Vercel can share the same Neon URLs (simplest).
- **Later:** Optional [Neon branch](https://neon.tech/docs/introduction/branching) for a staging DB — separate `DATABASE_URL` on Preview only.

## Secrets

Never commit:

- `.env` or `.env*.local`
- API keys, Stripe keys, SMTP credentials
- `dev.db` or `/storage/` uploads

Use `.env.example` for variable names only.

## Quick reference

```
feature/xyz  ──PR──►  main  ──merge when ready──►  production  ──►  Vercel Production
     │                  │
     └── Preview        └── Preview (not live)
```
