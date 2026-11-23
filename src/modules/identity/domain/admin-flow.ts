// The admin sign-in steps as one pure rule set, shared by proxy.ts (every request) and
// nextSignInStep() (after Server Actions, which proxy.ts doesn't see). No server-only
// imports, so the proxy can import this file directly.

/** Where a visitor is in the sign-in flow. */
export type AdminState =
  | "signed-out"
  | "needs-setup" // password ok, no 2FA app enrolled yet
  | "needs-code" // password ok, 2FA code not entered in this session
  | "signed-in"; // 2FA done (aal2)

export const SIGN_IN = "/admin/giris";
export const SETUP = "/admin/dogrulama-kurulumu";
export const CODE = "/admin/dogrulama";
/** Reachable without a session. */
const OPEN = new Set([SIGN_IN, "/admin/sifremi-unuttum"]);

/** Where to send a request for `path` (+ `search`) instead, or null to let it through. */
export function adminRedirect(path: string, search: string, state: AdminState): string | null {
  // Pages under /admin/auth/ (the email link) work in every state.
  if (path.startsWith("/admin/auth/")) return null;
  // Remember where they wanted to go, except the panel itself (the default).
  const next = path === "/admin" ? "" : `?next=${encodeURIComponent(path + search)}`;
  switch (state) {
    case "signed-out":
      return OPEN.has(path) ? null : `${SIGN_IN}${next}`;
    case "needs-setup":
      if (path === SETUP) return null;
      return OPEN.has(path) || path === CODE ? SETUP : `${SETUP}${next}`;
    case "needs-code":
      if (path === CODE) return null;
      return OPEN.has(path) || path === SETUP ? CODE : `${CODE}${next}`;
    case "signed-in":
      return path === SIGN_IN || path === SETUP || path === CODE ? "/admin" : null;
  }
}
