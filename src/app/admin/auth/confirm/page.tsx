import type { Metadata } from "next";
import { verifyEmailLink } from "@/modules/identity";
import { Button } from "@/shared/ui/button";
import { AuthCard } from "../../_components/auth-card";

export const metadata: Metadata = { title: "Bağlantıyı onayla" };

// The link in the password-reset email lands here. Opening it changes nothing: mail
// scanners open links too, and would use up the one-time token. The button does it.
export default async function ConfirmLinkPage({ searchParams }: PageProps<"/admin/auth/confirm">) {
  const { token_hash: tokenHash, type } = await searchParams;
  return (
    <AuthCard
      title="Şifre sıfırlama"
      intro="Devam etmek için aşağıdaki düğmeye basın. Ardından doğrulama uygulamanızdaki kod istenecek."
    >
      <form action={verifyEmailLink}>
        <input
          type="hidden"
          name="token_hash"
          value={typeof tokenHash === "string" ? tokenHash : ""}
        />
        <input type="hidden" name="type" value={typeof type === "string" ? type : ""} />
        <Button type="submit" className="w-full">
          Devam et
        </Button>
      </form>
    </AuthCard>
  );
}
