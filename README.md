# Sniff Pet Kuaför

Website, admin panel and (later) online appointment requests for **Sniff Pet Kuaför**, a cat and dog grooming shop in Gölbaşı, Ankara. Turkish-only, mobile-first, built to run at €0/month.

> **Status:** M1 (data layer). A branded "Çok yakında" page is live; the database, demo content and tests are in place; the real site arrives in M2. Progress: [project board](https://github.com/users/Halidx1/projects/2) and [milestones](https://github.com/Halidx1/sniff-pet-kuafor/milestones). See the [milestones](docs/PLAN.md#6-milestones-moscow-m0m4--must-the-mvp-launch-m5m6--could-booking).

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
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running, for the local Supabase database

```bash
npm ci                                  # install exact dependency versions
npm run db:start                        # local Supabase in Docker: applies migrations + seed (first run downloads a few GB)
cp .env.example .env.local              # local environment variables
npm run -s db:env >> .env.local         # append the local Supabase URL and keys
npm run seed:media                      # upload the demo images to local Storage
npm run dev                             # http://localhost:3000
```

Local Supabase Studio (a database UI) runs at http://127.0.0.1:54323. The local keys only work on your machine and are the same for every developer, so they aren't secrets.

Before opening a pull request, run everything CI runs:

```bash
npx playwright install chromium         # once, downloads the test browser
npm run verify                          # lint, format, types, pgTAP, unit + integration, build, e2e + accessibility
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run format` / `npm run format:check` | Prettier write / check |
| `npm test` | Unit and integration tests (Vitest; integration tests need `db:start`) |
| `npm run test:db` | Database tests: RLS, grants, constraints, triggers (pgTAP) |
| `npm run test:e2e` | Build, then end-to-end + accessibility tests (Playwright + axe) |
| `npm run db:start` / `db:stop` | Start / stop local Supabase in Docker |
| `npm run db:reset` | Re-apply all migrations and SQL seed (then re-run `seed:media`) |
| `npm run db:types` | Regenerate `src/shared/supabase/database.types.ts` after a migration (CI fails if stale) |
| `npm run db:env` | Print the local Supabase URL and keys in `.env` format |
| `npm run seed:media` | Upload demo images and create their rows (local by default; see the script header for cloud projects) |

## Environment variables

See [`.env.example`](.env.example). Real values live only in `.env.local` (git-ignored), the Netlify UI and GitHub Actions secrets.

## Deployment

Netlify (ADR-003):
- Pull requests get free deploy previews.
- `main` is a free branch deploy.
- The **`production`** branch is the live site; a release is a PR `main → production`, merged with **Create a merge commit** (ADR-019).

Database (ADR-004):
- Migrations live in `supabase/migrations/` and are tested locally and in CI against Docker Supabase.
- After a merge to `main`, the **Migrate dev database** workflow applies them (and the SQL seed) to the cloud dev project. It needs the repository secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DEV_DB_PASSWORD` and the variable `SUPABASE_DEV_PROJECT_REF`; until the variable exists, the job is skipped.
- **Keep-alive** pings the `main` branch deploy's `/api/health` every second day so Supabase Free doesn't pause the dev project. If a project is paused anyway: Supabase dashboard → the project → **Restore**.
- GitHub disables scheduled workflows after 60 days without commits; re-enable under Actions → the workflow → **Enable workflow**.

## Running costs & limits

*To be completed in M4.* Target: €0/month on the Netlify Free and Supabase Free plans. See PLAN §5 and §8 for the limits and mitigations.
