-- business module: the shop's map position (ADR-020).
-- The public map draws one pin at these coordinates; without them no map is shown.
-- Additive (expand) change: map_embed_url stays until a later contract migration drops it.
alter table public.business_profile
  add column latitude  numeric(9, 6) check (latitude between -90 and 90),
  add column longitude numeric(9, 6) check (longitude between -180 and 180),
  add constraint business_profile_location_pair
    check ((latitude is null) = (longitude is null));

comment on column public.business_profile.latitude is
  'Map pin latitude (WGS 84). Set together with longitude, or neither.';
comment on column public.business_profile.longitude is
  'Map pin longitude (WGS 84). Set together with latitude, or neither.';
