-- business: contact facts from SPEC §5. Phone, WhatsApp, email and opening hours
-- start empty until the owner provides them (SPEC §18, issue "Owner questions").
-- The coordinates are the pin of the owner's own Google Maps listing (maps_url),
-- read from its redirect; the owner confirms them in the needs-owner issue.
-- Note: the CLI runs each seed file once per project and does not re-run it when it changes;
-- data for projects that already exist needs a migration (see *_business_location_backfill.sql).
-- Idempotent: safe to re-run. On an existing row only missing coordinates are filled,
-- so values the owner has edited are never overwritten.
insert into public.business_profile (business_name, slogan, address, maps_url, instagram_url, latitude, longitude)
values (
  'Sniff Pet Kuaför',
  'Kedi ve Köpek Bakımında Profesyonel Dokunuş',
  'Gaziosmanpaşa Mahallesi, Şehit Ali Gaffar Okkan Caddesi, Baran Apartmanı, 43/B, Gölbaşı, Ankara, Türkiye',
  'https://maps.app.goo.gl/ipSQ9QxkoMe3rBi49',
  'https://www.instagram.com/sniffpetkuafor/',
  39.797668,
  32.802474
)
on conflict (id) do update
  set latitude  = excluded.latitude,
      longitude = excluded.longitude
  where public.business_profile.latitude is null;
