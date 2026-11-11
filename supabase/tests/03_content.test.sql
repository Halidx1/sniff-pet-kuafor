-- content: texts are public; FAQ drafts stay hidden until published.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email) values ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');

select is((select count(*)::int from public.faq_items where is_demo and not is_published), 5, 'seed: 5 unpublished demo FAQ drafts');

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select hero_title from public.site_texts), 'Küçük Dostlarınız, Büyük Bir Özeni Hak Ediyor!', 'anon reads the hero title');
select is((select count(*)::int from public.faq_items), 0, 'anon sees no FAQ drafts');
reset role;

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
update public.faq_items set answer = 'Telefonla randevu alabilirsiniz.', is_published = true
 where id = '5f0e6a1c-0001-4000-8000-000000000001';
reset role;

select is((select is_demo from public.faq_items where id = '5f0e6a1c-0001-4000-8000-000000000001'), false,
  'publishing a demo item makes it real (is_demo cleared)');

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*)::int from public.faq_items), 1, 'anon sees the published item');
select throws_ok($$ update public.site_texts set hero_title = 'x' $$, '42501', null, 'anon cannot edit texts');
reset role;

select * from finish();
rollback;
