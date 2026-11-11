# CLAUDE.md

Sniff Pet Kuaför is the website, admin panel and (later) appointment-request system for a cat and dog grooming shop in Gölbaşı, Ankara.

- **Requirements:** [`docs/SPEC.md`](docs/SPEC.md), the source of truth. If a requirement changes, update the spec first.
- **Plan and milestones:** [`docs/PLAN.md`](docs/PLAN.md).
- **Decisions:** [`docs/decisions.md`](docs/decisions.md) (ADRs; append, never delete).
- **Next.js 16.4 docs** ship in `node_modules/next/dist/docs/`. Read the relevant guide before writing Next code; APIs differ from older versions (see `AGENTS.md`).
- **Caching (ADR-018):** Cache Components are on.
  - Public data functions use `'use cache'` + `cacheTag('<module>')` + `cacheLife('max')`; admin actions call `updateTag('<module>')`.
  - Runtime APIs (`cookies()`, `headers()`) go inside `<Suspense>`.
  - Dynamic route handlers call `await connection()`.

## Non-negotiable rules

- **Never invent business facts:** hours, prices, services, durations, staff, experience, certificates, awards, reviews, customer numbers. Use clearly marked placeholders, seed as `is_demo = true` and unpublished, and list them as open questions.
- **Never commit secrets, real customer data or `.env` files.** The repo is meant to be public.
- **Never create or use fake or AI photos** that represent the actual shop, its staff or customers. Stock photos are credited in `docs/IMAGE_CREDITS.md`.
- **Text language:**
  - All customer- and admin-facing text is **Turkish** (ş ğ ü ö ç İ ı); `<html lang="tr">`; `toLocaleUpperCase('tr-TR')`.
  - Code, comments, commits and technical docs are **English**.
  - The owner's guide `docs/YONETICI_REHBERI.md` is Turkish.
- **Locale:** dates, times and money use `tr-TR` (`₺1.250`); timezone `Europe/Istanbul`; timestamps are `timestamptz`.
- **The logo is never redrawn, recoloured or distorted.** `public/brand/logo-interim.png` is a temporary extraction until the original file arrives.

## Architecture: modular monolith partitioned by domain (ADR-001)

```
src/app/                 routes only: thin pages, layouts, route handlers, proxy.ts (/admin only)
src/modules/<domain>/    identity · business · content · media · catalog · booking (Could)
  index.ts               the module's PUBLIC API; the only import path from outside
  domain/                pure rules and types, no I/O
  data/                  Supabase queries (repository)
  actions.ts             Server Actions: requireAdmin() → Zod parse → repo → revalidatePublicSite()
  schemas.ts             Zod, shared client/server
  ui/                    components for this domain
src/shared/              domain-free kernel: ui/ (Button, Card, …), supabase/ (client factories), lib/
supabase/                migrations/ (named <timestamp>_<module>_<what>.sql) · seed/ · tests/ (pgTAP)
tests/e2e/               Playwright + axe
docs/                    SPEC · PLAN · decisions · YONETICI_REHBERI · IMAGE_CREDITS
```

**Module rules** (enforced by `eslint-plugin-boundaries`):
- Import other modules only via their `index.ts`.
- Allowed dependencies: `catalog → media`; `booking → catalog, business`; every module → `identity`, `shared`.
- `shared` imports no module. No cycles.
- Each module owns its tables and migrations. Cross-module foreign keys point only down the graph.

**SOLID, pragmatically:**
- Interfaces (ports) only at real seams: the DB inside logic-heavy code, the clock, captcha, email and the rate limiter.
- Wire them in the module's `index.ts` with plain factory functions; no DI framework.
- Simple CRUD stays schema + repository + action.

## Security conventions (see PLAN §9)

**Supabase clients.** Only through `src/shared/supabase/`:

| Factory | Key | Use |
|---|---|---|
| `publicClient()` | publishable key, no cookies | public pages |
| `adminClient()` | publishable key + session cookie | admin |
| `serviceClient()` | secret key, `server-only` | booking RPC, scripts only |

**Hard rules:**
- **No Supabase client in the browser.** Never prefix a secret with `NEXT_PUBLIC_`.
- **Every Server Action starts with `requireAdmin()`** (actions are public endpoints). RLS checks again: `is_admin()` = listed in `private.admins` **and** a 2FA session (`aal2`).
- RLS on every table; anon reads only published rows. Internal tables go in the `private` schema. Revoke `EXECUTE` on new functions, then grant explicitly; `SECURITY DEFINER` functions set `search_path = ''`.
- Validate every input with Zod at the boundary.
- No `dangerouslySetInnerHTML` (except escaped JSON-LD). Render Markdown without HTML.
- Admin cookies are HttpOnly, Secure, SameSite=Lax, `Path=/admin`. Redirect targets must be relative `/admin/...` paths.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server at http://localhost:3000 |
| `npm run db:start` / `db:stop` | Start/stop local Supabase (Docker Desktop must be running) |
| `npm run db:reset` | Re-apply all migrations + seed to local Supabase |
| `npm run db:types` | Regenerate `src/shared/supabase/database.types.ts` from local DB |
| `npm run lint` / `typecheck` / `format` | ESLint (incl. module boundaries) / `tsc --noEmit` / Prettier write |
| `npm test` | Vitest unit + integration tests |
| `npm run test:db` | pgTAP database tests (`supabase test db`) |
| `npm run test:e2e` | Playwright + axe against a production build |
| `npm run verify` | Everything CI runs: lint, typecheck, unit, db, e2e, build |

## Testing and Definition of Done (every branch)

- New logic gets tests:
  - unit for `domain/` and `shared/lib` (≥ 90% line coverage there)
  - integration for repositories and actions; **every action is tested without a session → rejected**
  - pgTAP for RLS, constraints and grants
  - E2E + axe for user journeys
- `npm run verify` is green locally; CI is green on the PR.
- The milestone checklist is run on the Netlify deploy preview, on a real phone.
- Migrations are additive only (expand/contract), so code and schema can deploy in either order.
- Update `docs/PLAN.md`, `docs/decisions.md`, the README and the owner's guide when affected.

## Git (ADR-017)

- **Branches and commits:** branches `feat/…`, `fix/…`, `chore/…`; Conventional Commits (`feat(catalog): …`).
- **PRs:** Claude pushes and opens a PR with a test checklist; the developer merges with **Squash and merge**.
- **History rewriting:** only on Claude's own unmerged feature branches, with `--force-with-lease`, explained in a PR comment. Never on `main` or `production`.
- **Authorship:** commits are authored by the configured git user. Every commit message ends with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (kept at the developer's request).
- **Deploys:** Netlify production branch is `production`. `main` is a free branch deploy; PRs get free deploy previews. A release is a PR `main → production`.

## Working with the developer

- CS student, strongest in Java; new to TypeScript, React, Next.js, Tailwind and Supabase.
- Explain non-obvious choices in plain words, with Java or backend analogies, and avoid unexplained jargon.
- Always give exact commands for manual steps. Uses git mainly through the GitHub UI.
- At the end of each milestone, stop and report: what was built, manual steps (accounts, keys, dashboard settings) and how to test.
