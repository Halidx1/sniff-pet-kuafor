import { MapPin } from "lucide-react";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { ContactChannels, getBusinessProfile } from "@/modules/business";
import { Container } from "@/shared/ui/container";
import { NAV_LINKS } from "./nav";

export async function SiteFooter() {
  const profile = await getBusinessProfile();
  return (
    <footer className="bg-navy pt-14 pb-28 text-cream sm:pb-14">
      <Container className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-heading text-2xl font-extrabold">{profile.business_name}</p>
          {profile.slogan && <p className="mt-2 text-cream/85">{profile.slogan}</p>}
          <p className="mt-6 flex gap-3 leading-relaxed">
            <MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" />
            {profile.address}
          </p>
        </div>
        <nav aria-label="Alt menü">
          <ul className="space-y-2">
            {[
              { href: "/", label: "Anasayfa" },
              ...NAV_LINKS,
              { href: "/randevu-al", label: "Randevu Al" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline-offset-4 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-navy">
          <ContactChannels profile={profile} />
        </div>
      </Container>
      <Container className="mt-12 flex flex-col gap-2 border-t border-cream/20 pt-6 text-sm text-cream/85 sm:flex-row sm:justify-between">
        <p>
          © <CopyrightYear /> {profile.business_name}
        </p>
        <Link href="/kvkk" className="underline underline-offset-4">
          KVKK Aydınlatma Metni
        </Link>
      </Container>
    </footer>
  );
}

// The current year changes once a year, so it's cached instead of making every page dynamic.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().toLocaleDateString("tr-TR", { year: "numeric", timeZone: "Europe/Istanbul" });
}
