import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { requireAdmin, signOut, updatePassword } from "@/modules/identity";
import { PasswordForm } from "../../_components/auth-forms";

export const metadata: Metadata = { title: "Hesap" };

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Hesap</h1>
      <dl className="mt-6 grid max-w-xl gap-3 rounded-2xl bg-white p-5">
        <div>
          <dt className="text-sm text-muted-text">Ad</dt>
          <dd className="font-semibold">{admin.displayName}</dd>
        </div>
        {admin.email && (
          <div>
            <dt className="text-sm text-muted-text">E-posta</dt>
            <dd className="font-semibold">{admin.email}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="font-semibold">İki adımlı doğrulama açık</span>
        </div>
      </dl>

      <section aria-labelledby="password-heading" className="mt-10 max-w-xl">
        <h2 id="password-heading" className="text-xl font-extrabold">
          Şifre değiştir
        </h2>
        <div className="mt-4 rounded-2xl bg-white p-5">
          <PasswordForm action={updatePassword} />
        </div>
      </section>

      <form action={signOut} className="mt-10">
        <button
          type="submit"
          className="min-h-12 rounded-full border-2 border-navy px-6 font-heading font-bold"
        >
          Çıkış yap
        </button>
      </form>
    </>
  );
}
