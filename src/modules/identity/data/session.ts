import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { adminClient } from "@/shared/supabase/admin-client";

export type Admin = { userId: string; email: string | null; displayName: string };

/**
 * The signed-in admin, or null: a valid session **with 2FA done** (aal2) for someone
 * listed in private.admins (via current_admin_name(), which applies the same rule).
 * Cached per request, like a request-scoped bean, so pages and actions can call it freely.
 */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  // Request-time only: checking the token's expiry reads the clock, which Next.js
  // refuses while prerendering.
  await connection();
  const supabase = await adminClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || claims.aal !== "aal2") return null;
  const { data: displayName, error } = await supabase.rpc("current_admin_name");
  if (error || !displayName) return null;
  return { userId: claims.sub, email: claims.email ?? null, displayName };
});

/**
 * Where a session that isn't a full admin session has to go next. Server Actions render
 * their redirect target in the same request (proxy.ts doesn't see it), so the code
 * decides this itself, with the same rules as the proxy.
 */
export async function nextSignInStep(next?: string): Promise<string> {
  await connection();
  const supabase = await adminClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return "/admin/giris";
  // Fully signed in but not on the admin list: end that session, or the sign-in page
  // would send them straight back here.
  if (claims.aal === "aal2") return "/admin/auth/cikis?hata=yetki";
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel !== "aal2") return "/admin/dogrulama-kurulumu";
  return next && next !== "/admin"
    ? `/admin/dogrulama?next=${encodeURIComponent(next)}`
    : "/admin/dogrulama";
}

/**
 * The first line of every admin page and Server Action (PLAN §9, T5): actions are
 * public HTTP endpoints, so each one checks for itself. RLS checks again in the DB.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (admin) return admin;
  redirect(await nextSignInStep());
}
