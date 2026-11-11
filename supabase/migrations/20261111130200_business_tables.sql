-- business module: contact facts, opening hours, closures (PLAN §2).
-- Policy pattern used by every module:
--   anon          → read what the public site may show
--   authenticated → everything, but only when private.is_admin() (2FA done)

-- ---------------------------------------------------------------------------
-- business_profile: exactly one row, edited in "İşletme Bilgileri".
-- ---------------------------------------------------------------------------
create table public.business_profile (
  id             boolean     primary key default true check (id),
  business_name  text        not null check (length(trim(business_name)) between 1 and 100),
  slogan         text        check (length(slogan) <= 200),
  address        text        not null check (length(trim(address)) between 1 and 300),
  maps_url       text        check (maps_url ~ '^https://'),
  -- Rendered as an iframe, so only Google Maps embed URLs are accepted.
  map_embed_url  text        check (map_embed_url ~ '^https://www\.google\.com/maps/embed\?'),
  instagram_url  text        check (instagram_url ~ '^https://(www\.)?instagram\.com/'),
  phone_e164     text        check (phone_e164 ~ '^\+90\d{10}$'),
  whatsapp_e164  text        check (whatsapp_e164 ~ '^\+90\d{10}$'),
  email          text        check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid        references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- opening_hours: several rows per weekday = breaks between them.
-- Starts empty; shown publicly only once the owner enters it.
-- ---------------------------------------------------------------------------
create table public.opening_hours (
  id         uuid        primary key default gen_random_uuid(),
  weekday    smallint    not null check (weekday between 1 and 7), -- ISO: 1 = Pazartesi … 7 = Pazar
  opens_at   time        not null,
  closes_at  time        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid        references auth.users (id) on delete set null,
  constraint opening_hours_valid check (closes_at > opens_at),
  -- Times are placed on a fixed dummy date so the built-in tsrange can compare
  -- them (a custom time range type would add functions we can't lock down).
  constraint opening_hours_no_overlap exclude using gist (
    weekday with =,
    tsrange(date '2000-01-03' + opens_at, date '2000-01-03' + closes_at) with &&
  )
);

-- ---------------------------------------------------------------------------
-- closures: whole days, date ranges or part of a day, incl. "Acil kapanış".
-- Half-open range [starts_at, ends_at). internal_note is hidden from anon by a
-- column-level grant below.
-- ---------------------------------------------------------------------------
create table public.closures (
  id            uuid        primary key default gen_random_uuid(),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  public_note   text        check (length(public_note) <= 300),
  internal_note text        check (length(internal_note) <= 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid        references auth.users (id) on delete set null,
  constraint closures_valid check (ends_at > starts_at)
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create trigger set_updated_meta before insert or update on public.business_profile
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.business_profile
  for each row execute function private.write_audit();

create trigger set_updated_meta before insert or update on public.opening_hours
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.opening_hours
  for each row execute function private.write_audit();

create trigger set_updated_meta before insert or update on public.closures
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.closures
  for each row execute function private.write_audit();

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
alter table public.business_profile enable row level security;
alter table public.opening_hours enable row level security;
alter table public.closures enable row level security;

create policy public_read on public.business_profile for select to anon using (true);
create policy admin_all on public.business_profile for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_read on public.opening_hours for select to anon using (true);
create policy admin_all on public.opening_hours for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_read on public.closures for select to anon using (true);
create policy admin_all on public.closures for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- The single profile row is edited, never inserted or deleted through the API.
grant select on public.business_profile to anon;
grant select, update on public.business_profile to authenticated;

grant select on public.opening_hours to anon;
grant select, insert, update, delete on public.opening_hours to authenticated;

grant select (id, starts_at, ends_at, public_note) on public.closures to anon;
grant select, insert, update, delete on public.closures to authenticated;
