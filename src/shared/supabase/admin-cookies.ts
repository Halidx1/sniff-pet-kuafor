import type { CookieOptions } from "@supabase/ssr";

/**
 * Admin session cookies (PLAN §9, T2): HttpOnly so no script can read them, scoped to
 * /admin so public pages never even receive them, SameSite=Lax against CSRF, and Secure
 * in production (browsers also accept Secure cookies on http://localhost).
 */
export const ADMIN_COOKIE_OPTIONS: CookieOptions = {
  path: "/admin",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};
