import type { Metadata } from "next";
import { requireAdmin, updatePassword } from "@/modules/identity";
import { PasswordForm } from "../../_components/auth-forms";

export const metadata: Metadata = { title: "Yeni şifre" };

// After the reset link and the 2FA code (proxy.ts asks for it first).
export default async function NewPasswordPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Yeni şifre belirleyin</h1>
      <div className="mt-6 max-w-xl rounded-2xl bg-white p-5">
        <PasswordForm action={updatePassword} />
      </div>
    </>
  );
}
