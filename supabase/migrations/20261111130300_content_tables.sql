-- content module: homepage and About texts, FAQ (PLAN §2).

-- ---------------------------------------------------------------------------
-- site_texts: exactly one row, edited in "Metinler".
-- about_markdown is rendered as Markdown without HTML (CLAUDE.md).
-- ---------------------------------------------------------------------------
create table public.site_texts (
  id             boolean     primary key default true check (id),
  hero_title     text        not null check (length(trim(hero_title)) between 1 and 120),
  hero_subtitle  text        not null check (length(hero_subtitle) <= 160),
  hero_text      text        not null check (length(hero_text) <= 400),
  welcome_text   text        not null check (length(welcome_text) <= 1500),
  about_markdown text        not null check (length(about_markdown) <= 10000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid        references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- faq_items
-- ---------------------------------------------------------------------------
create table public.faq_items (
  id           uuid        primary key default gen_random_uuid(),
  question     text        not null check (length(trim(question)) between 1 and 200),
  answer       text        not null check (length(trim(answer)) between 1 and 2000),
  sort_order   integer     not null default 0,
  is_published boolean     not null default false,
  is_demo      boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid        references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create trigger set_updated_meta before insert or update on public.site_texts
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.site_texts
  for each row execute function private.write_audit();

create trigger set_updated_meta before insert or update on public.faq_items
  for each row execute function private.set_updated_meta();
create trigger clear_demo_on_publish before insert or update on public.faq_items
  for each row execute function private.clear_demo_on_publish();
create trigger write_audit after insert or update or delete on public.faq_items
  for each row execute function private.write_audit();

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
alter table public.site_texts enable row level security;
alter table public.faq_items enable row level security;

create policy public_read on public.site_texts for select to anon using (true);
create policy admin_all on public.site_texts for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_read on public.faq_items for select to anon using (is_published);
create policy admin_all on public.faq_items for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.site_texts to anon;
grant select, update on public.site_texts to authenticated;

grant select on public.faq_items to anon;
grant select, insert, update, delete on public.faq_items to authenticated;
