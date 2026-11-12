import type { Metadata } from "next";
import { ContactChannels, getBusinessProfile } from "@/modules/business";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Randevu Al",
  description: "Sniff Pet Kuaför'den kedi ve köpek bakımı için randevu alın.",
};

// MVP state (SPEC §12 is a "Could"): online booking arrives in M5, until then the
// page points to the channels that are set.
export default async function AppointmentPage() {
  const profile = await getBusinessProfile();
  return (
    <>
      <PageHeader
        title="Randevu Al"
        intro="Online randevu sistemimiz çok yakında hizmetinizde. Şimdilik randevu ve sorularınız için bize aşağıdaki kanallardan ulaşabilirsiniz."
      />
      <Container className="py-14 sm:py-20">
        <ContactChannels profile={profile} className="max-w-md" />
      </Container>
    </>
  );
}
