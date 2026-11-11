# Sniff Pet Kuaför

Website, admin panel and (later) online appointment requests for **Sniff Pet Kuaför**, a cat and dog grooming shop in Gölbaşı, Ankara. Turkish-only, mobile-first, built to run at €0/month.

> **Status:** M0 (setup). A branded "Çok yakında" page is live; the real site arrives in M2. See the [milestones](docs/PLAN.md#6-milestones-moscow-m0m4--must-the-mvp-launch-m5m6--could-booking).

## Documentation

| Document | What's in it |
|---|---|
| [`docs/SPEC.md`](docs/SPEC.md) | Requirements (source of truth) |
| [`docs/PLAN.md`](docs/PLAN.md) | Architecture, database design, routes, hosting, milestones, risks, threat model |
| [`docs/decisions.md`](docs/decisions.md) | Architecture Decision Records |
| [`CLAUDE.md`](CLAUDE.md) | Conventions, module rules, commands |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Zod · Vitest · Playwright + axe · GitHub Actions · Netlify. The reasoning behind each choice is in [`docs/decisions.md`](docs/decisions.md).

## Local setup

Requirements:
- Node.js 24+ (see `.nvmrc`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), for the local Supabase database (from M1)

```bash
npm ci                                  # install exact dependency versions
cp .env.example .env.local              # local environment variables
npm run dev                             # http://localhost:3000
```

Before opening a pull request, run everything CI runs:

```bash
npx playwright install chromium         # once, downloads the test browser
npm run verify                          # lint, format, types, unit tests, build, e2e + accessibility
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run format` / `npm run format:check` | Prettier write / check |
| `npm test` | Unit and integration tests (Vitest) |
| `npm run test:e2e` | Build, then end-to-end + accessibility tests (Playwright + axe) |
| `npm run db:start` / `db:stop` / `db:reset` | Local Supabase in Docker (from M1) |

## Environment variables

See [`.env.example`](.env.example). Real values live only in `.env.local` (git-ignored), the Netlify UI and GitHub Actions secrets.

## Deployment

Netlify (ADR-003):
- Pull requests get free deploy previews.
- `main` is a free branch deploy.
- The **`production`** branch is the live site; a release is a PR `main → production`.

## Running costs & limits

*To be completed in M4.* Target: €0/month on the Netlify Free and Supabase Free plans. See PLAN §5 and §8 for the limits and mitigations.
