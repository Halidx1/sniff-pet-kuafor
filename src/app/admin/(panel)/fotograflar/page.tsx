import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/modules/identity";
import { MediaManager, type ManagedKind } from "@/modules/media";

export const metadata: Metadata = { title: "Fotoğraflar" };

/** One tab per list; the URL keeps the tab (?tur=…) so a refresh stays put. */
const TABS: { slug: string; kind: ManagedKind; label: string }[] = [
  { slug: "galeri", kind: "gallery", label: "Galeri" },
  { slug: "anasayfa", kind: "hero", label: "Anasayfa fotoğrafı" },
  { slug: "hakkimizda", kind: "about", label: "Hakkımızda" },
  { slug: "instagram", kind: "instagram", label: "Instagram" },
];

export default async function PhotosPage({ searchParams }: PageProps<"/admin/fotograflar">) {
  await requireAdmin();
  const { tur, hata } = await searchParams;
  const tab = TABS.find((t) => t.slug === tur) ?? TABS[0]!;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Fotoğraflar</h1>
      <nav aria-label="Fotoğraf listeleri" className="mt-6 overflow-x-auto">
        <ul className="flex gap-2">
          {TABS.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/admin/fotograflar?tur=${t.slug}`}
                prefetch={false}
                aria-current={t === tab ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-4 font-heading font-bold whitespace-nowrap aria-[current=page]:bg-navy aria-[current=page]:text-cream"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">
        <MediaManager kind={tab.kind} error={typeof hata === "string" ? hata : undefined} />
      </div>
    </>
  );
}
