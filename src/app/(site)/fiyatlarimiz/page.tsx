import type { Metadata } from "next";
import { getBusinessProfile, WHATSAPP_GREETING } from "@/modules/business";
import {
  getPublishedAddons,
  getPublishedServices,
  PriceList,
  pricedServices,
} from "@/modules/catalog";
import { whatsappHref } from "@/shared/lib/phone";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/section";
import { PRICES_FALLBACK } from "../_components/fallbacks";

export const metadata: Metadata = {
  title: "Fiyatlarımız",
  description: "Sniff Pet Kuaför kedi ve köpek bakım fiyatları.",
};

export default async function PricesPage() {
  const [services, addons, profile] = await Promise.all([
    getPublishedServices(),
    getPublishedAddons(),
    getBusinessProfile(),
  ]);
  const hasPrices = pricedServices(services).length > 0;
  // "Fiyat Bilgisi Al": WhatsApp when a number is set, otherwise the contact page (SPEC §10).
  const askHref = profile.whatsapp_e164
    ? whatsappHref(profile.whatsapp_e164, WHATSAPP_GREETING)
    : "/iletisim";

  return (
    <>
      <PageHeader title="Bakım Hizmetlerimiz ve Fiyatlarımız" />
      <Container className="py-14 sm:py-20">
        {hasPrices ? (
          <div className="max-w-3xl">
            <PriceList services={services} addons={addons} />
            <p className="mt-8 leading-relaxed text-muted-text">
              Fiyatlar dostunuzun boyutuna, tüy yapısına ve ihtiyaçlarına göre değişebilir.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed">{PRICES_FALLBACK}</p>
          </div>
        )}
        <ButtonLink href={askHref} className="mt-8">
          Fiyat Bilgisi Al
        </ButtonLink>
      </Container>
    </>
  );
}
