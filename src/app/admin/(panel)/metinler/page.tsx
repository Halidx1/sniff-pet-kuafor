import type { Metadata } from "next";
import { getSiteTextsForAdmin, saveSiteTexts, SiteTextsForm } from "@/modules/content";
import { requireAdmin } from "@/modules/identity";

export const metadata: Metadata = { title: "Metinler" };

export default async function TextsPage() {
  await requireAdmin();
  const texts = await getSiteTextsForAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Metinler</h1>
      <p className="mt-3 max-w-2xl leading-relaxed">Anasayfadaki yazılar ve Hakkımızda sayfası.</p>
      <div className="mt-8 max-w-2xl">
        <SiteTextsForm texts={texts} action={saveSiteTexts} />
      </div>
    </>
  );
}
