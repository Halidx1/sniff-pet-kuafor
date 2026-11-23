import type { Metadata } from "next";
import { safeAdminNext, signOut, verifyCode } from "@/modules/identity";
import { AuthCard } from "../../_components/auth-card";
import { CodeForm } from "../../_components/auth-forms";

export const metadata: Metadata = { title: "Doğrulama kodu" };

export default async function CodePage({ searchParams }: PageProps<"/admin/dogrulama">) {
  const { next } = await searchParams;
  const target = safeAdminNext(next);
  return (
    <AuthCard
      title="Doğrulama kodu"
      intro="Telefonunuzdaki doğrulama uygulamasını açın ve Sniff Pet Kuaför için gösterilen 6 haneli kodu girin."
    >
      <CodeForm action={verifyCode} next={target} />
      <form action={signOut} className="mt-6 text-center">
        <button type="submit" className="font-semibold underline underline-offset-4">
          Farklı bir hesapla giriş yap
        </button>
      </form>
      <p className="mt-4 text-sm text-muted-text">
        Telefonunuzu kaybettiyseniz geliştiriciye haber verin; doğrulamayı sıfırlayabilir.
      </p>
    </AuthCard>
  );
}
