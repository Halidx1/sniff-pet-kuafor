-- content: homepage texts from SPEC §8. The welcome and About texts are general
-- drafts with no invented history or credentials; the owner reviews them.
insert into public.site_texts (hero_title, hero_subtitle, hero_text, welcome_text, about_markdown)
values (
  'Küçük Dostlarınız, Büyük Bir Özeni Hak Ediyor!',
  'Kedi ve Köpek Bakımında Profesyonel Dokunuş.',
  'Minik dostlarınızın bakım ihtiyaçları için özenli, sevgi dolu ve profesyonel bir yaklaşım.',
  'Sniff Pet Kuaför, Gölbaşı / Ankara''da kedi ve köpekler için bakım hizmeti sunar. Minik dostlarınızın temiz, rahat ve mutlu hissetmesi için her bakımı sevgiyle ve özenle yapıyoruz. Dostunuzun ihtiyaçlarını sizinle konuşarak ona en uygun bakımı birlikte belirliyoruz.',
  E'Sniff Pet Kuaför''de kedi ve köpek dostlarımızın bakımını sevgiyle ve özenle yapıyoruz.\n\nHer dostumuzun karakteri, tüy yapısı ve ihtiyaçları farklıdır. Bu yüzden bakımdan önce sizi dinliyor, dostunuz için en uygun bakımı birlikte belirliyoruz.\n\nAmacımız, dostunuzun bakım sırasında kendini güvende ve rahat hissetmesi, bakım sonrasında da tertemiz ve mutlu bir şekilde size kavuşmasıdır.\n\nRandevu ve sorularınız için bizimle iletişime geçebilirsiniz.'
)
on conflict (id) do nothing;

-- FAQ drafts (SPEC §11): unpublished demo rows whose answers are placeholders
-- telling the owner what to write.
insert into public.faq_items (id, question, answer, sort_order, is_demo) values
  ('5f0e6a1c-0001-4000-8000-000000000001', 'Randevu nasıl alabilirim?',
   'DEMO — İşletme tarafından yazılacak: randevu kanalları (telefon, WhatsApp, Instagram) ve randevunun nasıl onaylandığı.', 1, true),
  ('5f0e6a1c-0001-4000-8000-000000000002', 'Bakıma gelirken yanımda ne getirmeliyim?',
   'DEMO — İşletme tarafından yazılacak: örneğin aşı karnesi, tasma veya varsa özel bakım ürünleri.', 2, true),
  ('5f0e6a1c-0001-4000-8000-000000000003', 'Bakım ne kadar sürer?',
   'DEMO — İşletme tarafından yazılacak: hizmete ve dostunuzun boyutuna göre tahmini süreler.', 3, true),
  ('5f0e6a1c-0001-4000-8000-000000000004', 'Aşı veya sağlık şartı var mı?',
   'DEMO — İşletme tarafından yazılacak: aşı ve sağlık koşulları.', 4, true),
  ('5f0e6a1c-0001-4000-8000-000000000005', 'Randevumu iptal etmek veya değiştirmek istersem ne yapmalıyım?',
   'DEMO — İşletme tarafından yazılacak: iptal ve değişiklik koşulları.', 5, true)
on conflict (id) do nothing;
