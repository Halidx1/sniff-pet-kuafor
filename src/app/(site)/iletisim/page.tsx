import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import {
  ContactChannels,
  DirectionsLink,
  getBusinessProfile,
  getOpeningHours,
  LocationMap,
  OpeningHours,
} from "@/modules/business";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Sniff Pet Kuaför adres, harita ve iletişim bilgileri. Gölbaşı / Ankara.",
};

export default async function ContactPage() {
  const [profile, hours] = await Promise.all([getBusinessProfile(), getOpeningHours()]);
  return (
    <>
      <PageHeader title="İletişim" />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-2">
        <div className="space-y-10">
          <section aria-labelledby="address-heading">
            <h2 id="address-heading" className="text-2xl font-extrabold tracking-tight">
              Adres
            </h2>
            <p className="mt-4 flex max-w-md gap-3 text-lg leading-relaxed">
              <MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" />
              {profile.address}
            </p>
            <DirectionsLink
              place={{
                name: profile.business_name,
                latitude: profile.latitude,
                longitude: profile.longitude,
                mapsUrl: profile.maps_url,
              }}
              className="mt-6"
            />
          </section>
          <section aria-labelledby="channels-heading">
            <h2 id="channels-heading" className="text-2xl font-extrabold tracking-tight">
              Bize ulaşın
            </h2>
            <ContactChannels profile={profile} className="mt-4" />
          </section>
          <OpeningHours rows={hours} />
        </div>
        <LocationMap profile={profile} />
      </Container>
    </>
  );
}
