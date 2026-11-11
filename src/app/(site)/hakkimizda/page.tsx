import type { Metadata } from "next";
import { getSiteTexts } from "@/modules/content";
import { getPublishedMedia, MediaImage } from "@/modules/media";
import { Container } from "@/shared/ui/container";
import { Markdown } from "@/shared/ui/markdown";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Gölbaşı / Ankara'da kedi ve köpekler için bakım yapan Sniff Pet Kuaför'ü tanıyın.",
};

export default async function AboutPage() {
  const [texts, [image]] = await Promise.all([getSiteTexts(), getPublishedMedia("about")]);
  return (
    <>
      <PageHeader title="Hakkımızda" />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr]">
        <Markdown source={texts.about_markdown} className="prose-site" />
        {image && (
          <MediaImage
            image={image}
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="w-full rounded-3xl object-cover"
          />
        )}
      </Container>
    </>
  );
}
