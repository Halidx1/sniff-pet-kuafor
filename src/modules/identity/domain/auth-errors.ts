// Turkish messages for Supabase Auth errors. Deliberately vague where details would
// help an attacker (T1, T10): a wrong email and a wrong password look the same.

type AuthErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

export type AuthStep = "sign-in" | "code" | "password";

export function authErrorMessage(error: AuthErrorLike, step: AuthStep): string {
  const code = error?.code ?? "";
  if (error?.status === 429 || code.includes("rate_limit") || code === "too_many_requests") {
    return "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
  }
  if (code.startsWith("captcha")) {
    return "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip tekrar deneyin.";
  }
  switch (step) {
    case "sign-in":
      // Supabase sends this only after a correct password, so it reveals nothing new.
      if (code === "email_not_confirmed") {
        return "Bu hesap henüz onaylanmamış. Geliştiriciden hesabı onaylamasını isteyin.";
      }
      return "E-posta adresi veya şifre hatalı.";
    case "code":
      if (code === "mfa_challenge_expired") return "Kodun süresi doldu. Yeni kodu girin.";
      return "Kod hatalı. Uygulamadaki güncel 6 haneli kodu girin.";
    case "password":
      if (code === "same_password") return "Yeni şifre eskisiyle aynı olamaz.";
      if (code === "weak_password")
        return "Bu şifre çok zayıf. Daha uzun ve tahmin edilmesi zor bir şifre seçin.";
      return "Şifre değiştirilemedi. Lütfen tekrar deneyin.";
  }
}
