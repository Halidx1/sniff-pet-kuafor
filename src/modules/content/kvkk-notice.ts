// KVKK Aydınlatma Metni, versioned in the repository (ADR-012). Git history is
// the change log; `version` is what a booking will store (Could, M5).
// DRAFT: placeholders in [BRACKETS] must be filled in and the text reviewed by
// the owner, ideally with legal advice (SPEC §16). Uses the Markdown subset.

export const KVKK_NOTICE = {
  version: "2026-11-taslak-2",
  markdown: `**Bu metin bir taslaktır.** İşletme sahibi tarafından, tercihen bir hukuk danışmanıyla birlikte gözden geçirilip tamamlanmadan önce bağlayıcı değildir. Köşeli parantez içindeki bilgiler henüz doldurulmamıştır.

## Veri sorumlusu

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu: [İŞLETMENİN TİCARİ UNVANI], [ADRES]. İletişim: [E-POSTA ADRESİ], [TELEFON].

## Bu internet sitesinde hangi verileri işliyoruz?

Bu site şu anda bir form aracılığıyla kişisel veri toplamamaktadır. Bizimle telefon, WhatsApp veya Instagram üzerinden iletişime geçtiğinizde paylaştığınız bilgiler (ad, telefon numarası, mesaj içeriği, evcil hayvanınıza ilişkin bilgiler) yalnızca talebinizi yanıtlamak ve randevunuzu planlamak için kullanılır.

Siteyi ziyaret ettiğinizde, sitenin barındırıldığı hizmet sağlayıcılar tarafından güvenlik ve hizmetin çalışması amacıyla teknik kayıtlar (IP adresi, tarayıcı bilgisi, ziyaret zamanı gibi) tutulabilir.

## Üçüncü taraf hizmetler

- **Netlify** (site barındırma) ve **Supabase** (veritabanı ve görseller; Avrupa Birliği'ndeki sunucular) teknik kayıt tutabilir.
- **OpenFreeMap:** Konum haritasının görüntüleri OpenFreeMap sunucularından yüklenir; harita görüntülendiğinde bu sunucular teknik kayıt (IP adresi gibi) tutabilir. Harita çerez kullanmaz.
- **Instagram, WhatsApp ve Google Haritalar** ("Yol Tarifi Al") bağlantıları, ilgili platformların kendi gizlilik politikalarına tabidir.

Bu hizmet sağlayıcıların bir kısmının sunucuları yurt dışında bulunmaktadır. Yurt dışına veri aktarımı hususu [HUKUKİ DEĞERLENDİRME SONRASI DOLDURULACAK].

## Hukuki sebep ve saklama süresi

Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen hukuki sebeplere dayanarak ve yalnızca gerekli olduğu süre boyunca işlenir: [HUKUKİ SEBEP VE SAKLAMA SÜRESİ DOLDURULACAK].

## Haklarınız

KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, düzeltilmesini veya silinmesini isteme ve kanunda sayılan diğer haklara sahipsiniz. Başvurularınızı yukarıdaki iletişim bilgileri üzerinden iletebilirsiniz.
`,
} as const;
