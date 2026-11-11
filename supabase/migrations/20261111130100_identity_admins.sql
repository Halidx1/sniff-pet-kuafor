-- identity module: who is an admin (ADR-006).

-- Rows are added by SQL in the Supabase dashboard only (owner + developer).
-- No API role has any privilege on this table.
create table private.admins (
  user_id      uuid        primary key references auth.users (id) on delete cascade,
  display_name text        not null check (length(trim(display_name)) between 1 and 100),
  created_at   timestamptz not null default now()
);

-- True only for a listed admin who has completed 2FA in this session.
-- A stolen password alone (aal1) never passes, so the database itself refuses
-- admin reads and writes without the second factor (threat T1).
-- Policies call it as `(select private.is_admin())` so it runs once per query.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from private.admins where user_id = auth.uid());
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;
