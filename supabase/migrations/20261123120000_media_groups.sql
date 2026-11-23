-- media module: group images into one gallery card (ADR-031). Additive only.
--
-- A group is one post: a before/after pair (optionally with a cover collage) or a
-- carousel of slides. Images without a group stay single tiles, as before.

create type public.media_group_role as enum ('cover', 'before', 'after', 'slide');

alter table public.media
  add column group_id   uuid,
  add column group_role public.media_group_role,
  add constraint media_group_both_or_neither
    check ((group_id is null) = (group_role is null));

create index media_group_id_idx on public.media (group_id) where group_id is not null;

-- At most one cover, one before and one after per group (slides are unlimited).
create unique index media_group_role_once_idx on public.media (group_id, group_role)
  where group_role in ('cover', 'before', 'after');
