"use server";

import { redirect } from "next/navigation";
import { formValues, toFieldErrors, type FormState } from "@/shared/lib/form-state";
import { adminClient } from "@/shared/supabase/admin-client";
import { nextSignInStep, requireAdmin } from "./data/session";
import { authErrorMessage } from "./domain/auth-errors";
import { safeAdminNext } from "./domain/safe-next";
import {
  codeSchema,
  emailLinkSchema,
  newPasswordSchema,
  resetRequestSchema,
  setupSchema,
  signInSchema,
} from "./schemas";

// Server Actions for signing in and out (SPEC §14 Access). They're public endpoints by
// nature (a sign-in form must work without a session); everything that changes an
// admin's account calls requireAdmin() first.

export type { FormState } from "@/shared/lib/form-state";

/** Step 1: email + password (+ Turnstile token when configured). */
export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };
  const { email, password, captchaToken, next } = parsed.data;
  const supabase = await adminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });
  if (error) {
    // The reason, without the email or password, for the server logs (Netlify → Logs).
    console.warn(`admin sign-in failed: ${error.code ?? error.status ?? "unknown"}`);
    return { error: authErrorMessage(error, "sign-in") };
  }
  // On to the 2FA step: set up the app the first time, the code every other time.
  redirect(await nextSignInStep(safeAdminNext(next)));
}

/** Step 2 (every sign-in): the 6-digit code from the authenticator app. */
export async function verifyCode(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = codeSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) redirect("/admin/dogrulama-kurulumu");
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: parsed.data.code,
  });
  if (error) return { error: authErrorMessage(error, "code") };
  redirect(safeAdminNext(parsed.data.next));
}

export type SetupState = FormState & { factorId?: string; qr?: string; secret?: string };

/** First sign-in: create a TOTP factor and show its QR code (SPEC §14: 2FA is mandatory). */
export async function startSetup(): Promise<SetupState> {
  const supabase = await adminClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/admin/giris");
  const { data: factors } = await supabase.auth.mfa.listFactors();
  // Setup is for the first sign-in only: with an app already set up, a password alone
  // must never be enough to add another one (that would skip the owner's 2FA).
  if (factors?.totp.some((f) => f.status === "verified")) redirect("/admin/dogrulama");
  // A half-finished earlier attempt can't be shown again (the secret is gone): replace it.
  for (const old of factors?.all ?? []) {
    if (old.factor_type === "totp" && old.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: old.id });
    }
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Sniff Pet Kuaför",
    friendlyName: `Doğrulama uygulaması ${new Date().toISOString().slice(0, 16)}`,
  });
  if (error || !data) return { error: "Kurulum başlatılamadı. Sayfayı yenileyip tekrar deneyin." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

/** First sign-in: confirm the app works with one code; the session becomes aal2. */
export async function confirmSetup(prev: SetupState, formData: FormData): Promise<SetupState> {
  const parsed = setupSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ...prev, fieldErrors: toFieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.all.find((f) => f.id === parsed.data.factorId);
  // Only the unfinished factor from this setup, and never a second app.
  const hasApp = factors?.totp.some((f) => f.status === "verified");
  if (!factor || factor.status !== "unverified" || hasApp) redirect("/admin/dogrulama");
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: parsed.data.code,
  });
  if (error) return { ...prev, fieldErrors: {}, error: authErrorMessage(error, "code") };
  redirect(safeAdminNext(parsed.data.next));
}

/** Forgot password: always the same answer, whether or not the address exists (T10). */
export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  // The site's own address, fixed at build time (next.config.ts), never a request header.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.ADMIN_SITE_URL}/admin/auth/confirm`,
    captchaToken: parsed.data.captchaToken,
  });
  return {
    message:
      "Bu adres kayıtlıysa şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu (ve gereksiz klasörünü) kontrol edin.",
  };
}

/** New password, after the reset link or from Hesap. Needs a full (2FA) admin session. */
export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = newPasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error, "password") };
  return { message: "Şifreniz değiştirildi." };
}

/**
 * The email link's "Devam et" button. The one-time token is spent only on this POST,
 * not when the link is opened: mail scanners that open links would use it up.
 */
export async function verifyEmailLink(formData: FormData): Promise<void> {
  const parsed = emailLinkSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/admin/giris?hata=baglanti");
  const { token_hash, type } = parsed.data;
  const supabase = await adminClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) redirect("/admin/giris?hata=baglanti");
  // Then the 2FA code (or the first-time setup), and on to the new-password page.
  redirect(await nextSignInStep(type === "recovery" ? "/admin/sifre-yenile" : "/admin"));
}

export async function signOut(): Promise<void> {
  const supabase = await adminClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/giris");
}
