-- identity: is_admin() requires being listed AND a 2FA (aal2) session.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'someone@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');

-- Admin with password only (aal1): not an admin yet.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select is(private.is_admin(), false, 'admin without 2FA (aal1) is not admin');
reset role;

-- Admin with 2FA (aal2).
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
select is(private.is_admin(), true, 'admin with 2FA (aal2) is admin');
select throws_ok('select * from private.admins', '42501', null, 'even an admin cannot read private.admins through the API');
reset role;

-- Someone else with 2FA, not listed.
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
select is(private.is_admin(), false, 'a signed-in user who is not listed is not admin');
reset role;

-- Visitors.
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select throws_ok('select private.is_admin()', '42501', null, 'anon cannot call is_admin()');
select throws_ok('select * from private.admins', '42501', null, 'anon cannot read private.admins');
reset role;

select * from finish();
rollback;
