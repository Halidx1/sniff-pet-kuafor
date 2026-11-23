import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { safeAdminNext, signIn } from "@/modules/identity";
import { AuthCard } from "../../_components/auth-card";
import { SignInForm } from "../../_components/auth-forms";
import { FormMessage } from "@/shared/ui/form";

export const metadata: Metadata = { title: "Giriş" };

const NOTICES: Record<string, string> = {
  yetki: "Bu hesabın yönetim paneline erişim yetkisi yok.",
  baglanti: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeniden deneyin.",
};

export default async function SignInPage({ searchParams }: PageProps<"/admin/giris">) {
  const { next, hata } = await searchParams;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const target = safeAdminNext(next);
  return (
    <AuthCard title="Giriş yap">
      {typeof hata === "string" && NOTICES[hata] && (
        <div className="mb-5">
          <FormMessage error={NOTICES[hata]} />
        </div>
      )}
      <SignInForm
        action={signIn}
        next={target === "/admin" ? undefined : target}
        siteKey={process.env.TURNSTILE_SITE_KEY}
        nonce={nonce}
      />
      <p className="mt-6 text-center">
        <Link
          href="/admin/sifremi-unuttum"
          prefetch={false}
          className="font-semibold underline underline-offset-4"
        >
          Şifremi unuttum
        </Link>
      </p>
    </AuthCard>
  );
}
