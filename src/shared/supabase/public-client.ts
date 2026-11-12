import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/shared/lib/env";
import type { Database } from "./database.types";

// Visitor access (the `anon` role): RLS lets it read only what the public site
// may show. No cookies and no session, so pages using it stay static and
// cacheable (PLAN §1.4, ADR-005). Server-side only: the browser never gets a
// Supabase client.
export function publicClient() {
  return createClient<Database>(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      // 'use cache' + cacheTag is our only cache (ADR-018). Next's fetch cache would also keep
      // these responses *across deploys*, so a redeploy could still show old data.
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    },
  );
}
