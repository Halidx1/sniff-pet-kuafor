import type { Metadata } from "next";
import { FaqList, getPublishedFaq } from "@/modules/content";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Sniff Pet Kuaför'de randevu ve bakım hakkında sıkça sorulan sorular.",
};

export default async function FaqPage() {
  const items = await getPublishedFaq();
  return (
    <>
      <PageHeader title="Sıkça Sorulan Sorular" />
      <Container className="py-14 sm:py-20">
        <div className="max-w-3xl">
          {items.length > 0 ? (
            <FaqList items={items} />
          ) : (
            <p className="text-lg leading-relaxed">
              Aklınıza takılan her şeyi bize telefon, WhatsApp veya Instagram üzerinden
              sorabilirsiniz.
            </p>
          )}
          <ButtonLink href="/iletisim" variant="secondary" className="mt-10">
            Bize Ulaşın
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
