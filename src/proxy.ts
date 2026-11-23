import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
// Pure files only (no Server Actions in the proxy bundle).
import { adminRedirect, type AdminState } from "@/modules/identity/domain/admin-flow";
import { ADMIN_COOKIE_OPTIONS } from "@/shared/supabase/admin-cookies";

// Runs in front of every /admin request (PLAN §3, ADR-006), like a servlet filter:
//  1. a fresh nonce and a strict Content-Security-Policy (T2);
//  2. refreshes the Supabase session and saves it in the /admin cookies;
//  3. first, optimistic routing: sign in → set up or enter the 2FA code → panel.
// The real check is requireAdmin() in every admin page and action, and RLS behind it.

/** Strict CSP for the admin: scripts only with this request's nonce (or loaded by them). */
export function adminCsp(nonce: string, supabaseOrigin: string, dev: boolean): string {
  const turnstile = "https://challenges.cloudflare.com";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${turnstile}${dev ? " 'unsafe-eval'" : ""}`,
    // Style attributes (e.g. progress bars) can't carry a nonce; styles can't run code.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin}`,
    "font-src 'self'",
    // Signed uploads go straight from the browser to Storage (M3 media manager).
    `connect-src 'self' ${supabaseOrigin} ${turnstile}`,
    `frame-src ${turnstile}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const url = process.env.SUPABASE_URL ?? "";
  const csp = adminCsp(
    nonce,
    url ? new URL(url).origin : "",
    process.env.NODE_ENV === "development",
  );

  // Next.js reads the nonce from the request's CSP header and puts it on its scripts.
  const pass = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    return NextResponse.next({ request: { headers } });
  };
  let response = pass();

  const supabase = createServerClient(url, process.env.SUPABASE_PUBLISHABLE_KEY ?? "", {
    cookieOptions: ADMIN_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = pass();
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, { ...options, ...ADMIN_COOKIE_OPTIONS });
        }
      },
    },
  });

  // getClaims() verifies the token and refreshes an expiring session (saved via setAll).
  const { data } = await supabase.auth.getClaims();
  let state: AdminState = "signed-out";
  if (data?.claims) {
    if (data.claims.aal === "aal2") state = "signed-in";
    else {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      state = aal?.nextLevel === "aal2" ? "needs-code" : "needs-setup";
    }
  }

  const { pathname, search } = request.nextUrl;
  const target = adminRedirect(pathname.replace(/\/$/, "") || "/admin", search, state);
  if (target) {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    response = redirect;
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
