import type { Metadata } from "next";
import { getBusinessProfile } from "@/modules/business";
import { Gallery, getPublishedMedia } from "@/modules/media";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { InstagramIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Sniff Pet Kuaför'de bakımı yapılan kedi ve köpek dostlarımızdan fotoğraflar.",
};

export default async function GalleryPage() {
  const [images, profile] = await Promise.all([getPublishedMedia("gallery"), getBusinessProfile()]);
  return (
    <>
      <PageHeader title="Galeri" />
      <Container className="py-14 sm:py-20">
        {images.length > 0 ? (
          <Gallery images={images} />
        ) : (
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed">
              Bakım sonrası fotoğraflarımızı çok yakında burada paylaşacağız. O zamana kadar
              Instagram&apos;da bizi takip edebilirsiniz.
            </p>
            {profile.instagram_url && (
              <ButtonLink href={profile.instagram_url} className="mt-8">
                <InstagramIcon />
                Instagram&apos;da takip edin
              </ButtonLink>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
