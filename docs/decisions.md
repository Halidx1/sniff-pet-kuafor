# Architecture Decision Records

Each record uses the standard ADR format: Date · Status · Context · Decision · Alternatives considered · Consequences.

How to maintain this file:

- **Append** new records at the end with the next number.
- **Never delete** a record. If a decision changes, add a new record and mark the old one `Superseded by ADR-0xx`.
- Statuses: `Proposed`, `Accepted`, `Superseded`, `Deprecated`.

Requirements live in [`SPEC.md`](SPEC.md); the delivery plan lives in [`PLAN.md`](PLAN.md).

| ADR | Title | Status |
|---|---|---|
| [001](#adr-001-modular-monolith-partitioned-by-domain) | Modular monolith partitioned by domain | Accepted |
| [002](#adr-002-framework-and-toolchain) | Framework and toolchain | Accepted |
| [003](#adr-003-hosting-netlify-free-for-previews-and-production) | Hosting: Netlify Free for previews and production | Accepted |
| [004](#adr-004-local-supabase-in-docker-for-development-and-tests) | Local Supabase in Docker for development and tests | Accepted |
| [005](#adr-005-supabase-api-keys-and-server-side-client-roles) | Supabase API keys and server-side client roles | Accepted |
| [006](#adr-006-admin-authentication-and-session-hardening) | Admin authentication and session hardening | Accepted |
| [007](#adr-007-double-booking-prevention-in-four-layers) | Double-booking prevention in four layers | Accepted (Could, M5) |
| [008](#adr-008-browser-side-image-pipeline-without-an-optimisation-service) | Browser-side image pipeline without an optimisation service | Accepted |
| [009](#adr-009-one-public-storage-bucket-with-unguessable-paths) | One public Storage bucket with unguessable paths | Accepted |
| [010](#adr-010-scheduled-jobs-pg_cron-inside-the-database-github-actions-outside) | Scheduled jobs: `pg_cron` inside, GitHub Actions outside | Accepted |
| [011](#adr-011-rate-limiting-in-postgres) | Rate limiting in Postgres | Accepted (Could, M5) |
| [012](#adr-012-kvkk-notice-versioned-in-the-repository) | KVKK notice versioned in the repository | Accepted |
| [013](#adr-013-native-html-primitives-and-an-in-house-ui-kit) | Native HTML primitives and an in-house UI kit | Accepted |
| [014](#adr-014-colour-palette-adjustments) | Colour palette adjustments | Accepted |
| [015](#adr-015-email-delivery) | Email delivery | Accepted |
| [016](#adr-016-encrypted-backups-in-a-private-repository) | Encrypted backups in a private repository | Accepted |
| [017](#adr-017-git-history-policy-and-authorship) | Git history policy and authorship | Accepted |

---

## ADR-001: Modular monolith partitioned by domain

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- One developer, a €0 hosting budget and a portfolio-quality bar.
- The developer prefers organising code by business domain rather than by technical layer.
- The product has clearly separable areas: admin access, business facts, editorial content, images, the service catalogue and (later) booking.

**Decision.**
- Build **one** Next.js application (a monolith), structured internally as domain modules under `src/modules/`: `identity`, `business`, `content`, `media`, `catalog`, `booking`.
- Each module exposes a public API through its `index.ts`; everything else inside it is private.
- Shared, domain-free code lives in `src/shared/`, and `src/app/` only routes and composes.
- `eslint-plugin-boundaries` enforces the allowed dependencies in CI: `catalog → media`, `booking → catalog, business`, every module → `identity` and `shared`. No deep imports, no cycles.
- Each module owns its database tables and ships its own migrations and seed files. Cross-module foreign keys point only "down" the dependency graph.

**Alternatives considered.**
- *Layered structure* (`components/`, `lib/`, `services/`): familiar, but one feature ends up spread over many folders, and boundaries are by convention only.
- *Microservices / separate backend:* more hosting, more cost, more operations work, with no benefit at this scale.

**Consequences.**
- Code for a feature is in one place, and module boundaries are checked by a machine, not by memory.
- A module could later be extracted (e.g. booking into its own service) behind the same API.
- Cost: a little extra ceremony (`index.ts` exports, lint configuration). Cross-module reads must go through public APIs, even when a direct query would be shorter.

---

## ADR-002: Framework and toolchain

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- We need server rendering for SEO and server-side logic (admin actions, booking) that are easy to host for free.
- The developer is new to the JavaScript ecosystem, so mainstream, well-documented tools matter.

**Decision.**
- Next.js 16 (App Router) with React 19.
- TypeScript in strict mode.
- Tailwind CSS v4: theme tokens defined in CSS with `@theme`, and Tailwind's default palette removed so only brand colours exist.
- Zod 4 schemas shared by client and server.
- Vitest, Playwright and `@axe-core/playwright` for tests.
- Node 24 LTS in CI and on Netlify (`.nvmrc`). Exact versions are frozen by `package-lock.json`.

**Alternatives considered.**
- *Astro:* excellent for static sites, weaker story for an authenticated admin panel with server mutations.
- *Remix / React Router 7, SvelteKit:* capable, but less documentation and fewer hosting guides for our constraints.

**Consequences.**
- Next.js 16 conventions apply: `proxy.ts` replaces `middleware.ts`.
- The Tailwind v4 CSS-first config differs from older tutorials, so CLAUDE.md documents it.
- Version upgrades arrive as Dependabot PRs.

---

## ADR-003: Hosting: Netlify Free for previews and production

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- The site must run at €0/month for a commercial business. Vercel's free Hobby plan forbids commercial use.
- Researched in November 2026:
  - **Netlify Free:** 300 credits/month, hard cap. Production deploy = 15 credits; previews and branch deploys are free. Official Next.js adapter. When credits run out, projects pause until the next cycle.
  - **Cloudflare Workers Free + OpenNext:** 100k requests/day, but a **10 ms CPU limit per request**, and no support yet for Next.js Node middleware (`proxy`).

**Decision.**
- Use **Netlify Free** for deploy previews, the `main` branch deploy and production.
- The Netlify production branch is `production`. Day-to-day work merges into `main`, which is a free branch deploy.
- A release is a PR `main → production`, merged in the GitHub UI, so only releases cost credits.
- Images are served from Supabase Storage, not Netlify (ADR-008).
- The code stays host-agnostic: no Netlify-specific APIs.

**Alternatives considered.**
- *Cloudflare Workers Free:* rejected because the 10 ms CPU cap would make server rendering and Server Actions fail unpredictably.
- *Vercel Hobby:* rejected by its terms.
- *Netlify Personal ($9/month):* the fallback if traffic outgrows the free credits.

**Consequences.**
- Estimated use is ~115 of 300 credits/month.
- Risk: a traffic spike or bot flood can pause the site until next month. It can never create a bill, because the cap is hard.
- To verify in M0:
  - commercial-use wording in the current terms
  - per-deploy-context environment variables on Free (if missing, previews move to Vercel Hobby, allowed for non-commercial previews)
  - whether functions can run in Frankfurt

---

## ADR-004: Local Supabase in Docker for development and tests

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- The developer rarely uses Docker; the original spec preferred a Docker-free setup.
- The developer also wants every branch tested as thoroughly as possible, including database policies and end-to-end flows.

**Decision.**
- Run the Supabase stack locally in Docker via the Supabase CLI (`npm run db:start` / `db:stop` / `db:reset`). It is the default database for development and for all tests, locally and in CI.
- A cloud **dev** project serves Netlify previews and the `main` branch deploy; a separate **prod** project serves production.

**Alternatives considered.**
- *Remote dev project only:* no Docker, but database and E2E tests could only run in CI, and experiments would pollute shared data.
- *Plain local Postgres:* missing Supabase Auth, Storage and the API layer.

**Consequences.**
- Docker Desktop must be installed and running (~2–4 GB RAM while in use).
- `db:reset` re-applies all migrations and seeds in seconds.
- Local and CI environments are identical, so "works on my machine" problems shrink.

---

## ADR-005: Supabase API keys and server-side client roles

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.** Supabase is replacing the legacy `anon` / `service_role` JWT keys with publishable (`sb_publishable_…`) and secret (`sb_secret_…`) keys. The legacy keys are deprecated by the end of 2026.

**Decision.**
- Use the new keys.
- The server talks to Supabase through three factories in `src/shared/supabase/`:
  - `publicClient()`: publishable key, no cookies. Used by public pages, where RLS returns only published rows.
  - `adminClient()`: publishable key plus the admin's HttpOnly session cookie. RLS requires `is_admin()`.
  - `serviceClient()`: secret key, inside an `import 'server-only'` module. Only for the booking RPC and seed scripts.
- **No Supabase client runs in the browser.**

**Alternatives considered.**
- *Legacy keys:* deprecated.
- *Browser Supabase client:* would require session cookies readable by JavaScript, which weakens XSS protection (ADR-006).

**Consequences.**
- All admin data operations are Server Actions. Uploads use signed upload URLs (ADR-008).
- A CI step fails the build if `sb_secret_` appears in client bundles.

---

## ADR-006: Admin authentication and session hardening

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- The admin account is the most valuable target: it controls the content and, later, customer data.
- The realistic threats are stolen or reused passwords, automated login attacks and XSS-based session theft.

**Decision.**
- Supabase Auth with email + password; public sign-up disabled; admins listed in `private.admins`.
- **Mandatory TOTP two-factor authentication:**
  - `is_admin()` requires the JWT's `aal` claim to be `aal2`, so the database refuses admin writes without the second factor.
  - First login forces enrolment.
- Cloudflare Turnstile captcha on login and password reset (Supabase's native captcha support).
- Session cookies:
  - HttpOnly, Secure, SameSite=Lax, **Path=/admin**, so public pages never receive them
  - set and refreshed only on the server (`proxy.ts` on `/admin/*`)
- Strict nonce-based Content-Security-Policy on `/admin`.
- Every Server Action calls `requireAdmin()`; RLS repeats the check.

**Alternatives considered.**
- *Password only:* too weak for an internet-facing admin.
- *Magic links:* depend on email deliverability (see ADR-015).
- *Optional 2FA:* rejected by the developer in favour of mandatory.

**Consequences.**
- The owner needs an authenticator app (setup covered in the owner's guide). A lost phone is fixed by the developer removing the factor in the Supabase dashboard.
- Cookie path scoping and HttpOnly with `@supabase/ssr` are verified with a spike at the start of M3.

---

## ADR-007: Double-booking prevention in four layers

- **Date:** 2026-11-11
- **Status:** Accepted (implemented in M5, "Could")

**Context.**
- Pending requests hold their slot.
- Two customers must never be able to book overlapping times, including under concurrent requests or application bugs.
- Capacity may be greater than 1.

**Decision.** Four independent layers:

1. **UI:** shows only free slots.
2. **Server Action:** recomputes availability with the pure TypeScript engine from fresh data.
3. **`create_booking_request()`:** re-checks the business rules in SQL inside the transaction, as a second, independent implementation.
4. **Exclusion constraint:** `EXCLUDE USING gist (lane WITH =, tstzrange(starts_at, blocked_until) WITH &&) WHERE status IN ('pending','confirmed')`. Each parallel slot is a "lane" (1…capacity); the function tries lanes in order.

Differential tests run one shared table of scenarios through layers 2 and 3 and require identical results.

**Alternatives considered.**
- *Advisory lock + counting overlaps:* works, but correctness depends on every code path taking the lock.
- *Serializable isolation with retries:* heavier and easier to misuse.
- *Application-only checks:* race conditions.

**Consequences.**
- Overlap is impossible at database level, whichever code path inserts.
- Lanes can fragment slightly: at most one slot fewer than perfect packing.
- Rules exist in both TypeScript and SQL. That is deliberate, and the differential tests keep the two in sync.

---

## ADR-008: Browser-side image pipeline without an optimisation service

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- We need fast responsive images (the Lighthouse target is ≥ 90) on free tiers.
- Supabase image transformations are a paid feature, and Netlify Image CDN usage costs credits and ties us to the host.
- The owner uploads photos from a phone.

**Decision.**
- In the admin browser, each image is decoded, resized to 480/960/1600 px and encoded as WebP, falling back to JPEG when the browser can't encode WebP (e.g. some Safari versions).
- The files are uploaded with a plain `fetch PUT` to one-time **signed upload URLs** issued by a `requireAdmin()` Server Action. Paths look like `<kind>/<uuid>/<width>.<ext>`.
- Year-long immutable cache headers.
- A custom `next/image` loader picks the closest pre-generated width.

**Alternatives considered.**
- *Netlify Image CDN:* costs credits, not host-agnostic.
- *Supabase transformations:* paid.
- *Server-side `sharp` in a function:* compute cost and request-body limits.

**Consequences.**
- Three files per image (~0.4 MB total).
- Re-encoding strips EXIF metadata, including GPS location.
- Deleting an image must remove all variants (handled in the media module).

---

## ADR-009: One public Storage bucket with unguessable paths

- **Date:** 2026-11-11
- **Status:** Accepted (deviation from the original SPEC §16 wording; SPEC updated)

**Context.**
- The original spec asked for "public read only for published images".
- Enforcing that strictly needs a private bucket and signed download URLs. Those expire, which conflicts with CDN caching and statically regenerated pages.

**Decision.**
- One public bucket, `media`, with random UUID paths.
- Anonymous users have **no** SELECT policy on `storage.objects`, so the bucket can't be listed.
- The database (behind RLS) is the only index of paths.
- Writes and deletes are admin-only. Only WebP/JPEG up to 2 MB.

**Alternatives considered.**
- *Private bucket + signed URLs:* expiring URLs inside cached HTML break images.
- *Two buckets, moving files on publish:* more code and more failure modes.

**Consequences.** An unpublished image is reachable only by someone who already knows its random URL. Images are not sensitive, so this is acceptable.

---

## ADR-010: Scheduled jobs: `pg_cron` inside the database, GitHub Actions outside

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.** The spec forbids host-specific schedulers such as Vercel Cron. We need housekeeping (purging the audit log; later expiring pending requests, anonymising old data and purging rate-limit rows) and external jobs (keep-alive, backups, migrations).

**Decision.**
- Housekeeping runs as `pg_cron` jobs inside Supabase.
- Only jobs that must come from outside the database run on GitHub Actions: keep-alive, backup, migrations.

**Alternatives considered.**
- *Everything on GitHub Actions:* database credentials in more places, and scheduled workflows on public repos are disabled after 60 days without commits.
- *Netlify scheduled functions:* host-specific.

**Consequences.** Housekeeping stops while a project is paused. The keep-alive job prevents pausing.

---

## ADR-011: Rate limiting in Postgres

- **Date:** 2026-11-11
- **Status:** Accepted (implemented in M5, "Could")

**Context.** Booking submissions need server-side rate limiting. Serverless instances don't share memory, and we want no extra paid or host-specific services.

**Decision.**
- A `private.rate_limits` table with a fixed-window function, `hit_rate_limit(key, max, window)`, called by the server with the secret key.
- Keys are SHA-256 hashes of IP + secret salt, so raw IPs are never stored.
- Old rows are purged by `pg_cron`.

**Alternatives considered.**
- *Upstash Redis free tier:* an extra account and service.
- *In-memory counters:* useless across serverless instances.
- *Host rate-limit rules:* host-specific, and plan availability is unclear.

**Consequences.** One extra database round-trip per protected request, which is fine at this traffic level.

---

## ADR-012: KVKK notice versioned in the repository

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.** Customers must acknowledge the KVKK Aydınlatma Metni, and we must store which version they saw and when. Legal text should change only after review.

**Decision.**
- The notice lives in `content/kvkk.md` with a `version` field in its front matter.
- Bookings store `kvkk_version` and `kvkk_acknowledged_at`.
- Git history serves as the version log.

**Alternatives considered.** *Editable in admin with a versions table:* lets legal text change without review, and adds more code.

**Consequences.** Changing the notice requires a deploy, which is acceptable and even desirable for legal text.

---

## ADR-013: Native HTML primitives and an in-house UI kit

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.** The spec asks for a small reusable component set. Fewer dependencies mean less to learn, audit and update.

**Decision.**
- Use native `<details>` (FAQ accordion) and `<dialog>` (mobile menu, lightbox, confirmations).
- Build an in-house kit in `src/shared/ui`: Button, Card, SectionHeading, Badge, Field, Dialog.
- `lucide-react` for icons.

**Alternatives considered.**
- *shadcn/ui + Radix:* great primitives, but more dependencies and generated code to own.
- *MUI / Chakra:* heavy, and they impose their own look.

**Consequences.** We own accessibility for a handful of components; axe scans in E2E guard it.

---

## ADR-014: Colour palette adjustments

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- The original `muted-text` `#77736F` fails WCAG AA for normal text on cream (3.70:1), neutral-bg (4.37:1) and beige (3.38:1). It passes only on white (4.70:1).
- The developer asked for a third colour that matches the logo and makes the site feel more modern.

**Decision.**
- `muted-text` becomes `#66625E` (cream 4.76, neutral-bg 5.62, white 6.05), never used on beige.
- Add the accent `caramel` `#C98A4B`:
  - used for badges, paw accents, decorative shapes and highlights
  - text on it is always navy (6.27:1)
  - never used as a text colour on light backgrounds
- Add `danger` `#A63D2A` for error messages and destructive buttons only. Success uses navy plus a ✓ icon.
- Tailwind's default palette is removed.

**Alternatives considered.**
- *Keep `#77736F` on white only:* too restrictive for a cream-heavy design.
- *Other accents (sage, terracotta, dusty blue):* caramel harmonises with cream, echoes the dog fur in the brand's posts and complements navy.

**Consequences.**
- SPEC §6 is updated.
- The logo is never recoloured. Its PNG navy samples as `#152543` versus the token `#07152B`; re-check once the original logo file arrives.

---

## ADR-015: Email delivery

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- Supabase's built-in email sender is limited to 2 emails/hour and is best-effort.
- Since June 2026, new free projects using it can't customise templates, so password-reset emails would arrive in English.
- No domain will be bought until after several milestones.

**Decision.**
- From M3, configure **custom SMTP** in Supabase Auth with Turkish templates:
  - before the domain exists: a dedicated Gmail account with an app password
  - after the domain: Resend (with SPF, DKIM and DMARC)
- Transactional notifications (Could, M6) stay optional. The system works fully without email.

**Alternatives considered.**
- *Default Supabase sender:* English templates, 2/hour.
- *Brevo or other SMTP providers:* similar; Gmail needs no new vendor account.

**Consequences.** Switching to the domain later is a configuration task (DNS, Supabase SMTP settings) with no code changes.

---

## ADR-016: Encrypted backups in a private repository

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- Supabase Free has no automatic backups.
- The repository is public, so workflow artifacts would be public and must not be used.
- The developer wants the backup mechanism visible in the portfolio.

**Decision.**
- A nightly workflow in the **public** repo:
  1. runs `pg_dump` as a read-only `backup_reader` role over Supabase's IPv4 session pooler
  2. pipes the dump straight into `age` encryption to a public key (the private key is kept offline in a password manager)
  3. commits the encrypted file to a separate **private** repo
- The job also pings `/api/health`. Production database secrets live in a GitHub Environment restricted to the `production` branch.

**Alternatives considered.**
- *Workflow artifacts:* public on public repos.
- *Supabase point-in-time recovery:* paid.
- *Object storage such as R2/S3:* extra account, often requires a payment card.

**Consequences.**
- CI can encrypt but never decrypt.
- Storage images are not included; the owner keeps the originals. A periodic Storage mirror is the upgrade path.
- Losing the private key makes backups unreadable.
- Scheduled workflows in public repos are disabled after 60 days without commits; monthly Dependabot merges and the README runbook mitigate this.

---

## ADR-017: Git history policy and authorship

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- The original spec forbade rebasing, force-pushing and rewriting history.
- The developer relaxed this, provided every such action is explained and documented.
- The developer merges through the GitHub UI and asked who is the author of the work.

**Decision.**
- **Branches and merging:** one branch per feature (`feat/…`, `fix/…`, `chore/…`) with Conventional Commits. Claude pushes branches and opens PRs; the developer merges with **Squash and merge**, so `main` stays linear.
- **History rewriting:**
  - allowed **only on Claude's own unmerged feature branches**
  - pushed with `git push --force-with-lease`, which refuses to overwrite commits it hasn't seen
  - explained in a PR comment each time
- **Never** rewrite `main` or `production`; branch protection blocks it.
- **Authorship:** commits are authored by the developer's configured git identity. Each commit message ends with a `Co-Authored-By: Claude` trailer as an honest record of AI assistance (kept at the developer's request). The repository and portfolio credit belong to the developer.

**Alternatives considered.**
- *No rewriting ever:* safe, but leaves noisy review history.
- *Rewriting anywhere:* risks losing merged work.

**Consequences.** Clean history, and an auditable explanation whenever a feature branch was rewritten.
