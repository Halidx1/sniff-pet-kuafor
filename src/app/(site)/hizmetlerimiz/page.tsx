import type { Metadata } from "next";
import { getPublishedServices, ServiceList } from "@/modules/catalog";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/section";
import { SERVICES_FALLBACK } from "../_components/fallbacks";

export const metadata: Metadata = {
  title: "Hizmetlerimiz",
  description: "Sniff Pet Kuaför'ün Gölbaşı / Ankara'daki kedi ve köpek bakım hizmetleri.",
};

export default async function ServicesPage() {
  const services = await getPublishedServices();
  return (
    <>
      <PageHeader
        title="Hizmetlerimiz"
        intro="Kedi ve köpek dostlarımız için sunduğumuz bakım seçenekleri."
      />
      <Container className="py-14 sm:py-20">
        {services.length > 0 ? (
          <ServiceList services={services} />
        ) : (
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed">{SERVICES_FALLBACK}</p>
            <ButtonLink href="/iletisim" className="mt-8">
              Bize Ulaşın
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
