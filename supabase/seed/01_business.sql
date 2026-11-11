-- business: contact facts from SPEC §5. Phone, WhatsApp, email and opening hours
-- start empty until the owner provides them (SPEC §18, issue "Owner questions").
-- Idempotent: safe to re-run against a project that already has the row.
insert into public.business_profile (business_name, slogan, address, maps_url, instagram_url)
values (
  'Sniff Pet Kuaför',
  'Kedi ve Köpek Bakımında Profesyonel Dokunuş',
  'Gaziosmanpaşa Mahallesi, Şehit Ali Gaffar Okkan Caddesi, Baran Apartmanı, 43/B, Gölbaşı, Ankara, Türkiye',
  'https://maps.app.goo.gl/ipSQ9QxkoMe3rBi49',
  'https://www.instagram.com/sniffpetkuafor/'
)
on conflict (id) do nothing;
