import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { requestPasswordReset } from "@/modules/identity";
import { AuthCard } from "../../_components/auth-card";
import { ResetRequestForm } from "../../_components/auth-forms";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default async function ForgotPasswordPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <AuthCard
      title="Şifremi unuttum"
      intro="E-posta adresinizi girin; yeni şifre belirlemeniz için bir bağlantı gönderelim."
    >
      <ResetRequestForm
        action={requestPasswordReset}
        siteKey={process.env.TURNSTILE_SITE_KEY}
        nonce={nonce}
      />
      <p className="mt-6 text-center">
        <Link
          href="/admin/giris"
          prefetch={false}
          className="font-semibold underline underline-offset-4"
        >
          Giriş sayfasına dön
        </Link>
      </p>
    </AuthCard>
  );
}
