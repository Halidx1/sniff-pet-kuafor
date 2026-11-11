-- business: public reads, admin-only writes, data rules.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, email) values ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');
insert into public.closures (id, starts_at, ends_at, public_note, internal_note) values
  ('c0000000-0000-4000-8000-000000000001', '2026-12-01 00:00+03', '2026-12-02 00:00+03', 'Bugün kapalıyız.', 'Usta hasta');

-- Visitors
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select business_name from public.business_profile), 'Sniff Pet Kuaför', 'anon reads the business profile');
select is((select public_note from public.closures), 'Bugün kapalıyız.', 'anon reads a closure''s public note');
select throws_ok('select internal_note from public.closures', '42501', null, 'anon cannot read a closure''s internal note');
select throws_ok($$ update public.business_profile set slogan = 'x' $$, '42501', null, 'anon cannot edit the profile');
select throws_ok($$ insert into public.opening_hours (weekday, opens_at, closes_at) values (1, '09:00', '18:00') $$,
  '42501', null, 'anon cannot add opening hours');
reset role;

-- Admin with password only (aal1): RLS hides every row, so nothing changes.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
update public.business_profile set slogan = 'aal1 edit';
select is((select count(*)::int from public.closures), 0, 'admin without 2FA sees no closures');
select throws_ok($$ insert into public.closures (starts_at, ends_at) values (now(), now() + interval '1 hour') $$,
  '42501', null, 'admin without 2FA cannot add a closure');
reset role;
select isnt((select slogan from public.business_profile), 'aal1 edit', 'admin without 2FA cannot edit the profile');

-- Admin with 2FA (aal2)
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
select lives_ok($$ insert into public.opening_hours (weekday, opens_at, closes_at) values (1, '09:00', '12:30'), (1, '13:30', '19:00') $$,
  'admin adds two intervals on Monday (lunch break)');
select throws_ok($$ insert into public.opening_hours (weekday, opens_at, closes_at) values (1, '12:00', '14:00') $$,
  '23P01', null, 'overlapping intervals on the same day are refused');
select throws_ok($$ insert into public.opening_hours (weekday, opens_at, closes_at) values (2, '18:00', '09:00') $$,
  '23514', null, 'closing before opening is refused');
select throws_ok($$ insert into public.closures (starts_at, ends_at) values ('2026-12-02', '2026-12-01') $$,
  '23514', null, 'a closure that ends before it starts is refused');
select throws_ok($$ update public.business_profile set phone_e164 = '0532 123 45 67' $$,
  '23514', null, 'phone numbers must be stored as +90XXXXXXXXXX');
select throws_ok($$ update public.business_profile set map_embed_url = 'https://evil.example/embed' $$,
  '23514', null, 'only Google Maps embed URLs are accepted for the map iframe');
reset role;

select * from finish();
rollback;
