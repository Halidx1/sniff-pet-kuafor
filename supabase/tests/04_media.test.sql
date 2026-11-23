-- media: bucket limits, no listing for visitors, published-only rows.
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

insert into auth.users (id, email) values ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');

select results_eq(
  $$ select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media' $$,
  $$ values (true, 2097152::bigint, array['image/webp', 'image/jpeg']) $$,
  'bucket media: public URLs, 2 MB, WebP/JPEG only'
);

insert into public.media (id, kind, storage_prefix, file_ext, widths, width, height, alt_text, is_published) values
  ('d0000000-0000-4000-8000-000000000001', 'gallery', 'gallery/d0000000-0000-4000-8000-000000000001', 'webp', '{480,960}', 960, 640, 'Taranmış bir kedi', true),
  ('d0000000-0000-4000-8000-000000000002', 'gallery', 'gallery/d0000000-0000-4000-8000-000000000002', 'webp', '{480}', 480, 320, 'Yayında olmayan', false);
insert into storage.objects (bucket_id, name) values ('media', 'gallery/d0000000-0000-4000-8000-000000000001/480.webp');

select throws_ok(
  $$ insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text)
     values ('gallery', 'gallery/../../secrets', 'webp', '{480}', 480, 320, 'x') $$,
  '23514', null, 'storage paths must be <kind>/<uuid>'
);
select throws_ok(
  $$ insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text)
     values ('gallery', 'gallery/d0000000-0000-4000-8000-000000000003', 'webp', '{480}', 480, 320, '  ') $$,
  '23514', null, 'alt text is required'
);

-- Groups (ADR-031): a role needs a group and vice versa; one before per group.
select throws_ok(
  $$ insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text, group_role)
     values ('gallery', 'gallery/d0000000-0000-4000-8000-000000000004', 'webp', '{480}', 480, 320, 'x', 'before') $$,
  '23514', null, 'a group role needs a group id'
);
insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text, group_id, group_role)
  values ('gallery', 'gallery/d0000000-0000-4000-8000-000000000005', 'webp', '{480}', 480, 320, 'Önce', 'e0000000-0000-4000-8000-000000000001', 'before');
select throws_ok(
  $$ insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text, group_id, group_role)
     values ('gallery', 'gallery/d0000000-0000-4000-8000-000000000006', 'webp', '{480}', 480, 320, 'Önce 2', 'e0000000-0000-4000-8000-000000000001', 'before') $$,
  '23505', null, 'only one before photo per group'
);
select lives_ok(
  $$ insert into public.media (kind, storage_prefix, file_ext, widths, width, height, alt_text, group_id, group_role) values
     ('gallery', 'gallery/d0000000-0000-4000-8000-000000000007', 'webp', '{480}', 480, 320, 'Kare 1', 'e0000000-0000-4000-8000-000000000002', 'slide'),
     ('gallery', 'gallery/d0000000-0000-4000-8000-000000000008', 'webp', '{480}', 480, 320, 'Kare 2', 'e0000000-0000-4000-8000-000000000002', 'slide') $$,
  'a carousel may have many slides'
);

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
-- Assertions use this test's own rows, so they hold whether or not seed:media has run.
select is((select array_agg(alt_text) from public.media where id::text like 'd0000000-%'), array['Taranmış bir kedi'], 'anon sees only published media');
select is((select count(*)::int from storage.objects where bucket_id = 'media'), 0, 'anon cannot list files in the bucket');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('media', 'gallery/x/480.webp') $$,
  '42501', null, 'anon cannot upload');
reset role;

-- Admin without 2FA: same as a visitor for files.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is((select count(*)::int from storage.objects where bucket_id = 'media'), 0, 'admin without 2FA cannot list files');
select throws_ok(
  $$ select public.media_group(array['d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002']::uuid[], 'pair') $$,
  '22023', null, 'admin without 2FA cannot group photos'
);
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('media', 'gallery/x/480.webp') $$,
  '42501', null, 'admin without 2FA cannot upload');
reset role;

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
select is((select count(*)::int from storage.objects where bucket_id = 'media' and name like 'gallery/d0000000-%'), 1, 'admin with 2FA sees files');
select is((select count(*)::int from public.media where storage_prefix like 'gallery/d0000000-%'), 5, 'admin with 2FA sees unpublished media too');

-- Media manager helpers (issue #32).
select lives_ok(
  $$ select public.media_group(array['d0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001']::uuid[], 'pair') $$,
  'admin groups two photos as a before/after pair'
);
select results_eq(
  $$ select id::text, group_role::text from public.media
      where id in ('d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002') order by id $$,
  $$ values ('d0000000-0000-4000-8000-000000000001', 'after'), ('d0000000-0000-4000-8000-000000000002', 'before') $$,
  'the first photo is "before", the second "after"'
);
select throws_ok(
  $$ select public.media_group(array['d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000007']::uuid[], 'carousel') $$,
  '22023', null, 'photos already in a group cannot be grouped again'
);
select throws_ok(
  $$ select public.media_group(array['d0000000-0000-4000-8000-000000000001']::uuid[], 'pair') $$,
  '22023', null, 'a pair needs exactly two photos'
);
select throws_ok(
  $$ select public.media_group(array['d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002']::uuid[], 'collage') $$,
  '22023', null, 'unknown layouts are rejected'
);
select lives_ok(
  $$ select public.media_reorder(array['d0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001']::uuid[]) $$,
  'admin reorders photos'
);
select results_eq(
  $$ select sort_order from public.media
      where id in ('d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002') order by id $$,
  $$ values (2), (1) $$,
  'sort order follows the list'
);
reset role;

select * from finish();
rollback;
