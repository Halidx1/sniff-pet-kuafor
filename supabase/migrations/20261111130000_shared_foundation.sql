-- Shared foundation every module builds on (PLAN §2, ADR-010).
-- Convention for all later migrations:
--   * every table gets RLS and explicit grants; nothing is reachable by default
--   * every new function: `revoke all ... from public`, then grant explicitly
--   * SECURITY DEFINER functions set `search_path = ''`

-- ---------------------------------------------------------------------------
-- Private schema: never exposed through the Data API (only `public` is).
-- `authenticated` needs USAGE only to call private.is_admin() inside policies;
-- it gets no privileges on any table here.
-- ---------------------------------------------------------------------------
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Locked-down defaults: Supabase grants API roles full access to new objects
-- in `public` by default. Turn that off; each migration grants what it needs.
-- (service_role keeps its defaults: it is used only by server-side scripts.)
-- ---------------------------------------------------------------------------
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists btree_gist with schema extensions; -- equality inside exclusion constraints
create extension if not exists pg_cron with schema pg_catalog;    -- housekeeping jobs (ADR-010)
drop extension if exists pg_graphql;                              -- unused API surface (threat T4)

-- ---------------------------------------------------------------------------
-- Shared types
-- ---------------------------------------------------------------------------
create type public.pet_type as enum ('cat', 'dog');

-- ---------------------------------------------------------------------------
-- Health check: one tiny query for /api/health, touching no domain table.
-- ---------------------------------------------------------------------------
create function public.health_check()
returns boolean
language sql
stable
set search_path = ''
as $$ select true $$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon;

-- ---------------------------------------------------------------------------
-- Common trigger functions
-- ---------------------------------------------------------------------------

-- BEFORE INSERT OR UPDATE: who changed the row and when.
create function private.set_updated_meta()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- BEFORE INSERT OR UPDATE on content tables: a published row is never demo
-- content (SPEC §15: publishing a demo item makes it real).
create function private.clear_demo_on_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_published then
    new.is_demo := false;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Audit log: who changed what, with old and new values, so a mistaken edit or
-- deletion can be seen and restored (threat T15). Purged after 180 days.
-- ---------------------------------------------------------------------------
create table private.audit_log (
  id         bigint generated always as identity primary key,
  table_name text        not null,
  row_id     text,
  action     text        not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor      uuid,
  at         timestamptz not null default now(),
  old        jsonb,
  new        jsonb
);

create index audit_log_lookup on private.audit_log (table_name, row_id, at);

-- AFTER INSERT OR UPDATE OR DELETE. SECURITY DEFINER because API roles have no
-- privileges on private.audit_log.
create function private.write_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.audit_log (table_name, row_id, action, actor, old, new)
  values (
    tg_table_name,
    coalesce(to_jsonb(new), to_jsonb(old)) ->> 'id',
    tg_op,
    auth.uid(),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return null;
end;
$$;

create function private.purge_audit_log()
returns void
language sql
set search_path = ''
as $$
  delete from private.audit_log where at < now() - interval '180 days';
$$;

revoke all on function private.set_updated_meta() from public;
revoke all on function private.clear_demo_on_publish() from public;
revoke all on function private.write_audit() from public;
revoke all on function private.purge_audit_log() from public;

-- Sundays 03:00 UTC.
select cron.schedule('purge-audit-log', '0 3 * * 0', 'select private.purge_audit_log()');
