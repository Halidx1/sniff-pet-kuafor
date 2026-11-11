import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/shared/lib/env";
import type { Database } from "@/shared/supabase/database.types";

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/** What any visitor can do with the public (publishable) key. */
export const visitor = createClient<Database>(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_PUBLISHABLE_KEY"),
  options,
);

/** The secret key: bypasses RLS, but not the bucket's own limits. Tests only. */
export const service = createClient<Database>(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SECRET_KEY"),
  options,
);
