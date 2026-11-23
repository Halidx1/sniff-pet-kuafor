import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requiredEnv } from "@/shared/lib/env";
import { ADMIN_COOKIE_OPTIONS } from "./admin-cookies";
import type { Database } from "./database.types";

/**
 * The signed-in admin's access (PLAN §1.4): publishable key + the session from the
 * HttpOnly cookie. RLS decides what it may read or write (`private.is_admin()` needs
 * a listed admin with 2FA). Server Components can't write cookies, so a refreshed
 * session is saved by proxy.ts or by a Server Action instead.
 */
export async function adminClient() {
  const store = await cookies();
  return createServerClient<Database>(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_PUBLISHABLE_KEY"),
    {
      cookieOptions: ADMIN_COOKIE_OPTIONS,
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list) {
              store.set(name, value, { ...options, ...ADMIN_COOKIE_OPTIONS });
            }
          } catch {
            // Called from a Server Component: proxy.ts already refreshed the session.
          }
        },
      },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    },
  );
}
