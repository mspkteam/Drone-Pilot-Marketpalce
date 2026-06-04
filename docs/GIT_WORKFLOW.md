# Git branch workflow

**Repository:** [mspkteam/Drone-Pilot-Marketpalce](https://github.com/mspkteam/Drone-Pilot-Marketpalce)

## Stable branch

- **`main`** — always the clean, stable demo branch. Do not push experimental work directly to `main`.

## Starting new work

```bash
git checkout main
git pull origin main
git checkout -b feature/name-of-change
```

Example branch names:

- `feature/membership-tiers`
- `feature/dashboard-redesign`
- `feature/support-chat`
- `fix/dashboard-layout`
- `ui/pilot-profile-redesign`

## Finishing a task

```bash
git add .
git commit -m "Clear message describing the change"
git push -u origin feature/name-of-change
```

Open a pull request on GitHub, review, then merge into `main`.

## Secrets

Never commit:

- `.env` or `.env*.local`
- API keys, Stripe keys, SMTP credentials
- `dev.db` or other local databases
- `/storage/` uploads

Use `.env.example` for documented variable names only.

## Vercel

- **`main`** → stable demo deployment
- **Feature branches** → preview deployments (demo mode; no real payments or email)

## `main` branch protection (GitHub)

Enable in **Settings → Branches → Branch protection rules** for `main`:

- Require a pull request before merging
- Restrict direct pushes to `main`
- Require status checks to pass (when CI is configured)

Cannot be enabled from this repo alone without GitHub admin access on the new account.
