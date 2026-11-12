-- business module: fill the map position on projects that already had the profile row.
-- The Supabase CLI runs a seed file only once per project; when 01_business.sql changed,
-- `db push --include-seed` just updated its hash ("Updating seed hash"), so the cloud dev
-- database got the latitude/longitude columns but no values (and the site showed no map).
-- Values: the pin of the owner's own Google Maps listing (see the seed; owner confirms in #54).
-- Idempotent and safe on fresh databases: it only fills a row that has no position yet
-- (on `db reset` the row doesn't exist yet when migrations run; the seed inserts it).
update public.business_profile
set latitude = 39.797668,
    longitude = 32.802474
where latitude is null
  and longitude is null;
