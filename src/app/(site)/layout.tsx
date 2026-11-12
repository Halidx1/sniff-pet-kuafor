import { getBusinessProfile, WhatsappButton } from "@/modules/business";
import { MobileAppointmentBar, SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const profile = await getBusinessProfile();
  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-24 rounded-full bg-navy px-4 py-2 font-heading font-bold text-cream focus:translate-y-0"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <WhatsappButton number={profile.whatsapp_e164} />
      <MobileAppointmentBar />
    </>
  );
}
