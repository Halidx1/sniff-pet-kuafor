import Link from "next/link";
import { PawShape } from "@/shared/ui/icons";

// Turkish 404 for any unknown URL (outside the site layout, so kept self-contained).
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-cream px-4 text-center">
      <PawShape className="absolute top-1/2 left-1/2 -z-10 w-[min(120vw,40rem)] -translate-x-1/2 -translate-y-1/2 text-beige" />
      <p className="font-heading text-7xl font-extrabold text-caramel">404</p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-4 max-w-md text-lg">Sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-heading font-bold text-cream"
      >
        Anasayfaya dön
      </Link>
    </main>
  );
}
