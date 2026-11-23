import type { Metadata } from "next";
import { confirmSetup, signOut, startSetup } from "@/modules/identity";
import { AuthCard } from "../../_components/auth-card";
import { SetupFlow } from "../../_components/auth-forms";

export const metadata: Metadata = { title: "İki adımlı doğrulama kurulumu" };

export default function SetupPage() {
  return (
    <AuthCard
      title="İki adımlı doğrulama"
      intro="Paneli korumak için her girişte şifrenize ek olarak telefonunuzdaki bir uygulamanın ürettiği kod istenir. Bu kurulumu bir kez yapmanız yeterli."
    >
      <SetupFlow start={startSetup} confirm={confirmSetup} />
      <form action={signOut} className="mt-6 text-center">
        <button type="submit" className="font-semibold underline underline-offset-4">
          Çıkış yap
        </button>
      </form>
    </AuthCard>
  );
}
