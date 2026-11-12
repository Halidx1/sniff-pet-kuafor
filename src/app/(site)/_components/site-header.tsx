import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui/container";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige/70 bg-sky/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="Sniff Pet Kuaför, anasayfa">
          {/* unoptimized: the logo is served as-is (ADR-008); never resized out of proportion */}
          <Image
            src="/brand/logo-interim.png"
            alt=""
            width={879}
            height={482}
            unoptimized
            preload
            className="h-11 w-auto sm:h-14"
          />
        </Link>
        <nav aria-label="Ana menü" className="flex items-center gap-2">
          <NavLinks />
          <Link
            href="/randevu-al"
            className="hidden min-h-11 items-center rounded-full bg-navy px-5 font-heading font-bold text-cream hover:bg-navy/90 sm:inline-flex"
          >
            Randevu Al
          </Link>
          <MobileMenu />
        </nav>
      </Container>
    </header>
  );
}

/** Always-reachable appointment button on phones (SPEC §7). */
export function MobileAppointmentBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-beige bg-sky/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <Link
        href="/randevu-al"
        className="flex min-h-12 items-center justify-center rounded-full bg-navy font-heading font-bold text-cream"
      >
        Randevu Al
      </Link>
    </div>
  );
}
