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
| [007](#adr-007-double-booking-prevention-in-four-layers) | Double-booking prevention in four layers | Accepted, postponed with online booking (ADR-026) |
| [008](#adr-008-browser-side-image-pipeline-without-an-optimisation-service) | Browser-side image pipeline without an optimisation service | Accepted |
| [009](#adr-009-one-public-storage-bucket-with-unguessable-paths) | One public Storage bucket with unguessable paths | Accepted |
| [010](#adr-010-scheduled-jobs-pg_cron-inside-the-database-github-actions-outside) | Scheduled jobs: `pg_cron` inside, GitHub Actions outside | Accepted |
| [011](#adr-011-rate-limiting-in-postgres) | Rate limiting in Postgres | Accepted, postponed with online booking (ADR-026) |
| [012](#adr-012-kvkk-notice-versioned-in-the-repository) | KVKK notice versioned in the repository | Accepted |
| [013](#adr-013-native-html-primitives-and-an-in-house-ui-kit) | Native HTML primitives and an in-house UI kit | Accepted |
| [014](#adr-014-colour-palette-adjustments) | Colour palette adjustments | Accepted (amended by ADR-021) |
| [015](#adr-015-email-delivery) | Email delivery | Accepted |
| [016](#adr-016-encrypted-backups-in-a-private-repository) | Encrypted backups in a private repository | Accepted |
| [017](#adr-017-git-history-policy-and-authorship) | Git history policy and authorship | Accepted |
| [018](#adr-018-caching-model-cache-components) | Caching model: Cache Components | Accepted (verified on Netlify 2026-11-11) |
| [019](#adr-019-work-tracking-on-github-and-release-merges) | Work tracking on GitHub and release merges | Accepted |
| [020](#adr-020-a-clean-map-maplibre-and-openfreemap) | A clean map: MapLibre and OpenFreeMap | Accepted |
| [021](#adr-021-warm-oat-replaces-white-backgrounds) | Warm oat replaces white backgrounds | Superseded by ADR-024 |
| [022](#adr-022-scroll-driven-homepage-story-with-css-only) | Scroll-driven homepage story with CSS only | Superseded (rejected in review) |
| [023](#adr-023-sky-blue-replaces-oat) | Sky blue replaces oat | Superseded by ADR-024 |
| [024](#adr-024-keep-the-original-white-and-neutral-bg) | Keep the original white and neutral-bg | Accepted |
| [025](#adr-025-hand-drawn-scroll-story-with-gsap-and-lenis) | Hand-drawn scroll story with GSAP and Lenis | Accepted |
| [026](#adr-026-customer-history-replaces-online-booking-in-v1) | Customer history replaces online booking in v1 | Accepted |
| [027](#adr-027-return-reminders-a-due-list-with-one-tap-whatsapp-automation-later) | Return reminders: due list + one-tap WhatsApp | Accepted |
| [028](#adr-028-ai-generated-illustrations-via-cloudflare-workers-ai-flux1-schnell) | AI-generated illustrations via Cloudflare Workers AI | Proposed |
| [029](#adr-029-sync-the-shops-instagram-posts-with-the-official-api-as-drafts) | Sync the shop's Instagram posts with the official API, as drafts | Accepted (pending setup) |
| [030](#adr-030-customers-give-reminder-consent-through-an-online-form-confirmed-by-staff) | Reminder consent through an online form, confirmed by staff | Accepted |
| [031](#adr-031-gallery-cards-per-instagram-post-with-the-shops-own-photos) | Gallery cards per Instagram post, with the shop's own photos | Accepted |
| [032](#adr-032-scroll-effects-load-on-the-visitors-first-interaction) | Scroll effects load on the visitor's first interaction | Accepted |
| [033](#adr-033-how-the-admin-sign-in-is-built-m3-identity) | How the admin sign-in is built (M3 identity) | Accepted |

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

**Verification results (2026-11-11, end of M0).**
- Per-context environment variables: **available on Free** (scopes and deploy contexts can be chosen). Previews stay on Netlify.
- Functions region: **fixed to Ohio (us-east-2) on Free**; choosing a region requires an upgrade. Supabase stays in the EU: visitors get pages from the CDN and are unaffected, while uncached admin requests pay ~100 ms per database round trip. Moving the database to Ohio was rejected because later booking data (Could) would then sit in the US instead of the EU, the weaker choice for KVKK.
- Commercial-use wording: still to re-read before the first release (issue #43).
- Supabase region: the new-project screen only offers a broad "Europe" choice, which placed the dev project in **eu-west-1 (Ireland)** instead of Frankfurt. Accepted: still the EU for KVKK, and Ireland is slightly closer to Netlify's Ohio functions.

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
- **Status:** Accepted; postponed with online booking (ADR-026, 2026-11-23). Was planned for M5 ("Could").

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

**Update (2026-11-11, M2).** The site renders images with a plain `<img srcset>` built from each row's stored `widths` (`MediaImage` in the media module), not a custom `next/image` loader. A loader only receives a path and a width, so it can't know which variants exist for a given image (Instagram tiles, for example, have no 1600 px file); `srcset` lists exactly the stored files and lets the browser choose. The hero image loads eagerly with `fetchPriority="high"`.

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
- **Status:** Accepted; postponed with online booking (ADR-026, 2026-11-23). Was planned for M5 ("Could").

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

**Update (2026-11-11, M2).** The notice lives in `src/modules/content/kvkk-notice.ts` as a Markdown string with a `version` field, not in a separate `.md` file, so it is bundled with the code and never read from disk at runtime. It uses the same Markdown subset as the About text.

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

---

## ADR-018: Caching model: Cache Components

- **Date:** 2026-11-11
- **Status:** Accepted (2026-11-11, after the M2 verification gate below). Previously Proposed.

**Context.**
- Next.js 16.4's `create-next-app` enables **Cache Components** (`cacheComponents: true`, `partialPrefetching: true`) by default.
- The bundled Next.js docs describe this as the recommended model. The older model ("static pages + `revalidatePath`") is slated for removal in the next major version.
- Public pages must show admin changes within seconds (SPEC §1).
- Netlify documents on-demand revalidation for its Next.js adapter, but in November 2026 we found no explicit confirmation that its runtime fully supports `use cache` / `cacheTag` / `updateTag`.

**Decision.**
- Keep Cache Components enabled.
- Public data functions use `'use cache'` + `cacheTag('<module>')` + `cacheLife('max')`.
- Admin Server Actions call `updateTag('<module>')`, so the owner sees their own change immediately ("read your own writes").
- **Verification gate at the start of M2:** the first database-backed public page is deployed to a Netlify preview, and we check that an admin-side change appears within seconds.

**Alternatives considered.** *Disable Cache Components and use the previous model* (`revalidatePath` + time-based ISR): explicitly supported by Netlify today, but on its way out in Next.js. This is the fallback if the verification gate fails.

**Consequences.**
- We follow the documented, future-proof Next.js model.
- If Netlify fails the gate, switching costs about a day: data functions and action helpers change, components don't. The outcome is recorded by updating this ADR's status, or by a superseding ADR.

**Verification result (2026-11-11, start of M2, issue #19).** A temporary page on a Netlify deploy preview (PR #58, closed unmerged) read the dev database inside `'use cache'` + `cacheTag('gate')` + `cacheLife('max')` and was prerendered as static. Then:
- `updateTag('gate')` in a Server Action: the acting user saw the new value immediately, and other visitors on their next request.
- `revalidateTag('gate', 'max')` in a Route Handler: the stale value was served once, the fresh one about 3 seconds later.

The gate passed; no fallback is needed.

**Consequence found in M2.** Next's *fetch* cache, unlike `'use cache'`, survives new deploys. Because supabase-js uses `fetch`, a rebuild reused old database responses. `publicClient()` therefore sends every request with `cache: "no-store"`, leaving `'use cache'` + `cacheTag` as the single cache layer.

---

## ADR-019: Work tracking on GitHub and release merges

- **Date:** 2026-11-11
- **Status:** Accepted

**Context.**
- Until M0 the plan lived only in `docs/PLAN.md`. The developer asked to track milestones and issues on GitHub from M1 on, and to use GitHub Projects if worthwhile.
- The developer merges in the GitHub UI and is learning git, so the number of merges per milestone matters.
- ADR-017 says "Squash and merge" for every PR. For a release PR `main → production` that creates a new commit on `production` that `main` doesn't have; every later release would show old changes again and could conflict.

**Decision.**
- **Milestones:** one GitHub milestone per plan milestone (M1–M6, with "(Could)" on M5–M6).
- **Issues:** one per deliverable, labelled by module (`module:*`) and concern (`database`, `ci`, `security`, `needs-owner`). The current milestone gets detailed issues; later milestones get coarse issues that are refined when the milestone starts. Open questions for the owner are one `needs-owner` checklist issue.
- **Project board:** one public user project, "Sniff Pet Kuaför", with every issue; Status is Todo → In Progress → Done. GitHub's built-in workflows move items to Done when an issue closes or a PR merges.
- **Branches and PRs:** one branch and PR per milestone (or per large feature), with one commit per issue saying `Refs #n`; the PR body says `Closes #n` for every finished issue.
- **Merging:** feature PRs use **Squash and merge** (ADR-017). Release PRs `main → production` use **Create a merge commit**, so `production` always contains `main`'s exact commits.

**Alternatives considered.**
- *Checklists in `PLAN.md` only:* no links between code, discussion and progress; invisible on the repository page.
- *One PR per issue:* cleaner review units, but about ten merges per milestone for a developer working in the GitHub UI, plus stacked-branch rebases.
- *Squash for releases too:* `main` and `production` diverge after the first release.
- *No project board:* milestones already show progress; the board was kept because it costs little, updates itself, and shows the roadmap at a glance for the portfolio.

**Consequences.**
- Progress, decisions and code are linked and visible on GitHub.
- Claude keeps issue status and the board current as part of each milestone.
- The branch-protection rule for `production` must allow merge commits.

---

## ADR-020: A clean map: MapLibre and OpenFreeMap

- **Date:** 2026-11-12
- **Status:** Accepted

**Context.**
- In the M2 review the keyless Google Maps iframe (`?q=<address>&output=embed`) showed a zoomed-out area full of other businesses and no clear shop pin.
- The developer wants the map to show **only the shop**. Google's free iframe can't hide points of interest; hiding them needs a Google API key with billing enabled.

**Decision.**
- Draw the map with **MapLibre GL JS** (BSD licence) and **OpenFreeMap**'s "positron" style (free for commercial use, no key, no account, no cookies).
- A pure function (`business/domain/map-style.ts`) removes point-of-interest, airport and house-number layers, switches labels to Turkish names and tints the background oat.
- One navy/caramel paw pin at new `business_profile.latitude/longitude` columns. The seed takes them from the owner's own Google Maps listing; the owner confirms them. No coordinates → no map.
- The engine is a dynamic `import()` triggered by an IntersectionObserver, so its ~1 MB of JS and its CSS never load before the map is near the viewport. MapLibre's worker file is copied to `public/vendor/` before `dev`/`build`, because bundlers don't ship it.
- `cooperativeGestures` (two fingers on phones, Ctrl/⌘ + scroll on desktop), so the map never traps page scrolling.
- CSP: `connect-src` adds `https://tiles.openfreemap.org`, `worker-src 'self'`, and `frame-src` becomes `'none'`.
- "Yol Tarifi Al" still links to the owner's Google Maps listing.

**Alternatives considered.**
- *Google iframe of the shop's own listing* ("Share → Embed a map"): shows the pin and name, but neighbouring businesses stay visible.
- *Google Static Maps* with points of interest hidden: clean, but needs a Google Cloud account with billing and an API key, and isn't draggable.
- *Leaflet with OpenStreetMap or CARTO raster tiles:* raster tiles have points of interest baked in; CARTO's free tier is non-commercial.

**Consequences.**
- No third-party cookies or iframes on the public site; the KVKK draft names OpenFreeMap instead of Google.
- OpenFreeMap has no SLA. If it's down, the map box shows a link to Google Maps; the rest of the page is unaffected. E2E stubs it, so CI never depends on it.
- `map_embed_url` is unused and will be dropped in a later contract migration.

---

## ADR-021: Warm oat replaces white backgrounds

- **Date:** 2026-11-12
- **Status:** Superseded by ADR-023, then ADR-024 (oat was too close to the logo's cream). Amended ADR-014.

**Context.** In the M2 review the developer found the white cards (`#FFFFFF`) and near-white page bands (`neutral-bg #FAF6F1`) too stark next to the logo's navy and cream, and asked for a matching third colour instead of white.

**Decision.**
- Remove the `white` and `neutral-bg` tokens. Add `oat` `#EDE3D6` (page background and plain bands) and `oat-light` `#F3ECE2` (cards and forms).
- Navy, cream, beige, caramel, muted-text and danger are unchanged.
- Contrast (WCAG AA ≥ 4.5): navy 14.38 on oat and 15.56 on oat-light; muted-text 4.77 and 5.16; danger 4.98 and 5.39.

**Alternatives considered.** *Sage mist* (`#E3E7D8`) and *dusty blue* (`#DDE4EC`) were offered; the developer chose the warm option, which keeps the cosy feel.

**Consequences.** Because Tailwind's default palette is removed (ADR-014), any leftover `bg-white` renders no colour and is easy to spot; `grep` finds none.

---

## ADR-022: Scroll-driven homepage story with CSS only

- **Date:** 2026-11-12
- **Status:** Superseded (2026-11-12). The developer reviewed the first CSS-only version on the deploy preview and rejected it as far from the intended experience (references: bonito-flakes-for-pets.com, webdesign.kernjosh.com, jitter.video). It was taken out of PR #65 before merging; a follow-up PR replaces it with a GSAP-based story (issue #64), recorded in a new ADR.

**Context.** The developer asked for a homepage that animates as the visitor scrolls: a dog is brushed and trimmed, then a cat is brushed. After that, the welcome text and details appear inside paws. SPEC §6 had asked to avoid excessive animation.

**Decision.**
- Use **CSS scroll-driven animations** (`view-timeline`, `animation-timeline`, `animation-range`). A tall section holds a sticky stage, and the scroll position inside it drives each keyframe.
- The story stays a Server Component: no animation library and no client JavaScript. Only `transform` and `opacity` are animated, which browsers can run off the main thread.
- The illustrations are original inline SVGs in navy and caramel on cream (not photos, not AI images, not the logo).
- The hero texts and buttons are on the first screen as real HTML. The welcome text and the four "why us" points follow in a paw trail in normal page flow.
- **Fallback:** without `animation-timeline` support, or with `prefers-reduced-motion: reduce`, the stage isn't sticky and shows the final, groomed picture; the paws are simply visible.

**Alternatives considered.**
- *Motion (Framer Motion) or GSAP ScrollTrigger:* works in every browser, but adds 30–70 KB of client JS and makes the hero a client component.
- *A video or Lottie file:* heavy, harder to keep accessible, and needs an animation tool and a licence.

**Consequences.**
- Chrome, Edge and Safari 26+ animate; other browsers show the static picture, which still contains every text.
- SPEC §6 and §8 are updated: one scroll story is allowed, other pages stay calm.

---

## ADR-023: Sky blue replaces oat

- **Date:** 2026-11-12
- **Status:** Superseded by ADR-024 (the developer preferred the original whites). Superseded ADR-021.

**Context.**
- On the deploy preview the developer found oat (`#EDE3D6`) too close to the logo's cream (`#F5E1CE`): bands and headers blurred together.
- The two colours have the same lightness (contrast 1.00:1) and a similar warm hue, so nothing told them apart.
- Every light candidate is about as light as cream, so the difference has to come from hue.

**Decision.**
- Replace `oat`/`oat-light` with `sky` `#D6E1EC` (page background and plain bands) and `sky-light` `#EBF1F7` (cards and forms): a light tint of the logo navy.
- Contrast (WCAG AA ≥ 4.5): navy 13.76 on sky and 16.03 on sky-light; muted-text 4.56 and 5.31; danger 4.77.
- The map background follows `sky-light`.

**Alternatives considered.** *Mist blue* (`#DFE6EE`, softer, weaker separation) and *sage* (`#E1E6D6`, less tied to the navy); the developer compared all three on the real pages and chose sky blue.

**Consequences.**
- Warm cream (headers, hero) and cool sky (bands) now alternate visibly.
- The token names changed (`bg-oat` → `bg-sky`), so a leftover old class renders no colour and is easy to spot.

---

## ADR-024: Keep the original white and neutral-bg

- **Date:** 2026-11-12
- **Status:** Accepted. Supersedes ADR-021 and ADR-023; ADR-014's palette stands.

**Context.** In the M2 review the developer first found white too stark next to the logo and tried two replacements on the deploy preview: warm oat (ADR-021), too close to the logo's cream, then sky blue (ADR-023), which they didn't like either. Seeing all three, they preferred the original.

**Decision.** Keep `white` `#FFFFFF` (cards, forms) and `neutral-bg` `#FAF6F1` (page background) from ADR-014. The `oat`/`sky` tokens are removed; the map background follows `neutral-bg`.

**Alternatives considered.** Oat (ADR-021), sky blue (ADR-023), mist blue and sage, all compared on the real pages.

**Consequences.** No palette change ships from the M2 review. The warmth and character the developer was missing come from the homepage art direction instead (hand-drawn story, separate PR).

---

## ADR-025: Hand-drawn scroll story with GSAP and Lenis

- **Date:** 2026-11-12
- **Status:** Accepted. Replaces ADR-022.

**Context.**
- The developer rejected the first, CSS-only story (ADR-022) and pointed to bonito-flakes-for-pets.com, webdesign.kernjosh.com and jitter.video: pinned full-screen chapters, smooth weighted scrolling, sticker typography, hand-made doodles and collage.
- They chose a hand-drawn doodle style, the homepage story plus light site-wide touches, and GSAP + Lenis over staying CSS-only.

**Decision.**
- **Artwork:** original doodles generated at design time by `scripts/doodles/generate-doodles.mjs`. The scene is described as simple shapes; rough.js (dev dependency only) turns them into sketchy paths with a fixed seed. The output is a committed data module rendered as inline SVG by Server Components, so neither rough.js nor the drawing ships as JavaScript.
- **Motion:** GSAP (`gsap` + `@gsap/react`, ScrollTrigger) pins the hero and scrubs one timeline through four chapters: brush, snip, cat, happy. Lines are drawn and rubbed out by animating `stroke-dashoffset` on paths with `pathLength="1"`, with no extra plugin.
- **Scrolling:** Lenis smooth scrolling on the public site, driven by GSAP's ticker so pins and scroll position stay in sync. Touch scrolling stays native.
- **Page-load moment:** the headline stickers pop and the dog draws itself with CSS animations, so it starts at first paint, before any JavaScript. The fill mode is `backwards`, so finished CSS animations never override GSAP.
- **Accessibility:** texts and buttons are server-rendered HTML; the drawing and captions are `aria-hidden`.
- **Reduced motion: a gentle version, not a still picture.** On the deploy preview the developer's desktop showed only a still picture, because Windows "Animation effects" was off; Chrome and Opera report that as `prefers-reduced-motion: reduce`, and many PCs have it off by default. The developer asked for the animation anyway. Ignoring the preference would break SPEC §16 and harm people with vestibular disorders, for whom flying, sliding and zooming motion can cause dizziness or nausea. So `reduce` gets the same pinned chapters with fades and line drawing only: tools fade in place, fur fades instead of flying, the dog never moves, the stage jumps to the centre while invisible, and there's no smooth scrolling. The page-load CSS animations are cut to ~0 ms by the global reduced-motion rule.
- **Opt-in to the full version.** Visitors may not know their system asks for reduced motion and could take the gentle story for a weak website. With reduced motion a dashed button at the top-right corner of the drawing offers "Animasyonu tam hızda oynat"; it scrolls back to the top, replays the headline animation and switches the story and smooth scrolling to the full version, remembered in `localStorage`. It also sets `<html data-motion="full">`, which exempts the page from the global reduced-motion CSS rule, so the button version runs exactly like normal motion. "Sade animasyona dön" restarts from the top in the gentle version, with the headline shown without animation. Without reduced motion the button is hidden. The gentle desktop story is ~7 % shorter (3.9 instead of 4.2 screen heights).

**Alternatives considered.**
- *Stay CSS-only (ADR-022):* no JavaScript, but no smooth scrolling, fewer effects, and different behaviour per browser; rejected in review.
- *Motion (Framer Motion):* React-friendly, but weaker for long pinned, scrubbed timelines.
- *Stock or licensed animations (Lottie), cut-out stock photos, a commissioned illustrator:* offered; the developer chose the hand-drawn style.

**Consequences.**
- About 52 KB (gzip) of JavaScript on public pages for GSAP (28 KB), ScrollTrigger (18 KB) and Lenis (5 KB); the Lighthouse budget (≥ 0.9) still applies.
- GSAP uses its free "Standard no-charge" licence (commercial use allowed), not an OSI open-source licence.
- Changing the drawing means editing the generator and running it again; the generated file is not edited by hand.

---

## ADR-026: Customer history replaces online booking in v1

- **Date:** 2026-11-23
- **Status:** Accepted. Postpones ADR-007 and ADR-011 (kept for later).

**Context.**
- The owner no longer needs online booking for v1; appointments keep arriving by phone and WhatsApp.
- Instead they want a record of customers, their pets and the services applied (with dates), so the shop can invite customers back when a pet is due for grooming again.

**Decision.**
- New domain module **`customers`** (ADR-001) with customers, pets, pet types (default intervals), visits with service snapshots, and reminder actions. It depends on `catalog` (services) and `identity`.
- All its tables are admin-only: RLS requires `is_admin()` (2FA), anon has no grants at all, and pgTAP checks that.
- Online booking (SPEC §12; ADR-007 double booking, ADR-011 rate limiting) moves to "later". Its design stays in SPEC and PLAN for a future version. `/randevu-al` keeps the contact information.
- Shop employees get ordinary admin accounts (2FA) for now; roles are an open question.
- Customer history becomes milestone **M5 (Should)**; booking becomes "Later".

**Alternatives considered.**
- *Keep booking as M5–M6 and add history after:* builds a feature the owner doesn't want before one they do.
- *Track customers in a spreadsheet:* no reminders, no access control, personal data in loose files.

**Consequences.**
- The site now stores real customers' personal data (names, phone numbers, pets). KVKK work becomes real: the notice is extended, retention, export and delete exist, and the data never leaves the admin-only tables.
- Public pages are unaffected.

---

## ADR-027: Return reminders: a due list with one-tap WhatsApp, automation later

- **Date:** 2026-11-23
- **Status:** Accepted.

**Context.**
- Reminders must cost nothing to run in v1.
- An automatic "would you like to come again?" message is most likely a commercial electronic message under Turkish law 6563. That probably needs the recipient's consent and İYS registration, while the exemption for existing-relationship notices covers informational messages, not promotions. This needs a legal check (SPEC §18).
- The owner wants automation to stay possible.

**Decision.**
- **v1:** the admin panel computes who is due (last visit + the pet's own interval or its pet type's default) and lists them. **"WhatsApp'tan yaz"** opens `wa.me` on the staff member's phone with a prefilled message from the owner's template; staff press send and record the outcome.
- Only customers with recorded reminder consent get a message button; others appear under "İzin yok" for information.
- **Seam for later:** the reminder logic only asks a *channel* to deliver a prepared message. v1's channel returns a `wa.me` link (manual); a later channel (WhatsApp Cloud API, SMS, email) can send automatically from a scheduled job (`pg_cron`, ADR-010), after the legal checks. This is one of the "real seams" where CLAUDE.md allows a port.

**Alternatives considered.**
- *Automatic email:* most customers use WhatsApp, not email, and the same consent questions apply.
- *Automatic WhatsApp or SMS now:* paid, needs Meta template approval and İYS registration; premature.

**Consequences.**
- Zero running cost; staff stay in control of every message.
- Consent is stored with date and source from day one, so automation can be added without collecting it again.

---

## ADR-028: AI-generated illustrations via Cloudflare Workers AI (FLUX.1 schnell)

- **Date:** 2026-11-23
- **Status:** Proposed. Becomes Accepted after a first test batch is approved. (2026-11-23: the free token works; a first test image was generated.)

**Context.**
- The developer believes a better homepage illustration can come from an AI image model than from the code-generated doodles (ADR-025).
- They have no paid ChatGPT or Gemini plan and want a free API that Claude Code can use.
- Checked on 2026-11-23:
  - The Gemini API's free tier has no image generation (billing required).
  - Hugging Face's free inference credits are very small.
  - **Cloudflare Workers AI** gives 10,000 "neurons" a day for free, with no credit card, and hosts **FLUX.1 [schnell]** (Black Forest Labs, Apache-2.0 licence, commercial use allowed). That's about 150+ images of 1024 px a day.

**Decision (proposed).**
- **Connection:** a free Cloudflare account and an API token limited to Workers AI. `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_TOKEN` go in the developer's git-ignored `.env.local` (names in `.env.example`, never `NEXT_PUBLIC_`). A dev-only script, `scripts/art/generate.mjs`, calls the REST API and saves results locally; Claude Code runs it. No third-party MCP server, so no unknown code handles the token.
- **Pipeline:**
  1. Prompts from a committed art brief (style, palette, one subject per image, plain background).
  2. Pick a candidate from a contact sheet.
  3. Key out the plain background.
  4. Trace to SVG and snap the colours to the brand palette.
  5. Split into layers (body, fur tufts, tools) with the same class names the story already animates.
  The GSAP timeline stays.
- **Rules:** illustrations of generic animals only, never photo-realistic and never presented as the shop's work (CLAUDE.md, SPEC §6). Every used image is credited in `IMAGE_CREDITS.md` (model, licence, date). The model licence is re-checked on its model card before the first use.

**Alternatives considered.**
- *Paid Gemini or OpenAI image APIs:* better quality and transparent backgrounds, but they need billing.
- *Community MCP servers:* third-party code with access to the token.
- *AI video frames scrubbed by scroll:* heavy pages, paid, and characters drift.
- *A commissioned illustrator:* best quality, costs money.

**Consequences.**
- Zero cost within the free quota; the token never leaves the developer's machine.
- FLUX.1 [schnell] has no transparency and limited character consistency between images: tracing and manual layer clean-up are part of the work. The current doodles (ADR-025) remain the fallback.

---

## ADR-029: Sync the shop's Instagram posts with the official API, as drafts

- **Date:** 2026-11-23
- **Status:** Accepted, pending the owner's account setup and a check that Meta allows it without app review.

**Context.**
- The developer wants new posts from @sniffpetkuafor to reach the gallery without manual uploads.
- SPEC had excluded the Instagram API (tokens expire, extra account setup).
- Scraping Instagram breaks its terms and keeps breaking technically, so it is not an option.
- The posts follow a pattern (a branded collage, then before, then after), but not all are about grooming (products, an announcement poster).

**Decision.**
- **API:** "Instagram API with Instagram Login" (Business Login), permission `instagram_business_basic`, reading only the shop's own media (`/me/media`, with carousel children).
- **Setup:** the account becomes Professional (free). A Meta app in development mode with the shop's account as a tester; the owner authorises once. The short-lived token is exchanged server-side for a 60-day token.
- **Sync:** a scheduled job (GitHub Actions, daily; it has `sharp` for resizing) that:
  1. refreshes the token when it's older than ~30 days (the refresh must happen within 60 days or the token dies);
  2. fetches new posts;
  3. downloads each photo, resizes it to the existing widths (ADR-008) and uploads it to Storage (Instagram's CDN links expire);
  4. inserts `media` rows as **unpublished drafts**, grouped per post (the same grouping column the Instagram-photo gallery needs), with the post's permalink, date and caption.
- **Secrets:** the app secret and the token live server-side only. The token sits in a `private` table read by the job with the secret key. The app secret is a GitHub Actions secret. Nothing goes to the browser or the repo.
- **Publishing stays human:** the admin panel lists new drafts with a badge; "Önce / Sonra kartı" (photo 1 = cover, 2 = before, 3 = after, adjustable), "Karusel" or "Atla". Alt texts are suggested from the caption and edited by the owner before publishing (alt text stays required).
- **Failure:** if the token expires or the API fails, the job records the error, the admin panel shows a reconnect step, and the site keeps its existing photos.

**Alternatives considered.**
- *Scraping or third-party feed widgets:* breaks Instagram's terms, adds trackers and cookies, and is fragile.
- *Auto-publish everything, or only "3-photo" posts:* off-topic posts would appear on the site; the developer chose drafts plus one tap.
- *Manual uploads only (the old SPEC):* works, but the owner posts on Instagram anyway.

**Consequences.**
- The gallery stays current with one tap per post; the photos are hosted by us, so the site doesn't depend on Instagram's CDN.
- Meta can change the API or require app review; then the manual upload path still works.
- The KVKK notice should mention that the shop's public Instagram posts are shown on the website.

---

## ADR-030: Customers give reminder consent through an online form, confirmed by staff

- **Date:** 2026-11-23
- **Status:** Accepted (owner's answers relayed by the developer; consent wording pending owner + legal review).

**Context.**
- Return reminders (ADR-027) need the customer's recorded, separate consent (KVKK; law 6563 for commercial messages).
- The owner wants customers to give that consent online, through a form, rather than staff ticking a box.
- The owner also answered: a single admin account for now (more accounts through the admin panel later) and anonymisation after 2 years without a visit.

**Decision.**
- A public page `/hatirlatma-izni` with name, phone, optional pets, a required "Aydınlatma Metni'ni okudum" checkbox and a separate, optional, unticked consent checkbox with the exact wording; withdrawal on the same page.
- The form writes a **request** (`customers.consent_requests`) through a `SECURITY DEFINER` RPC called server-side with the secret key, after Turnstile and a rate limit. The anon role has no grants on any `customers` table.
- **Staff confirm each request** (match to a customer by phone, or create one). Only then does the customer's consent become true, with source `online_form`, the submission time and the consent-text version.
- Unaccepted requests are deleted after 30 days. Customers are anonymised after 24 months without a visit (setting).
- v1 has one admin account; a "Kullanıcılar" section comes later.

**Alternatives considered.**
- *Apply the form directly:* anyone could sign up someone else's number; a staff check costs a tap.
- *Verify the phone with an SMS code:* proves ownership, but SMS costs money and needs a provider; the staff check plus the opt-out line in every message is enough for manual reminders.
- *Consent only at the counter (the earlier SPEC):* the owner prefers online.

**Consequences.**
- A public form that takes personal data: Turnstile, rate limit, Zod, and E2E + pgTAP tests that the anon key can't read anything.
- The consent wording and the KVKK notice v2 need the owner's (ideally legal) approval before go-live.
- If phone verification becomes necessary (e.g. automatic reminders), it can be added to the form later.

---

## ADR-031: Gallery cards per Instagram post, with the shop's own photos

- **Date:** 2026-11-23
- **Status:** Accepted.

**Context.**
- The gallery showed Unsplash stock photos, kept unpublished because they could be mistaken for the shop's work.
- The shop's Instagram posts follow a pattern: a branded collage, then a before photo, then an after photo; one post shows outfits in 7 photos.
- The developer decided the shop's own Instagram photos may be used on the site, because the shop already publishes them, and asked for before/after visible per pet, the outfit photos grouped, and a symmetric layout.

**Decision.**
- `media` gets `group_id uuid` and `group_role ∈ {cover, before, after, slide}` (both or neither; at most one cover/before/after per group). Additive; ungrouped images behave as before. The same columns serve the Instagram sync (ADR-029).
- A pure function `toGalleryCards` turns rows into cards: before + after (+ cover) → a **pair**; anything else with several photos → a **carousel**; otherwise a **single**. Unit-tested.
- Layout: a 4-column grid from `sm` where pairs and carousels span 2 columns (1 column of cards on phones), so cards line up symmetrically. A pair shows Önce | Sonra side by side; a carousel shows two photos at a time with scroll-snap and arrow buttons that wrap around. The lightbox browses every photo of the visible cards, covers included.
- The photos are committed to `supabase/seed/media/shop/` with all metadata stripped (they carried Instagram's IPTC blocks), seeded as **published** with `is_demo = true`. The hero and About images are shop photos too. `seed:media` deletes the retired Unsplash rows (only while still flagged demo) and their files.
- The "Önce/Sonra" tags sit outside the photo buttons (the alt text already says "Bakım öncesi/sonrası"), so each button's visible text matches its accessible name (axe `label-content-name-mismatch`).

**Alternatives considered.**
- *Before/after slider (drag a handle):* a nice effect, but needs a custom accessible control and hides half of each photo; side by side is clearer on a phone.
- *Show the branded cover collage as the card:* it already contains both photos, but smaller and with the logo repeated in every card; it stays available in the lightbox.
- *One tile per photo, as before:* before and after of the same pet end up apart.

**Consequences.**
- About 4.5 MB of JPEGs in the repository (36 files); WebP variants are served from Storage as before.
- Admin (M3) needs to group, re-order and tag photos; the Instagram sync (ADR-029) fills the same columns.
- The owner still confirms the photos and the alt texts (#54).

---

## ADR-032: Scroll effects load on the visitor's first interaction

- **Date:** 2026-11-23
- **Status:** Accepted. Amends ADR-025.

**Context.**
- Lighthouse (mobile, throttled CPU) scored the homepage 0.61: about 930 ms of blocking time, mostly GSAP building the pinned story timeline right after load (one 660 ms task), and a 4.7 s LCP because the subtitle, the largest text, faded in after a delay.
- The story's starting picture is plain CSS (ADR-025), so nothing needs GSAP until the visitor moves.

**Decision.**
- `first-interaction.ts` arms the scroll effects on the first `pointerdown`, `touchstart`, `wheel`, `keydown` or `scroll` (or at once when the page opens already scrolled). Only then are GSAP + ScrollTrigger and Lenis loaded with dynamic `import()` and the timeline built. `@gsap/react` is no longer needed (a plain `useEffect` with `gsap.matchMedia(scope)`).
- The subtitle is visible from the first paint and only slides up.
- `/galeri` loads its first card with `loading="eager"` + `fetchpriority="high"`; image components preconnect to the Storage origin.
- The paw trail's step-in uses CSS scroll-driven animations (`animation-timeline: view()`), no JavaScript.

**Alternatives considered.**
- *Build the timeline in `requestIdleCallback`:* still a long task inside Lighthouse's window and on a busy phone.
- *Drop the pinned story:* rejected; the developer approved it.

**Consequences.**
- Homepage performance 0.97–0.99 locally; ~110 KB of GSAP left the first load.
- The first scroll pays the setup cost once (a short pause on slow phones); the story starts from the top either way.
- `/galeri` stays around 0.8 under Lighthouse's simulated slow network: its LCP is a photo from another origin, which the simulation queues behind the framework JavaScript every page loads; measured loads show it within ~70 ms. CI reports performance as a warning only.

---

## ADR-033: How the admin sign-in is built (M3 identity)

- **Date:** 2026-11-23
- **Status:** Accepted. Implements ADR-006.

**Decision.**
- **Sessions:** `@supabase/ssr` with the cookie options of ADR-006 (`HttpOnly`, `SameSite=Lax`, `Path=/admin`, `Secure` in production; browsers also accept `Secure` on `http://localhost`). `adminClient()` reads them in Server Components and Actions; `proxy.ts` refreshes and saves them.
- **Strict CSP:** `proxy.ts` sets a per-request nonce (`script-src 'self' 'nonce-…' 'strict-dynamic'`, no inline scripts, `frame-ancestors 'none'`, Turnstile and Storage allowed). The public CSP in `next.config.ts` is not sent on `/admin`, because two CSP headers would both be enforced. Under Cache Components a nonce only reaches the scripts of a page rendered for that request, so the admin layout sets `instant = false` and calls `connection()`: admin pages are never prerendered.
- **Routing:** `proxy.ts` decides the first step from the session (signed out → giriş; password only → 2FA setup or code; full → panel). Server Actions render their redirect target in the same request, so the proxy doesn't see it: `signIn` and `requireAdmin()` compute the next step themselves (`nextSignInStep`).
- **The real gate:** `requireAdmin()` = a valid `aal2` session **and** `public.current_admin_name()` (a security-definer function over `private.admins`, applying `private.is_admin()`). RLS checks again.
- **Password reset:** the email link goes to `/admin/auth/confirm` (token check, session cookie), then the 2FA code, then the new password. Turkish template in `supabase/templates/recovery.html`; the same text goes into each cloud project.
- **Turnstile:** shown when `TURNSTILE_SITE_KEY` is set; Supabase checks the token (captcha enabled in the cloud projects only, so local and CI run without it).
- **Tests:** a Vitest test finds every exported Server Action in `src/modules/*/actions.ts` and calls each without a session; only an explicit allowlist (the sign-in steps) may run. E2E creates a throwaway admin on the local Supabase (Auth admin API + `postgres` dev dependency for `private.admins`), computes TOTP codes like an authenticator app, and reads the reset email from local Mailpit.

**Alternatives considered.**
- *Hash-based CSP (experimental SRI):* keeps prerendering, but experimental; the admin doesn't need prerendering.
- *Relying on proxy.ts alone for routing:* breaks after Server Actions (above).
- *A Supabase client in the browser for MFA enrolment:* would need a browser-readable token; ADR-006 keeps tokens server-side.

**Consequences.**
- Admin pages render per request (fine for two admins).
- E2E for the admin runs in the desktop project only (one shared test account) and needs Mailpit in CI.
