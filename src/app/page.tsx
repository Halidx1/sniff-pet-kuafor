import Image from "next/image";

// Temporary "coming soon" page for M0, styled after the brand's coming-soon artwork.
// Replaced by the real homepage in M2, where contact details come from the database.
export default function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-cream px-4 py-16 text-center">
      <PawShape className="absolute top-1/2 left-1/2 -z-10 w-[min(140vw,56rem)] -translate-x-1/2 -translate-y-1/2 text-beige" />

      <h1>
        {/* unoptimized: the logo is served as-is; no image-optimisation service (ADR-008) */}
        <Image
          src="/brand/logo-interim.png"
          alt="Sniff Pet Kuaför"
          width={879}
          height={482}
          unoptimized
          preload
          className="h-auto w-[min(80vw,26rem)]"
        />
      </h1>

      <p className="mt-10 flex items-center gap-4 font-heading text-lg font-semibold tracking-[0.3em] uppercase">
        <span aria-hidden="true" className="h-px w-10 bg-navy sm:w-16" />
        Çok yakında
        <span aria-hidden="true" className="h-px w-10 bg-navy sm:w-16" />
      </p>

      <p className="mt-6 max-w-md text-lg">Kedi ve Köpek Bakımında Profesyonel Dokunuş</p>
      <p className="mt-2 font-heading font-bold tracking-wide">Gölbaşı / Ankara</p>

      <a
        href="https://www.instagram.com/sniffpetkuafor/"
        className="mt-10 rounded-full bg-navy px-6 py-3 font-heading font-semibold text-cream transition-opacity hover:opacity-90"
      >
        Instagram&apos;da takip edin
      </a>
    </main>
  );
}

function PawShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className} fill="currentColor">
      <ellipse cx="46" cy="78" rx="17" ry="24" transform="rotate(-24 46 78)" />
      <ellipse cx="82" cy="46" rx="18" ry="26" transform="rotate(-8 82 46)" />
      <ellipse cx="120" cy="46" rx="18" ry="26" transform="rotate(8 120 46)" />
      <ellipse cx="156" cy="78" rx="17" ry="24" transform="rotate(24 156 78)" />
      <path d="M101 92c-26 0-56 30-56 58 0 20 16 30 32 26 10-3 16-8 24-8s14 5 24 8c16 4 32-6 32-26 0-28-30-58-56-58z" />
    </svg>
  );
}
