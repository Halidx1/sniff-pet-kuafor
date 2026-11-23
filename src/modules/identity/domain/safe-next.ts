// Where to go after signing in (PLAN §9, T9: no open redirects). Only relative
// /admin paths are accepted; anything else, like "https://evil.example" or
// "//evil.example", falls back to the panel.

const ADMIN_PATH = /^\/admin(?:\/[A-Za-z0-9\-_/]*)?(?:\?[A-Za-z0-9\-_=&%.]*)?$/;
/** The sign-in steps themselves are never a destination (that would loop). */
const AUTH_STEPS = /^\/admin\/(?:giris|dogrulama|dogrulama-kurulumu|auth)(?:[/?]|$)/;

export function safeAdminNext(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!ADMIN_PATH.test(value) || value.includes("//") || AUTH_STEPS.test(value)) {
    return "/admin";
  }
  return value;
}
