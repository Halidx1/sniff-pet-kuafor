-- media module: helpers for the admin media manager (issue #32). Additive only.
--
-- Reordering a list and grouping photos into one gallery card change several rows;
-- as functions each is one transaction, so a failure never leaves half a change.
-- SECURITY INVOKER: they run as the caller, so RLS (admin_all → private.is_admin(),
-- 2FA included) still decides who may write. Anyone else changes zero rows.

/** Sets sort_order to each id's position in p_ids (1, 2, 3 …). */
create function public.media_reorder(p_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.media m
     set sort_order = o.pos
    from unnest(p_ids) with ordinality as o (id, pos)
   where m.id = o.id
     and m.sort_order is distinct from o.pos::integer;
$$;

/**
 * Groups ungrouped gallery photos into one card (ADR-031) and returns the group id.
 * 'pair': exactly two photos, the first is "Önce" (before), the second "Sonra" (after).
 * 'carousel': 2–20 photos, all slides.
 */
create function public.media_group(p_ids uuid[], p_layout text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_group uuid := gen_random_uuid();
  v_count integer := coalesce(cardinality(p_ids), 0);
  v_changed integer;
begin
  if p_layout not in ('pair', 'carousel') then
    raise exception 'unknown layout: %', p_layout using errcode = '22023';
  end if;
  if (p_layout = 'pair' and v_count <> 2) or (p_layout = 'carousel' and v_count not between 2 and 20) then
    raise exception 'wrong number of photos for %: %', p_layout, v_count using errcode = '22023';
  end if;
  if (select count(distinct x) from unnest(p_ids) as x) <> v_count then
    raise exception 'duplicate photos' using errcode = '22023';
  end if;

  update public.media m
     set group_id = v_group,
         group_role = (case
           when p_layout = 'carousel' then 'slide'
           when o.pos = 1 then 'before'
           else 'after'
         end)::public.media_group_role
    from unnest(p_ids) with ordinality as o (id, pos)
   where m.id = o.id
     and m.kind = 'gallery'
     and m.group_id is null;

  get diagnostics v_changed = row_count;
  if v_changed <> v_count then
    -- Not visible (not an admin), not a gallery photo, or already in a group.
    raise exception 'only ungrouped gallery photos can be grouped' using errcode = '22023';
  end if;
  return v_group;
end;
$$;

revoke all on function public.media_reorder(uuid[]) from public, anon;
revoke all on function public.media_group(uuid[], text) from public, anon;
grant execute on function public.media_reorder(uuid[]) to authenticated;
grant execute on function public.media_group(uuid[], text) to authenticated;
