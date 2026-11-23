import type { Metadata } from "next";
import {
  BusinessProfileForm,
  getBusinessProfileForAdmin,
  saveBusinessProfile,
} from "@/modules/business";
import { requireAdmin } from "@/modules/identity";

export const metadata: Metadata = { title: "İşletme Bilgileri" };

export default async function BusinessInfoPage() {
  await requireAdmin();
  const profile = await getBusinessProfileForAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">İşletme Bilgileri</h1>
      <p className="mt-3 max-w-2xl leading-relaxed">
        Sitenin her yerinde görünen iletişim bilgileri. Boş bıraktığınız bilgiler sitede
        gösterilmez.
      </p>
      <div className="mt-8 max-w-2xl">
        <BusinessProfileForm profile={profile} action={saveBusinessProfile} />
      </div>
    </>
  );
}
