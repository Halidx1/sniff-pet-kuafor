# SNIFF PET KUAFÖR — WEBSITE SPECIFICATION (for Claude Code)

> Save this file as `docs/SPEC.md` in the repository. It is the single source of truth for requirements. If a requirement changes, update this file first.

**Revision history**

- 2026-11-11: Changes agreed in the Phase A plan review (see `docs/PLAN.md` and `docs/decisions.md`):
  - Git policy and Docker (§0)
  - Interim logo (§5)
  - Palette: muted text, caramel accent, danger colour; Instagram posts as demo tiles (§6)
  - Partial-day and emergency closures (§12, §14)
  - Mandatory admin 2FA (§14)
  - Storage bucket model (§16)
  - Single `docs/decisions.md` and MoSCoW milestones (§17)

---

## 0. HOW TO WORK ON THIS PROJECT

Act as a senior full-stack engineer, UI/UX designer and brand-aware front-end developer. You are building a production website for a real small business. The project is also a portfolio piece for me (the developer) and a gift to a friend who owns the business, so code quality and documentation matter as much as the visible result.

### Phase A — Plan (plan mode, no code yet)

Read this entire document first. Then produce a plan that contains:

1. **Architecture overview**: what runs where (browser, server, database, storage, scheduled jobs) and how the public site, admin panel and database interact. Include a Mermaid diagram.
2. **Database design**: tables, columns, enums, constraints, indexes, Row Level Security (RLS) policies and storage buckets.
3. **Route map** for the public site and `/admin`.
4. **Availability and booking algorithm**, including how double booking is prevented at database level (not only in the UI).
5. **Production hosting recommendation** based on section 3, with reasons.
6. **Milestones** (see section 17), each ending in a working, deployable state with a short checklist I can use to test it.
7. **Assumptions** you are making and **questions** you need answered.
8. **Risks** (free-tier limits, security, personal data) and how the plan mitigates them.

Do not write code until I approve the plan. After approval, save it as `docs/PLAN.md` and create a concise `CLAUDE.md` containing the project's conventions, folder structure and common commands.

### Phase B — Build

- Work one milestone at a time. At the end of each milestone, stop and give me: a summary of what was built, anything I must do manually (create accounts, copy keys, change dashboard settings), and how to test it.
- Make small, focused commits with clear messages.
- Keep `docs/PLAN.md` current when decisions change.

### About me (pitch explanations at this level)

- I'm a computer science student. Java is the language I'm most comfortable in; I'm new to TypeScript, React, Next.js, Tailwind and Supabase. Briefly explain non-obvious decisions in plain terms (comparisons to Java or general backend concepts help). Prefer conventional, well-documented patterns over clever abstractions.
- I use git mostly through the GitHub UI.
  - Claude pushes feature branches and opens pull requests; I review and merge them in the GitHub UI ("Squash and merge").
  - Rebasing, force-pushing (`--force-with-lease`) and rewriting history are allowed **only on Claude's own unmerged feature branches**. Each case is explained in the PR (policy: ADR-017 in `docs/decisions.md`).
  - Never on `main` or `production`.
  - When I need to run a command, give me the exact command.
- I rarely use Docker, but accepted it for this project. The local Supabase stack runs in Docker so every branch can run the full test suite locally (ADR-004). Explain Docker steps in plain terms.

### Non-negotiable rules

- **Never invent business facts**: opening hours, prices, services, durations, staff, years of experience, certificates, awards, reviews or customer numbers. Use clearly marked placeholders and list them as open questions (section 18).
- **Never commit secrets, real customer data or `.env` files.** Assume the repository will be public.
- **Never create fake photographs** (including AI-generated images) that represent the actual shop, its employees or its customers.
- All customer-facing and admin-facing text is in Turkish (section 4).

---

## 1. PROJECT SUMMARY

**Sniff Pet Kuaför** is a cat and dog grooming business in Gölbaşı, Ankara, Turkey. We are building three things:

1. **A public website** — Turkish only, mobile-first, with the feel of a carefully designed boutique grooming brand, not a generic pet-shop template.
2. **An admin panel at `/admin`** — the non-technical owner logs in (usually from a phone) and manages services, prices, photos, FAQ, business information, working hours and the customer history without touching code.
3. **A customer history with return reminders** (admin only) — staff record customers, pets and the services applied with dates; the panel lists pets due for their next grooming so the shop can invite them back with one tap (§12A). *An online appointment request system (§12) is postponed to a later version.*

Every change made in `/admin` must appear on the public site automatically within seconds, without a redeploy.

---

## 2. TECH STACK

This is my proposal. Challenge anything in the plan if there is a better free option.

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict mode) |
| Styling | Tailwind CSS, with brand colors and fonts defined as theme tokens |
| Database | Supabase Postgres, with SQL migrations versioned in the repo |
| Auth | Supabase Auth — admin accounts only, no public sign-up |
| File storage | Supabase Storage (gallery, service and Instagram-preview images) |
| Validation | Zod schemas shared between client and server |
| Transactional email | Free tier of a provider such as Resend (optional, see section 3) |
| Spam protection | Cloudflare Turnstile (free) + honeypot field + server-side rate limiting |
| Maps | MapLibre GL + OpenFreeMap tiles (no API key, no cookies) showing only the shop's pin + "Yol Tarifi Al" link to Google Maps (ADR-020) |
| Source control & CI | GitHub + GitHub Actions |
| Testing | Vitest (unit tests), Playwright (a few end-to-end flows) |
| Hosting | See section 3 |

Keep the application **host-agnostic**: do not depend on host-specific services (e.g. Vercel Blob, KV, Edge Config or Vercel Cron). Use Supabase for data and files, and GitHub Actions for scheduled jobs, so the hosting provider can be swapped.

---

## 3. FREE-TIER CONSTRAINTS (must be addressed in the plan)

The project must run at €0/month. The only expected cost is a domain name (small yearly fee), which is also needed to send email from a proper address.

- **Hosting.** Vercel's free Hobby plan is restricted to personal, non-commercial use, and a business website counts as commercial. Use Vercel (or the chosen host's preview deployments) for development previews only. For production, compare free plans that allow commercial use — for example Netlify's free plan, or Cloudflare Workers with the OpenNext adapter — and recommend one. Check their current Next.js support and free limits (builds/deploys, function invocations, image optimisation) before recommending.
- **Supabase free projects pause after about 7 days of low activity.** A quiet week must not take the booking system offline. Add a scheduled GitHub Actions workflow that performs a lightweight database read every few days, plus a simple health-check endpoint. Document how to resume a paused project.
- **The Supabase free plan has no automatic backups.** Provide (a) a CSV export of appointments in the admin panel and (b) a scheduled, encrypted backup job whose output is never publicly accessible (no workflow artifacts on a public repository).
- **Storage limits.** Resize and compress images in the browser before upload (e.g. max ~1600 px on the long edge, WebP), enforce an upload size limit, and delete files from storage when an image is removed in the admin panel.
- **Two free Supabase projects**: use one for development and one for production.
- **Email.** Sending to arbitrary recipients usually requires a verified domain. Email notifications must be optional; the whole system must work without them.

Document all of this in the README under "Running costs & limits".

---

## 4. LANGUAGE AND LOCALISATION

- Website language: **Turkish only** — navigation, forms, buttons, validation and error messages, emails, the admin panel, empty states and the 404 page. Do not create English-language sections.
- Use natural, professional Turkish with correct characters: ş, ğ, ü, ö, ç, İ, ı.
- Set `<html lang="tr">` so CSS `text-transform: uppercase` maps i → İ correctly. In JavaScript use `toLocaleUpperCase('tr-TR')` / `toLocaleLowerCase('tr-TR')`.
- Format dates, times and currency with the `tr-TR` locale (e.g. `₺1.250`). Timezone: `Europe/Istanbul`. Store timestamps as `timestamptz`.
- URL slugs use ASCII: `/hizmetlerimiz`, `/fiyatlarimiz`, `/hakkimizda`, `/galeri`, `/sss`, `/iletisim`, `/randevu-al`, `/kvkk`.
- Turkish phone numbers: accept common formats (`0532 123 45 67`, `+90 532 123 45 67`, `5321234567`) and normalise to E.164.
- Code, comments, commit messages, README and technical docs are in English. Only the owner's guide (section 14) is in Turkish.

---

## 5. BRAND IDENTITY

- **Business name:** Sniff Pet Kuaför
- **Slogan:** Kedi ve Köpek Bakımında Profesyonel Dokunuş
- **Category:** Cat and dog grooming / pet care
- **Address:** Gaziosmanpaşa Mahallesi, Şehit Ali Gaffar Okkan Caddesi, Baran Apartmanı, 43/B, Gölbaşı, Ankara, Türkiye
- **Google Maps:** https://maps.app.goo.gl/ipSQ9QxkoMe3rBi49
- **Instagram:** https://www.instagram.com/sniffpetkuafor/
- **Logo:** I will place the supplied logo in `public/brand/`. Use it as the primary brand asset. Do not redesign, distort, recolor, recreate or replace it.
  - Until the original file arrives, use an interim transparent PNG extracted from `sources/images/logo_+_coming_soon.png`: cropped, with the background made transparent.
  - No redrawing, recolouring or vectorising.

Address, phone, WhatsApp number, email, Instagram URL and map link are stored as **editable business settings** in the database, not hard-coded. Seed them with the values above; phone, WhatsApp and email start empty.

---

## 6. VISUAL DESIGN AND ART DIRECTION

The design must closely follow the logo: a deep navy illustration on a warm cream background. Extend this identity throughout the website.

### Color palette (define as Tailwind theme tokens)

| Token | Hex | Use |
|---|---|---|
| navy | `#07152B` | Navigation, typography, buttons, important elements |
| cream | `#F5E1CE` | Hero sections, backgrounds, decorative shapes, brand highlights |
| white | `#FFFFFF` | Content cards, service sections, forms |
| neutral-bg | `#FAF6F1` | Soft page background. Oat and sky blue were tried in the M2 review and rejected; the original whites stay (ADR-024). |
| beige | `#E9D8C6` | Secondary warm accents |
| muted-text | `#66625E` | Subtle supporting text. Darkened from `#77736F`, which failed WCAG AA on cream (3.7:1). 5.62:1 on neutral-bg, 6.05:1 on white. Not used on beige. |
| caramel | `#C98A4B` | Accent: badges, paw accents, decorative shapes, highlights. Text on it is always navy. Never used as a text colour on light backgrounds. |
| danger | `#A63D2A` | Error messages and destructive buttons only. Success uses navy + a ✓ icon. |

Avoid colors beyond these tokens. Check that all text/background combinations meet WCAG AA contrast (muted text in particular).

### Typography

- Headings: Nunito Sans (or a similarly rounded, confident typeface).
- Body: DM Sans (or a similarly clean sans-serif).
- Load fonts with `next/font` including the `latin-ext` subset so all Turkish characters render in the brand font.

### Design personality

Friendly and welcoming; professional and trustworthy; modern and slightly playful; premium but approachable; pet-oriented without looking childish; clean, with generous whitespace.

Use rounded corners, subtle shadows, soft background transitions and organic shapes inspired by paws and pet silhouettes. Use small paw-print details as occasional accents, not everywhere. Avoid excessive animation (respect `prefers-reduced-motion`), except the one scroll-driven grooming story at the top of the homepage (§8, issue #64), which falls back to a static picture. Avoid visual clutter, generic pet-shop templates and overly colorful cartoon illustrations.

Build a small, reusable component set once (Button, Card, SectionHeading, Badge, etc.) and use it everywhere.

### Illustrations

The homepage story uses illustrated characters (§8). They may be drawn by hand, generated from shapes in code, or generated with an AI image model (ADR-028), as long as they are clearly illustrations of generic animals: never photo-realistic, never presented as the shop's work, staff or customers. Every illustration source is credited in `docs/IMAGE_CREDITS.md`.

### Photography

No real business photography exists yet.

- Use high-quality, free-licence stock photography (e.g. Unsplash, Pexels) of clean, healthy cats; beautifully groomed dogs; professional grooming environments; bathing and grooming; close-up pet portraits. Realistic photography, not illustrations.
- Every image is stored in Supabase Storage as a database record flagged `is_demo = true`, so the owner can replace it from `/admin` without any redesign.
- Record source and photographer for each stock photo in `docs/IMAGE_CREDITS.md`.
- If you cannot download images yourself, use neutral placeholder blocks in the brand colors and give me a list of search terms and required aspect ratios so I can pick photos.
- The three branded posts in `sources/images/` (`brushing.jpg`, `feeding.jpg`, `nailing.jpg`) are the shop's Instagram posts. Their original source is unknown and they may be AI-generated.
  - Use them only as demo Instagram-preview tiles (`is_demo = true`).
  - Never as hero or gallery photos.

---

## 7. SITE MAP AND NAVIGATION

Public pages:

1. Anasayfa — `/`
2. Hizmetlerimiz — `/hizmetlerimiz`
3. Fiyatlarımız — `/fiyatlarimiz`
4. Hakkımızda — `/hakkimizda`
5. Galeri — `/galeri`
6. Sıkça Sorulan Sorular — `/sss`
7. İletişim — `/iletisim`
8. Randevu Al — `/randevu-al`
9. KVKK Aydınlatma Metni — `/kvkk` (linked from footer and booking form)
10. Custom 404 page in Turkish

**Header:** logo on the left, navigation links on the right, a visually prominent navy **"Randevu Al"** button. Sticky while scrolling, without being excessively tall.

**Mobile:** clean hamburger menu, plus a convenient, always-reachable appointment button.

**WhatsApp:** when a WhatsApp number is set in business settings, show a discreet floating **"WhatsApp ile Yazın"** button (a `wa.me` link with a prefilled Turkish greeting). Hide it when no number is set.

**Footer:** address, phone/WhatsApp (when set), Instagram link, links to main pages and KVKK, copyright.

---

## 8. HOMEPAGE

All texts below are the initial content. Store section texts where it's practical so the owner can edit them later; at minimum the hero texts and welcome text must be editable.

### Hero section

A **scroll-driven grooming story** (issue #64, added after the M2 review; design in progress). The first screen shows the texts below next to an illustrated scruffy dog. As the visitor scrolls, the dog is brushed, its fur is trimmed with scissors, and then a cat is brushed. Illustrations are original flat drawings in navy and caramel on cream, never photos, AI images or a redrawn logo. The scenes show only grooming already listed in §9 and carry no captions with new claims.

- The texts are real HTML, visible on the first screen without scrolling.
- Native scrolling only; nothing is hijacked.
- With `prefers-reduced-motion`, the story is a static picture of the groomed pets.

Texts:
- Headline: **"Küçük Dostlarınız, Büyük Bir Özeni Hak Ediyor!"**
- Subtitle: **"Kedi ve Köpek Bakımında Profesyonel Dokunuş."**
- Supporting text: **"Minik dostlarınızın bakım ihtiyaçları için özenli, sevgi dolu ve profesyonel bir yaklaşım."**
- Primary button: **"Hemen Randevu Al"** → `/randevu-al`
- Secondary button: **"Hizmetlerimizi Keşfet"** → `/hizmetlerimiz`

After the story, a **paw trail**: the brand introduction and the four "why choose us" points appear inside paw-print shapes, alternating left and right like footsteps (one column on phones). The first paw holds the hero photo of a freshly groomed dog and/or cat (replaceable from admin).

### Brand introduction

Heading: **"Sniff Pet Kuaför'e Hoş Geldiniz!"**

Introduce the business as a cat and dog grooming destination in Gölbaşı, Ankara, in friendly and sincere Turkish. Do not invent history, years of experience, qualifications, certificates or awards.

### Services overview

Heading: **"Dostlarımız İçin Bakım Seçenekleri"**

Show cards for **published** services only (data from the database). Link: **"Tüm Hizmetleri Gör"** → `/hizmetlerimiz`.

If no services are published yet, show the fallback text from section 9 instead of empty cards.

### Why choose us?

Heading: **"Minik Dostlarınız İçin Özenli Bakım"**

Four paws in the paw trail (see Hero section):
- Özenli Bakım
- Kedi ve Köpeklere Özel Yaklaşım
- Randevulu Hizmet
- Gölbaşı'nda Kolay Ulaşım

Short supporting text for each, with no unverified claims about qualifications or certifications.

### How appointments work

Heading: **"Randevunuz Birkaç Adımda Hazır"**

1. Dostunuzu seçin.
2. İhtiyacına uygun bakım hizmetini seçin.
3. Uygun tarih ve saat için talebinizi oluşturun.
4. Randevu onayınızı bekleyin.

Followed by an appointment CTA.

### Gallery preview

Heading: **"Bakım Sonrası Mutlu Patiler"**

Responsive photo grid of published gallery images. Button: **"Galeriyi Gör"** → `/galeri`.

### Instagram section

Heading: **"Bizi Instagram'da Takip Edin"**

A small grid of the shop's latest Instagram posts plus a follow button, all linking to https://www.instagram.com/sniffpetkuafor/.

**Instagram sync (ADR-029, changed on 2026-11-23):** the shop's own posts come in through the official Instagram API.
- A daily server-side job fetches new posts, including every photo of a carousel, and copies the photos into our own storage in the usual sizes (Instagram's photo links expire). Each post becomes one group.
- New posts arrive in the admin panel as **drafts** with a badge. The owner publishes each with one tap, as a before/after card ("Önce / Sonra") in the gallery or as a carousel, or skips it (e.g. product photos, announcements). Nothing appears on the site without that tap.
- Requirements: the shop's account is a Professional account (free), and the owner authorises a Meta app once. The access token lasts 60 days and the job renews it. If the token expires anyway, the admin panel shows a warning with a "reconnect" step, and the site keeps the photos it already has.
- Without the sync (before setup, or when it fails), the admin can still upload images by hand as before.

### Location preview

Heading: **"Bizi Ziyaret Edin"**

Show the address and a map with **only the shop's pin** — no other businesses or points of interest (ADR-020). The pin uses the coordinates stored in business settings; without coordinates, no map is shown. Button **"Yol Tarifi Al"**, a tap on the map and a tap on the pin all open directions: the phone's maps app (Apple Maps on iOS, the default app via a `geo:` link on Android) or, on a computer, the Google Maps URL from business settings in a new tab. The map's licence info (attribution) starts collapsed behind its "i" button. The map must not break the layout on narrow screens.

### Final call to action

Heading: **"Minik Dostunuz İçin Bir Bakım Randevusu Oluşturalım!"**
Button: **"Randevu Al"**

---

## 9. SERVICES PAGE (`/hizmetlerimiz`)

A dedicated service catalogue, grouped into:
- Kedi Bakımı
- Köpek Bakımı
- Genel Bakım

Each service card shows: name, description, suitable pet type (Kedi / Köpek / Her ikisi), image, estimated duration **only when verified**, price or starting price **only when verified**, and an appointment button that opens the booking flow with that service preselected.

The owner can add, edit, hide, delete and reorder services from `/admin` (reordering must work on a phone, e.g. up/down buttons).

### Proposed demo services (seed as unpublished drafts)

- Banyo ve Kurulama
- Tıraş ve Tüy Bakımı
- Tarama ve Düğüm Açma
- Tırnak Bakımı
- Kulak ve Göz Çevresi Temizliği
- Komple Bakım

**IMPORTANT:** These are proposed examples, not verified business offerings. Seed them as drafts with `is_demo = true`. They must never appear on the public site until the owner edits and publishes them.

While no services are published, show:

> "Size ve minik dostunuza en uygun bakım seçenekleri hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz."

---

## 10. PRICING PAGE (`/fiyatlarimiz`)

Heading: **"Bakım Hizmetlerimiz ve Fiyatlarımız"**

The pricing model must support:
- Price tiers: Kedi, Küçük Köpek, Orta Köpek, Büyük Köpek.
- Different grooming services, each with its own price per tier.
- Price types: fixed price, starting price ("₺… 'den başlayan"), or "Fiyat için iletişime geçin".
- Optional additional services (add-ons) with their own prices.
- Estimated duration per service **and** tier (a large dog takes longer than a small one); the booking system uses these durations.
- Currency: Turkish Lira (₺).

Render a clear, mobile-friendly price table built from the same service data managed in `/admin` — prices are entered once and used on both the services and pricing pages.

**IMPORTANT:** No genuine price list exists. Seed provisional example prices as drafts marked internally **DEMO / OWNER APPROVAL REQUIRED**. Never publish invented prices.

While no prices are published, show:

> "Bakım fiyatlarımız; dostumuzun ırkına, boyutuna, tüy yapısına ve ihtiyaçlarına göre değişiklik gösterebilir. Güncel fiyat bilgisi için bizimle iletişime geçebilirsiniz."

Button: **"Fiyat Bilgisi Al"** → WhatsApp (if set), otherwise `/iletisim`.

---

## 11. OTHER PAGES

- **Hakkımızda:** editable rich text and an optional image. Initial copy is warm and general; no invented history or credentials.
- **Galeri:** responsive grid with a lightbox; optional categories (Kedi / Köpek). Images have Turkish alt text.
- **Sıkça Sorulan Sorular:** accordion of published FAQ items, managed in admin. Seed a few sensible draft questions (e.g. how appointments work, what to bring) as unpublished drafts with placeholder answers.
- **İletişim:** address, map, phone, WhatsApp, Instagram, "Yol Tarifi Al". No separate contact form in v1 (WhatsApp/phone is the preferred channel); the booking form handles requests.
- **KVKK:** placeholder Aydınlatma Metni (see section 16), clearly marked for owner review.

---

## 12. APPOINTMENT REQUEST SYSTEM — POSTPONED (later, ADR-026)

> **Postponed on 2026-11-23.** Online booking is not part of v1; the customer history and return reminders in §12A take its place. `/randevu-al` keeps showing phone, WhatsApp and Instagram. The requirements below are kept for a later version.

It must create real records with real availability — not a decorative form.

### Customer flow (`/randevu-al`)

A clear, step-by-step flow with a progress indicator, working well on phones. Validation messages in Turkish.

**Step 1 — Pet type:** Kedi / Köpek

**Step 2 — Service:** published services filtered by pet type. Optional add-ons.

**Step 3 — Pet information:**
- Dostunuzun adı
- Irk
- Boyut: Küçük / Orta / Büyük (required for dogs; hidden or adapted for cats)
- Kilo (optional)
- Ek bakım istekleri (optional)
- Özel notlar (optional, e.g. health or behaviour notes)

**Step 4 — Date and time:**
- Calendar showing only days with availability.
- Available start times for the chosen service + size, computed from real availability.
- Must respect durations, working hours, closures, buffer times and capacity.

**Step 5 — Customer information:**
- Ad Soyad (required)
- Telefon (required, Turkish format)
- E-posta (optional)
- Ek notlar (optional)
- Required KVKK acknowledgement checkbox with a link to `/kvkk`. Do not bundle marketing consent into it; if any explicit consent is ever needed, it must be a separate, optional checkbox.

**Step 6 — Submit:** button **"Randevu Talebi Gönder"**.

Completion message:

> "Randevu talebiniz başarıyla alınmıştır. Randevunuz işletme tarafından onaylandıktan sonra kesinleşecektir. İlginiz için teşekkür ederiz!"

Also show a short reference code (e.g. `SP-4821`) the customer can mention when contacting the shop.

### Booking rules

- **Manual approval.** Every request starts as pending. Nowhere (UI, emails, messages) may a request be presented as a confirmed appointment before the owner approves it.
- **Pending requests hold their slot** so two customers can't request the same time. Rejecting or cancelling frees the slot. Optional setting: auto-expire pending requests the owner hasn't handled after N hours.
- **No double booking**, enforced in the database inside a transaction (e.g. a Postgres exclusion constraint on time ranges, or a locked capacity check if capacity > 1). Re-check availability on submit; if the slot was taken meanwhile, show a friendly Turkish message and let the customer pick another time.
- **Availability model** (all editable in admin, none invented):
  - Weekly working hours, with multiple intervals per day (e.g. a lunch break).
  - Closures: whole days, date ranges or part of a day (e.g. "bugün 14:00'ten itibaren"), with an optional public note shown as a site-wide banner.
    - An **"Acil kapanış"** quick action on the admin dashboard creates one in two taps for unexpected events.
    - A closure stops new bookings for that window immediately.
    - Existing bookings inside it are **never cancelled automatically**. The admin sees them listed and can bulk-cancel them (`cancel_reason = business_closed`), then notify each customer via WhatsApp (one tap per customer) and, when configured, email.
  - Slot granularity (e.g. every 15 or 30 minutes).
  - Buffer time between appointments.
  - Capacity: number of appointments that can run in parallel (default 1). Staff-level scheduling is out of scope for v1, but the design shouldn't block it.
  - Minimum notice (e.g. no bookings within X hours) and maximum days ahead.
- **Master switch: `booking_enabled`, default OFF.** While off (or while no working hours or published services exist), `/randevu-al` shows a friendly message with the phone/WhatsApp contact instead of the form. Online booking is switched on only after the owner has confirmed hours, services and durations.
- **Snapshot** the service name, tier, price info and duration onto the booking at request time, so later price edits don't change past bookings.
- **Spam protection:** Turnstile, honeypot and rate limiting on submission.
- **No online payments** in v1. Keep the design open to adding deposits later, without building anything for it now.

### Statuses

`pending` (Beklemede), `confirmed` (Onaylandı), `rejected` (Reddedildi), `cancelled` (İptal Edildi), `completed` (Tamamlandı), `no_show` (Gelmedi). Enum values in English in code; labels in Turkish in the UI.

---

## 12A. CUSTOMER HISTORY AND RETURN REMINDERS (replaces online booking in v1, ADR-026)

Staff record every visit in the admin panel: which customer, which pet, which services, when. From that history the panel shows which pets are **due** for their next grooming, so staff can invite the customer back with one tap (§13). Online booking (§12) is postponed.

### What is recorded (admin only, never public)

- **Customer:** full name, phone, WhatsApp number (usually the same), optional email, notes.
  - KVKK: the date and version of the Aydınlatma Metni the customer was informed with (§16), recorded when staff create the customer.
  - **Reminder consent**, separate and optional: whether the customer wants return reminders, when and how they agreed (in person, WhatsApp, phone). No consent → never reminded.
- **Pet:** name, species (Kedi / Köpek), **pet type** (e.g. "Uzun tüylü köpek", "Kısa tüylü kedi"; the list is defined by the owner), breed (optional), notes (e.g. health or behaviour), optional **own reminder interval**.
- **Visit:** pet, date, services applied (picked from the services list, with a snapshot of each name), optional note. Price paid is optional.
- **Reminder actions:** when a reminder was sent, by whom, through which channel, and the outcome: randevu aldı / istemiyor / cevap yok / ertelendi.

### When a pet is due

- Each **pet type** has a default interval in days, set by the owner (none invented: until it's set, the pet appears as "aralık belirlenmedi").
- Staff can set a different interval for a single pet; it wins over the type's default.
- Due date = date of the pet's last visit + interval. The list shows pets from a few days before the due date (setting) and overdue ones.
- A pet isn't shown again for a while after a reminder (setting), or while it is snoozed.

### Reminder list (admin)

- Tabs: **Bu hafta**, **Gecikmiş**, **İzin yok** (due, but the customer hasn't agreed to reminders: shown for information only, no message button).
- Each row: pet and customer name, pet type, last visit and services, due date.
  - **"WhatsApp'tan yaz"** opens `wa.me/<number>` with a prefilled, editable Turkish message from a template the owner edits (placeholders for customer name, pet name, last service). The owner presses send in WhatsApp.
  - **"Ara"** (`tel:` link).
  - Outcome buttons: Randevu aldı, İstemiyor, Cevap yok, Ertele.
- The panel's dashboard shows how many pets are due this week.

### Later: automatic reminders

Designed for, not built in v1: the same reminder can later be sent automatically (WhatsApp Business API, SMS or email) by a scheduled job, for consenting customers only, once the legal checks are done (§18: İYS registration and commercial-message rules) and the owner accepts the running costs.

### Customer data rights (KVKK)

- Export one customer's data (CSV) on request.
- Delete one customer completely (pets, visits and reminders with them), with confirmation.
- Anonymise customers with no visit for a period the owner chooses (§16).

---

## 13. NOTIFICATIONS

Must cost nothing and work without a domain.

- **Return reminders (v1, ADR-027):** staff send them from the reminder list (§12A) with **"WhatsApp'tan yaz"**: `wa.me/<customer number>` with a prefilled, editable Turkish message from the owner's template, sent from the shop's own WhatsApp. Only customers who agreed to reminders get the button.
- **Ready for automation later:** the reminder logic doesn't depend on how a message is delivered (a "channel" seam), so an automatic channel (WhatsApp Business API, SMS, email) can be added later without changing the rest, after the legal checks in §18.
- **Booking notifications** (approve/reject messages) belong to the postponed booking system (§12).
- SMS and the WhatsApp Business API are out of scope for v1 (paid, and they need İYS registration and consent handling).

---

## 14. ADMIN PANEL (`/admin`)

The owner is not technical and will mostly use a phone. The admin panel must be in Turkish, mobile-first, simple and forgiving (confirmation before deleting, clear success/error messages).

### Access

- Supabase Auth with email + password. No public sign-up; accounts are created manually (owner, developer and, for the customer history, shop employees). In v1 every account has the same rights; roles are an open question (§18).
- **Two-factor authentication (TOTP authenticator app) is mandatory for every admin account.**
  - It is enforced in the database: admin RLS requires an `aal2` session.
  - First login forces enrolment.
  - A lost phone is fixed by the developer removing the factor in the Supabase dashboard.
- Cloudflare Turnstile protects the login and password-reset forms.
- Admin session cookies are HttpOnly, Secure, SameSite=Lax and scoped to `/admin`. The browser never holds a Supabase client or token.
- All `/admin` routes are protected on the server, not only hidden in the UI.
- "Şifremi unuttum" and change-password flows.
- `/admin` is excluded from search engines.

### Sections

1. **Panel (dashboard):** pets due for a reminder this week, today's visits, quick links ("Ziyaret ekle", "Yeni müşteri"), and the **"Acil kapanış"** quick action.
2. **Müşteriler (§12A):** search by customer name, phone or pet name; create and edit customers and their pets; each customer's visit history. **"Ziyaret ekle"** is a quick, phone-friendly flow for the counter: pick the pet, tick the services, date (today by default), optional note; it shows the next due date. Export and delete one customer (KVKK).
3. **Hatırlatmalar (§12A):** the reminder list with "WhatsApp'tan yaz", "Ara" and the outcome buttons.
4. **Hizmetler:** create, edit, hide/publish, delete, reorder. Fields: name, description, category, pet type, image, per-tier price/price type/duration, add-ons. Clear **DEMO — İşletme onayı gerekli** badge on demo items.
5. **Galeri:** upload (resized in the browser), alt text (required), caption, category, reorder, publish/hide, delete. Same for Instagram-preview images and the hero image. **Yeni Instagram gönderileri:** synced drafts with "Önce / Sonra kartı olarak yayınla", "Karusel olarak yayınla" and "Atla" (ADR-029); the connection status, with the reconnect step when needed.
6. **SSS:** create, edit, reorder, publish/hide, delete.
7. **Çalışma Saatleri:** weekly hours and closed dates. (The booking settings of §12 come back with online booking.)
8. **Hatırlatma Ayarları:** pet types and their default intervals, the WhatsApp message template, how many days before the due date pets appear, the pause after a reminder, and the anonymisation period.
9. **İşletme Bilgileri:** phone, WhatsApp, email, address, map link, Instagram URL, homepage hero texts, welcome text, About text.
10. **Hesap:** change password, sign out.

Every mutation triggers on-demand revalidation of the affected public pages so changes appear within seconds. Store `created_at`, `updated_at` and `updated_by` on editable records.

### Owner's guide

Write `docs/YONETICI_REHBERI.md`: a short Turkish guide with steps for logging in, adding a service, changing a price, uploading photos, adding a customer and a visit, and sending reminders. Plain language, no technical terms.

---

## 15. DEMO AND DRAFT CONTENT

- Every seeded service, price, FAQ item and stock image has `is_demo = true` and starts unpublished (except stock images used purely as visual decoration, which may be shown but remain flagged and replaceable).
- Public pages never show demo services, demo prices or demo FAQ answers.
- When the owner edits and publishes a demo item, it becomes real (`is_demo = false`).
- The admin dashboard shows a checklist of what still needs the owner's input (e.g. "Çalışma saatleri girilmedi", "Yayında hizmet yok", "Telefon numarası eksik").

---

## 16. SEO, PERFORMANCE, ACCESSIBILITY, SECURITY, PRIVACY

### SEO

- Turkish titles and meta descriptions per page; Open Graph images.
- `LocalBusiness` JSON-LD using only verified data (name, address, map, Instagram; hours only once entered by the owner).
- `sitemap.xml` and `robots.txt`; `/admin` is `noindex`.

### Performance

- Optimised, responsive images (check the chosen host's free image-optimisation limits; fall back to pre-sized images from upload if needed).
- Aim for Lighthouse ≥ 90 in all categories on mobile for the main pages.

### Accessibility

- WCAG AA contrast, visible focus styles, full keyboard navigation, semantic headings, labelled form fields, alt text on all images, `prefers-reduced-motion` respected.

### Security

- RLS enabled on every table. The public (anonymous) role can read only published content.
- Booking submissions go through a server-side endpoint/action that validates input (Zod), verifies Turnstile, rate-limits, and writes via a database function in a transaction. No direct anonymous writes to tables.
- Storage: a single public bucket with unguessable paths and no listing, so unpublished images can't be discovered (ADR-009). Writes only for admins, through signed upload URLs. Only WebP/JPEG up to 2 MB.
- The Supabase service-role key is used only on the server and never reaches the browser.
- Sensible security headers.
- Provide `.env.example`; never commit real values.

### Privacy (KVKK)

- `/kvkk` contains a placeholder Aydınlatma Metni draft, clearly marked as requiring review by the owner (ideally with legal advice). Use placeholders for the data controller's (veri sorumlusu) legal name and contact details.
- **Customer history (§12A):** staff inform each customer with the Aydınlatma Metni at the shop (printed or shown) before recording them; store which notice version and when.
- **Reminder consent is separate and optional**, never bundled with the KVKK notice; store when and how it was given, and let the customer withdraw it at any time (staff untick it).
- Collect only what's needed. A retention setting anonymises customers with no visit for a period the owner chooses; one customer's data can be exported or deleted on request.
- The KVKK notice must be extended to describe the customer history and the reminders before this feature goes live (owner + legal review).
- Choose the Supabase region closest to Turkey (an EU region). Flag cross-border data transfer as a point for the owner to review — this is a legal question, not something to solve in code.

---

## 17. ENGINEERING QUALITY AND MILESTONES

### Quality bar (this is a portfolio project)

- TypeScript strict mode, ESLint and Prettier; no `any` without justification.
- Database migrations and a seed script in the repo; generated database types.
- Unit tests for the availability/slot logic (working hours, breaks, buffers, capacity, closures, timezone, minimum notice) and for validation schemas.
- A few Playwright end-to-end tests: booking happy path, slot conflict, admin approves a request, admin publishes a service and it appears publicly.
- GitHub Actions: lint, typecheck and tests on every pull request; scheduled keep-alive and backup workflows (section 3).
- README in English: what the project is, screenshots, Mermaid architecture diagram, tech stack and why, local setup, environment variables, deployment, running costs & limits.
- Decision records in a single `docs/decisions.md`, in standard ADR format (title, date, status, context, decision, alternatives considered, consequences). Superseded records are marked, never deleted.
- Every branch is tested as much as possible:
  - unit, integration, database (pgTAP), E2E + accessibility (axe), Lighthouse CI and security checks run locally and in CI on every PR
  - each milestone's manual checklist is run on the deploy preview, on a real phone

### Milestones (MoSCoW; details in `docs/PLAN.md`)

**Must: the MVP launch**

- **M0 — Setup:** repository, Next.js + TypeScript + Tailwind, lint/format, test tooling, CI, local Supabase (Docker), first preview deployment, `CLAUDE.md`.
- **M1 — Data layer:** migrations per domain module, RLS, storage bucket, audit log, seed data (demo/draft), generated types, keep-alive.
- **M2 — Public site:** design system and all public pages reading from the database, with fallback states. Fully responsive.
- **M3 — Admin content management:** auth with mandatory 2FA, business info, opening hours and closures (incl. "Acil kapanış"), services and prices, images, FAQ, texts, revalidation, first draft of the owner's guide.
- **M4 — MVP launch readiness:** SEO, accessibility and performance pass, security review (incl. OWASP ZAP baseline), production project and deployment, encrypted backups, final README and owner's guide.

**Should: customer history (ADR-026)**

- **M5 — Customer history and return reminders:** customers, pets, visits and pet types with intervals; the reminder list with one-tap WhatsApp; consent and KVKK tools (export, delete, anonymisation); dashboard count.

**Later: online booking (postponed, §12)**

- **Booking engine and customer flow:** availability settings, slot engine with tests, booking wizard, spam protection, database-level double-booking prevention.
- **Appointment management and notifications:** admin appointment management (including manual entries and the closure-impact flow), WhatsApp/email notifications, CSV export, expiry and anonymisation.

---

## 18. OPEN QUESTIONS FOR THE OWNER (do not guess — use placeholders)

1. How do customers book today (phone, WhatsApp, Instagram DM, walk-in)? Should the website accept online requests at launch, or only after a trial period?
2. Phone number, WhatsApp number and email for notifications.
3. Opening hours and regular closed days.
4. Actual services offered, for cats and for dogs.
5. Duration and price (or starting price) per service and size tier; add-ons.
6. How many pets can be groomed at the same time?
7. Any restrictions (e.g. certain breeds, very large dogs, aggressive animals, vaccination requirements)?
8. Does coat length matter for cat pricing (e.g. short vs long hair)?
9. Cancellation and late-arrival policy.
10. Real photos of the shop or groomed pets that may be used (with permission from the pets' owners).
11. Domain name preference.
12. The business's legal name and contact details for the KVKK notice.


**Customer history and reminders (§12A):**
- Which pet types should exist, and what is the default interval for each (e.g. long-haired dog: every X weeks)?
- The WhatsApp reminder message text.
- Which employees need an account, and should they have fewer rights than the owner?
- After how many months without a visit should a customer's data be anonymised?
- Legal review: is a "would you like to come again?" reminder a commercial electronic message (law 6563), and what does that require (consent wording, İYS registration) before reminders, and especially automatic ones, are used?

**Instagram sync (ADR-029):**
- Can the shop's Instagram account be switched to a Professional account, and will the owner authorise the app once?
- Are all photos in the shop's posts real photos of their customers' pets that the website may show?
---

## 19. OUT OF SCOPE FOR V1

- Online booking (postponed, §12)
- Online payments and deposits
- Automatic reminders via SMS, WhatsApp Business API or email (designed for, §12A)
- Customer accounts and self-service cancellation
- Languages other than Turkish
- Staff-level scheduling beyond a parallel-capacity number
- Customer reviews
