import type { EmailOtpType } from "@supabase/supabase-js";
import { connection, NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/shared/supabase/admin-client";

// The link in the password-reset email lands here (PLAN §3). It checks the one-time
// token and, if valid, sets the session cookie under /admin. proxy.ts then asks for
// the 2FA code before the new-password page opens.

const TYPES = new Set<EmailOtpType>(["recovery", "email", "invite", "magiclink"]);

export async function GET(request: NextRequest) {
  await connection();
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!tokenHash || !type || !TYPES.has(type)) return to("/admin/giris?hata=baglanti");
  const supabase = await adminClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return to("/admin/giris?hata=baglanti");
  return to(type === "recovery" ? "/admin/sifre-yenile" : "/admin");
}
