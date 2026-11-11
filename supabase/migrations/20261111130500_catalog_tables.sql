-- catalog module: services, per-tier prices and durations, add-ons (PLAN §2).

create type public.pet_scope as enum ('cat', 'dog', 'both');
create type public.service_category as enum ('cat_care', 'dog_care', 'general');
create type public.price_tier as enum ('cat', 'dog_small', 'dog_medium', 'dog_large');
create type public.price_type as enum ('fixed', 'starting_from', 'contact');

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table public.services (
  id           uuid                    primary key default gen_random_uuid(),
  name         text                    not null check (length(trim(name)) between 1 and 100),
  description  text                    not null default '' check (length(description) <= 1000),
  category     public.service_category not null,
  pet_scope    public.pet_scope        not null,
  image_id     uuid                    references public.media (id) on delete set null,
  sort_order   integer                 not null default 0,
  is_published boolean                 not null default false,
  is_demo      boolean                 not null default false,
  created_at   timestamptz             not null default now(),
  updated_at   timestamptz             not null default now(),
  updated_by   uuid                    references auth.users (id) on delete set null
);

create index services_image_id on public.services (image_id);

-- ---------------------------------------------------------------------------
-- service_prices: one row per (service, tier); no row = tier not offered.
-- is_demo is cleared when the owner confirms the prices ("Fiyat ve süreleri
-- onaylıyorum"), not by publishing the service.
-- ---------------------------------------------------------------------------
create table public.service_prices (
  id           uuid              primary key default gen_random_uuid(),
  service_id   uuid              not null references public.services (id) on delete cascade,
  tier         public.price_tier not null,
  price_type   public.price_type not null,
  amount       numeric(10, 2)    check (amount >= 0),
  duration_min integer           check (duration_min between 1 and 600),
  is_demo      boolean           not null default false,
  created_at   timestamptz       not null default now(),
  updated_at   timestamptz       not null default now(),
  updated_by   uuid              references auth.users (id) on delete set null,
  constraint service_prices_one_per_tier unique (service_id, tier),
  -- "Fiyat için iletişime geçin" has no amount; every other type needs one.
  constraint service_prices_amount check ((price_type = 'contact') = (amount is null))
);

-- ---------------------------------------------------------------------------
-- addons: one price for every size (PLAN A6); may add minutes.
-- ---------------------------------------------------------------------------
create table public.addons (
  id           uuid              primary key default gen_random_uuid(),
  name         text              not null check (length(trim(name)) between 1 and 100),
  description  text              not null default '' check (length(description) <= 500),
  pet_scope    public.pet_scope  not null,
  price_type   public.price_type not null,
  amount       numeric(10, 2)    check (amount >= 0),
  duration_min integer           not null default 0 check (duration_min between 0 and 240),
  sort_order   integer           not null default 0,
  is_published boolean           not null default false,
  is_demo      boolean           not null default false,
  created_at   timestamptz       not null default now(),
  updated_at   timestamptz       not null default now(),
  updated_by   uuid              references auth.users (id) on delete set null,
  constraint addons_amount check ((price_type = 'contact') = (amount is null))
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create trigger set_updated_meta before insert or update on public.services
  for each row execute function private.set_updated_meta();
create trigger clear_demo_on_publish before insert or update on public.services
  for each row execute function private.clear_demo_on_publish();
create trigger write_audit after insert or update or delete on public.services
  for each row execute function private.write_audit();

create trigger set_updated_meta before insert or update on public.service_prices
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.service_prices
  for each row execute function private.write_audit();

create trigger set_updated_meta before insert or update on public.addons
  for each row execute function private.set_updated_meta();
create trigger clear_demo_on_publish before insert or update on public.addons
  for each row execute function private.clear_demo_on_publish();
create trigger write_audit after insert or update or delete on public.addons
  for each row execute function private.write_audit();

-- ---------------------------------------------------------------------------
-- RLS and grants. Visitors never see unpublished services or demo prices.
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;
alter table public.service_prices enable row level security;
alter table public.addons enable row level security;

create policy public_read on public.services for select to anon using (is_published);
create policy admin_all on public.services for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_read on public.service_prices for select to anon
  using (not is_demo and exists (select 1 from public.services s where s.id = service_id and s.is_published));
create policy admin_all on public.service_prices for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_read on public.addons for select to anon using (is_published);
create policy admin_all on public.addons for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.services, public.service_prices, public.addons to anon;
grant select, insert, update, delete on public.services, public.service_prices, public.addons to authenticated;
