-- media: bucket limits, no listing for visitors, published-only rows.
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

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

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select array_agg(alt_text) from public.media), array['Taranmış bir kedi'], 'anon sees only published media');
select is((select count(*)::int from storage.objects where bucket_id = 'media'), 0, 'anon cannot list files in the bucket');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('media', 'gallery/x/480.webp') $$,
  '42501', null, 'anon cannot upload');
reset role;

-- Admin without 2FA: same as a visitor for files.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is((select count(*)::int from storage.objects where bucket_id = 'media'), 0, 'admin without 2FA cannot list files');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('media', 'gallery/x/480.webp') $$,
  '42501', null, 'admin without 2FA cannot upload');
reset role;

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
select is((select count(*)::int from storage.objects where bucket_id = 'media'), 1, 'admin with 2FA sees files');
select is((select count(*)::int from public.media), 2, 'admin with 2FA sees unpublished media too');
reset role;

select * from finish();
rollback;
