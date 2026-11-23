import type { Metadata } from "next";
import { requireAdmin } from "@/modules/identity";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  const admin = await requireAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Hoş geldiniz, {admin.displayName}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed">
        Buradan sitedeki bilgileri, hizmetleri ve fotoğrafları güncelleyebileceksiniz. Bölümler
        sırayla ekleniyor.
      </p>
    </>
  );
}
