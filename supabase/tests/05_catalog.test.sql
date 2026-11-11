-- catalog: demo services and prices never leak; price rules hold.
begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, email) values ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');

select is((select count(*)::int from public.services where is_demo and not is_published), 6, 'seed: 6 unpublished demo services');
select is((select count(*)::int from public.service_prices where not is_demo), 0, 'seed: every price is demo');

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*)::int from public.services), 0, 'anon sees no demo services');
select is((select count(*)::int from public.service_prices), 0, 'anon sees no demo prices');
select is((select count(*)::int from public.addons), 0, 'anon sees no demo add-ons');
reset role;

-- The owner publishes "Tırnak Bakımı" but hasn't confirmed its prices yet.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
update public.services set is_published = true where id = '5e7c0000-0001-4000-8000-000000000004';
reset role;

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select name from public.services), 'Tırnak Bakımı', 'anon sees the published service');
select is((select count(*)::int from public.service_prices), 0, 'its demo prices stay hidden until confirmed');
reset role;

-- The owner confirms the prices.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
update public.service_prices set is_demo = false where service_id = '5e7c0000-0001-4000-8000-000000000004';
update public.service_prices set is_demo = false where service_id = '5e7c0000-0001-4000-8000-000000000001'; -- still unpublished
select throws_ok(
  $$ insert into public.service_prices (service_id, tier, price_type, amount)
     values ('5e7c0000-0001-4000-8000-000000000003', 'dog_small', 'fixed', null) $$,
  '23514', null, 'a fixed price needs an amount'
);
select throws_ok(
  $$ insert into public.service_prices (service_id, tier, price_type)
     values ('5e7c0000-0001-4000-8000-000000000004', 'cat', 'contact') $$,
  '23505', null, 'one price per service and tier'
);
reset role;

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*)::int from public.service_prices), 4, 'confirmed prices of the published service are visible');
select is(
  (select count(*)::int from public.service_prices where service_id = '5e7c0000-0001-4000-8000-000000000001'),
  0,
  'confirmed prices of an unpublished service stay hidden'
);
reset role;

select * from finish();
rollback;
