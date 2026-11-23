"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminClient } from "@/shared/supabase/admin-client";
import { nextSignInStep, requireAdmin } from "./data/session";
import { authErrorMessage } from "./domain/auth-errors";
import { safeAdminNext } from "./domain/safe-next";
import {
  codeSchema,
  newPasswordSchema,
  resetRequestSchema,
  setupSchema,
  signInSchema,
} from "./schemas";

// Server Actions for signing in and out (SPEC §14 Access). They're public endpoints by
// nature (a sign-in form must work without a session); everything that changes an
// admin's account calls requireAdmin() first.

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

const fields = (formData: FormData) => Object.fromEntries(formData) as Record<string, string>;

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

/** Step 1: email + password (+ Turnstile token when configured). */
export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  const { email, password, captchaToken, next } = parsed.data;
  const supabase = await adminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });
  if (error) return { error: authErrorMessage(error, "sign-in") };
  // On to the 2FA step: set up the app the first time, the code every other time.
  redirect(await nextSignInStep(safeAdminNext(next)));
}

/** Step 2 (every sign-in): the 6-digit code from the authenticator app. */
export async function verifyCode(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = codeSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
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
  // A half-finished earlier attempt can't be shown again (the secret is gone): replace it.
  const { data: factors } = await supabase.auth.mfa.listFactors();
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
  const parsed = setupSchema.safeParse(fields(formData));
  if (!parsed.success) return { ...prev, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: parsed.data.factorId,
    code: parsed.data.code,
  });
  if (error) return { ...prev, fieldErrors: {}, error: authErrorMessage(error, "code") };
  redirect("/admin");
}

/** Forgot password: always the same answer, whether or not the address exists (T10). */
export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const supabase = await adminClient();
  // Supabase only sends links to addresses on its redirect allowlist, so a forged
  // Host header can't point the email somewhere else.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${proto}://${host}/admin/auth/confirm`,
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
  const parsed = newPasswordSchema.safeParse(fields(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await adminClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error, "password") };
  return { message: "Şifreniz değiştirildi." };
}

export async function signOut(): Promise<void> {
  const supabase = await adminClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/giris");
}
