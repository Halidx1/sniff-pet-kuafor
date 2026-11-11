-- catalog: the 6 proposed services from SPEC §9, all unpublished demo drafts.
-- Prices and durations are provisional examples: DEMO / OWNER APPROVAL REQUIRED.
-- They are never visible publicly (RLS) until the owner confirms and publishes.
insert into public.services (id, name, description, category, pet_scope, sort_order, is_demo) values
  ('5e7c0000-0001-4000-8000-000000000001', 'Banyo ve Kurulama',
   'Dostunuzun tüy yapısına uygun ürünlerle yıkama, ardından nazik bir kurulama ve tarama.', 'general', 'both', 1, true),
  ('5e7c0000-0001-4000-8000-000000000002', 'Tıraş ve Tüy Bakımı',
   'Köpeğinizin ırkına ve isteğinize göre makine veya makasla tüy kesimi ve şekillendirme.', 'dog_care', 'dog', 2, true),
  ('5e7c0000-0001-4000-8000-000000000003', 'Tarama ve Düğüm Açma',
   'Uzun tüylü kediler için tarama, düğüm açma ve dökülen tüylerin alınması.', 'cat_care', 'cat', 3, true),
  ('5e7c0000-0001-4000-8000-000000000004', 'Tırnak Bakımı',
   'Tırnakların güvenli bir uzunlukta kesilmesi ve törpülenmesi.', 'general', 'both', 4, true),
  ('5e7c0000-0001-4000-8000-000000000005', 'Kulak ve Göz Çevresi Temizliği',
   'Kulak içi ve göz çevresinin nazikçe temizlenmesi.', 'general', 'both', 5, true),
  ('5e7c0000-0001-4000-8000-000000000006', 'Komple Bakım',
   'Banyo, kurulama, tüy bakımı, tırnak kesimi ile kulak ve göz çevresi temizliğini bir arada içeren bakım.', 'general', 'both', 6, true)
on conflict (id) do nothing;

-- (service, tier, price_type, amount ₺, duration minutes)
insert into public.service_prices (service_id, tier, price_type, amount, duration_min, is_demo)
select s.id, p.tier::public.price_tier, p.price_type::public.price_type, p.amount, p.duration_min, true
from (values
  ('5e7c0000-0001-4000-8000-000000000001', 'cat',        'starting_from',  750,  60),
  ('5e7c0000-0001-4000-8000-000000000001', 'dog_small',  'starting_from',  750,  60),
  ('5e7c0000-0001-4000-8000-000000000001', 'dog_medium', 'starting_from', 1000,  90),
  ('5e7c0000-0001-4000-8000-000000000001', 'dog_large',  'starting_from', 1300, 120),
  ('5e7c0000-0001-4000-8000-000000000002', 'dog_small',  'starting_from', 1000,  90),
  ('5e7c0000-0001-4000-8000-000000000002', 'dog_medium', 'starting_from', 1300, 120),
  ('5e7c0000-0001-4000-8000-000000000002', 'dog_large',  'starting_from', 1700, 150),
  ('5e7c0000-0001-4000-8000-000000000003', 'cat',        'starting_from',  600,  60),
  ('5e7c0000-0001-4000-8000-000000000004', 'cat',        'fixed',          250,  15),
  ('5e7c0000-0001-4000-8000-000000000004', 'dog_small',  'fixed',          250,  15),
  ('5e7c0000-0001-4000-8000-000000000004', 'dog_medium', 'fixed',          300,  20),
  ('5e7c0000-0001-4000-8000-000000000004', 'dog_large',  'fixed',          350,  20),
  ('5e7c0000-0001-4000-8000-000000000005', 'cat',        'fixed',          250,  15),
  ('5e7c0000-0001-4000-8000-000000000005', 'dog_small',  'fixed',          250,  15),
  ('5e7c0000-0001-4000-8000-000000000005', 'dog_medium', 'fixed',          250,  15),
  ('5e7c0000-0001-4000-8000-000000000005', 'dog_large',  'fixed',          300,  20),
  ('5e7c0000-0001-4000-8000-000000000006', 'cat',        'starting_from', 1200, 120),
  ('5e7c0000-0001-4000-8000-000000000006', 'dog_small',  'starting_from', 1300, 120),
  ('5e7c0000-0001-4000-8000-000000000006', 'dog_medium', 'starting_from', 1700, 150),
  ('5e7c0000-0001-4000-8000-000000000006', 'dog_large',  'contact',       null, 180)
) as p (service_id, tier, price_type, amount, duration_min)
join public.services s on s.id = p.service_id::uuid
on conflict (service_id, tier) do nothing;

insert into public.addons (id, name, description, pet_scope, price_type, amount, duration_min, sort_order, is_demo) values
  ('5e7c0000-0002-4000-8000-000000000001', 'Pati Bakımı',
   'Pati arası tüylerin kesilmesi ve pati kremi.', 'both', 'fixed', 200, 10, 1, true),
  ('5e7c0000-0002-4000-8000-000000000002', 'Tüy Bakım Kremi',
   'Kuru ve kabarık tüyler için ek bakım kremi.', 'both', 'starting_from', 150, 10, 2, true),
  ('5e7c0000-0002-4000-8000-000000000003', 'Bandana veya Fiyonk',
   'Bakım sonrası dostunuza küçük bir aksesuar.', 'both', 'fixed', 100, 0, 3, true)
on conflict (id) do nothing;
