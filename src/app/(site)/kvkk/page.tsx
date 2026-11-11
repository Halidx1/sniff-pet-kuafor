import type { Metadata } from "next";
import { KVKK_NOTICE } from "@/modules/content";
import { Container } from "@/shared/ui/container";
import { Markdown } from "@/shared/ui/markdown";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Sniff Pet Kuaför kişisel verilerin korunması aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <>
      <PageHeader title="KVKK Aydınlatma Metni" />
      <Container className="py-14 sm:py-20">
        <Markdown source={KVKK_NOTICE.markdown} className="prose-site" />
        <p className="mt-10 text-sm text-muted-text">Metin sürümü: {KVKK_NOTICE.version}</p>
      </Container>
    </>
  );
}
