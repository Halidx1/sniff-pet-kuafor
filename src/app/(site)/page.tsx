import { MapPin } from "lucide-react";
import { getBusinessProfile, LocationMap } from "@/modules/business";
import { getPublishedServices, ServiceList } from "@/modules/catalog";
import { getSiteTexts } from "@/modules/content";
import { getPublishedMedia, MediaImage } from "@/modules/media";
import { ButtonLink } from "@/shared/ui/button";
import { InstagramIcon } from "@/shared/ui/icons";
import { Section, SectionHeading } from "@/shared/ui/section";
import { GroomStory } from "./_components/groom-story/groom-story";
import { PawTrail } from "./_components/groom-story/paw-trail";
import { SERVICES_FALLBACK } from "./_components/fallbacks";

const STEPS = [
  "Dostunuzu seçin.",
  "İhtiyacına uygun bakım hizmetini seçin.",
  "Uygun tarih ve saat için talebinizi oluşturun.",
  "Randevu onayınızı bekleyin.",
];

export default async function HomePage() {
  const [texts, profile, services, [hero], gallery, instagram] = await Promise.all([
    getSiteTexts(),
    getBusinessProfile(),
    getPublishedServices(),
    getPublishedMedia("hero"),
    getPublishedMedia("gallery"),
    getPublishedMedia("instagram"),
  ]);

  return (
    <>
      <GroomStory texts={texts} />
      <PawTrail welcomeText={texts.welcome_text} heroImage={hero} />

      <Section tone="cream" labelledBy="services-heading">
        <SectionHeading id="services-heading" title="Dostlarımız İçin Bakım Seçenekleri" />
        <div className="mt-10">
          {services.length > 0 ? (
            <ServiceList services={services} headingLevel="h3" />
          ) : (
            <p className="max-w-2xl text-lg leading-relaxed">{SERVICES_FALLBACK}</p>
          )}
        </div>
        <ButtonLink
          href={services.length > 0 ? "/hizmetlerimiz" : "/iletisim"}
          variant="secondary"
          className="mt-10"
        >
          {services.length > 0 ? "Tüm Hizmetleri Gör" : "Bize Ulaşın"}
        </ButtonLink>
      </Section>

      <Section tone="navy" labelledBy="steps-heading">
        <SectionHeading id="steps-heading" title="Randevunuz Birkaç Adımda Hazır" />
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step} className="border-t-2 border-caramel pt-5">
              <span
                className="font-heading text-5xl font-extrabold text-caramel"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="mt-3 text-lg leading-snug">{step}</p>
            </li>
          ))}
        </ol>
        <ButtonLink href="/randevu-al" variant="light" className="mt-12">
          Randevu Al
        </ButtonLink>
      </Section>

      <Section labelledBy="gallery-heading">
        <SectionHeading id="gallery-heading" title="Bakım Sonrası Mutlu Patiler" />
        {gallery.length > 0 ? (
          <>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {gallery.slice(0, 6).map((image) => (
                <li key={image.id}>
                  <MediaImage
                    image={image}
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                </li>
              ))}
            </ul>
            <ButtonLink href="/galeri" variant="secondary" className="mt-10">
              Galeriyi Gör
            </ButtonLink>
          </>
        ) : (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            Bakım sonrası fotoğraflarımızı çok yakında burada paylaşacağız. O zamana kadar
            Instagram&apos;da bizi takip edebilirsiniz.
          </p>
        )}
      </Section>

      <Section tone="cream" labelledBy="instagram-heading">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading id="instagram-heading" title="Bizi Instagram'da Takip Edin" />
          {profile.instagram_url && (
            <ButtonLink href={profile.instagram_url} variant="secondary">
              <InstagramIcon />
              Instagram&apos;da takip edin
            </ButtonLink>
          )}
        </div>
        {instagram.length > 0 && profile.instagram_url && (
          <ul className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {instagram.slice(0, 6).map((image) => (
              <li key={image.id}>
                <a
                  href={profile.instagram_url!}
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-2xl"
                >
                  <MediaImage
                    image={image}
                    sizes="33vw"
                    className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section labelledBy="visit-heading">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading id="visit-heading" title="Bizi Ziyaret Edin" />
            <p className="mt-6 flex max-w-md gap-3 text-lg leading-relaxed">
              <MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" />
              {profile.address}
            </p>
            {profile.maps_url && (
              <ButtonLink href={profile.maps_url} className="mt-8">
                Yol Tarifi Al
              </ButtonLink>
            )}
          </div>
          <LocationMap profile={profile} />
        </div>
      </Section>

      <Section tone="cream" labelledBy="cta-heading">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="cta-heading"
            className="max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            Minik Dostunuz İçin Bir Bakım Randevusu Oluşturalım!
          </h2>
          <ButtonLink href="/randevu-al">Randevu Al</ButtonLink>
        </div>
      </Section>
    </>
  );
}
