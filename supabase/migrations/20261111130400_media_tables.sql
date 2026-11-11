-- media module: image records and the storage bucket (PLAN §2, ADR-008, ADR-009).

create type public.media_kind as enum ('hero', 'gallery', 'instagram', 'about', 'service');

-- One row per image. Files live in the `media` bucket at
-- <storage_prefix>/<width>.<file_ext>, one file per entry in `widths`.
-- No clear_demo_on_publish trigger here: stock photos may be shown as
-- decoration while staying flagged as demo (SPEC §15).
create table public.media (
  id             uuid              primary key default gen_random_uuid(),
  kind           public.media_kind not null,
  storage_prefix text              not null unique
                 check (storage_prefix ~ '^(hero|gallery|instagram|about|service)/[0-9a-f-]{36}$'),
  file_ext       text              not null check (file_ext in ('webp', 'jpg')),
  widths         smallint[]        not null check (cardinality(widths) between 1 and 5),
  width          integer           not null check (width > 0),  -- largest stored variant
  height         integer           not null check (height > 0),
  alt_text       text              not null check (length(trim(alt_text)) between 1 and 200),
  caption        text              check (length(caption) <= 300),
  category       public.pet_type,
  credit         text              check (length(credit) <= 300),
  sort_order     integer           not null default 0,
  is_published   boolean           not null default false,
  is_demo        boolean           not null default false,
  created_at     timestamptz       not null default now(),
  updated_at     timestamptz       not null default now(),
  updated_by     uuid              references auth.users (id) on delete set null
);

create trigger set_updated_meta before insert or update on public.media
  for each row execute function private.set_updated_meta();
create trigger write_audit after insert or update or delete on public.media
  for each row execute function private.write_audit();

alter table public.media enable row level security;

create policy public_read on public.media for select to anon using (is_published);
create policy admin_all on public.media for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket. Public by exact URL so the CDN can cache images for a year;
-- paths contain a random UUID and anon has no SELECT policy, so files can't be
-- listed or guessed (ADR-009). The bucket itself rejects anything that isn't
-- WebP/JPEG or is over 2 MB, whoever uploads it (threat T7).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152, array['image/webp', 'image/jpeg']);

-- INSERT is what lets an admin create signed upload URLs; SELECT lets the app
-- check an upload landed; DELETE removes files with their media row.
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.is_admin()));
create policy media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));
