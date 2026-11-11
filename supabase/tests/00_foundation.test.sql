-- Foundation: RLS everywhere, locked-down grants, audit trail, housekeeping job.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

-- RLS is on for every table the API can see (a new table without it fails CI).
select is(
  (select array_agg(tablename::text order by tablename) from pg_tables where schemaname = 'public' and not rowsecurity),
  null,
  'RLS is enabled on every table in public'
);

-- Visitors can never write anything directly.
select is(
  (select array_agg(distinct table_name::text order by table_name::text)
     from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon' and privilege_type <> 'SELECT'),
  null,
  'anon has no INSERT/UPDATE/DELETE/TRUNCATE grant on any public table'
);

-- Only these functions are callable through the API, by these roles.
select results_eq(
  $$ select p.oid::regprocedure::text, r.rolname::text
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       cross join (values ('anon'), ('authenticated')) as r (rolname)
      where n.nspname in ('public', 'private')
        and has_function_privilege(r.rolname, p.oid, 'execute')
        and has_schema_privilege(r.rolname, n.nspname, 'usage')
      order by 1, 2 $$,
  $$ values ('health_check()', 'anon'), ('private.is_admin()', 'authenticated') $$,
  'only health_check() (anon) and private.is_admin() (authenticated) are executable'
);

select ok(not has_schema_privilege('anon', 'private', 'usage'), 'anon cannot use the private schema');
select ok(not has_table_privilege('authenticated', 'private.audit_log', 'select'), 'authenticated cannot read the audit log');
select hasnt_extension('pg_graphql', 'GraphQL endpoint is disabled');
select is((select count(*)::int from cron.job where jobname = 'purge-audit-log'), 1, 'weekly audit purge is scheduled');

-- Audit trail and updated_by, as an admin with 2FA.
insert into auth.users (id, email) values ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@example.test');
insert into private.admins (user_id, display_name) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Test Admin');

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
set local role authenticated;
update public.business_profile set slogan = 'Yeni slogan';
reset role;

select is(
  (select updated_by from public.business_profile),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid,
  'updated_by records the admin'
);
select is(
  (select count(*)::int from private.audit_log
    where table_name = 'business_profile' and action = 'UPDATE'
      and actor = 'aaaaaaaa-0000-4000-8000-000000000001'
      and new ->> 'slogan' = 'Yeni slogan'
      and old ->> 'slogan' = 'Kedi ve Köpek Bakımında Profesyonel Dokunuş'),
  1,
  'the update is in the audit log with old and new values'
);

delete from public.faq_items where id = '5f0e6a1c-0001-4000-8000-000000000001';
select is(
  (select old ->> 'question' from private.audit_log where table_name = 'faq_items' and action = 'DELETE'),
  'Randevu nasıl alabilirim?',
  'a deleted row can be restored from the audit log'
);

-- Purge keeps 180 days.
insert into private.audit_log (table_name, row_id, action, at) values
  ('test', 'old', 'UPDATE', now() - interval '181 days'),
  ('test', 'recent', 'UPDATE', now() - interval '179 days');
select private.purge_audit_log();
select is((select count(*)::int from private.audit_log where table_name = 'test' and row_id = 'old'), 0, 'rows older than 180 days are purged');
select is((select count(*)::int from private.audit_log where table_name = 'test' and row_id = 'recent'), 1, 'newer rows are kept');

select is(public.health_check(), true, 'health_check() answers');

select * from finish();
rollback;
