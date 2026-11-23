-- identity module: let the signed-in admin read their own display name (M3).
-- private.admins stays unreachable through the API; this function answers only
-- for the caller, and only with 2FA done (same rule as private.is_admin()).

create function public.current_admin_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select a.display_name
  from private.admins a
  where a.user_id = auth.uid()
    and (select private.is_admin());
$$;

revoke all on function public.current_admin_name() from public, anon;
grant execute on function public.current_admin_name() to authenticated;
