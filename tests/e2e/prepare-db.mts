// Checks that the demo gallery (the shop's Instagram photos, published by
// `npm run seed:media`) is in the local database before the E2E build, so the
// gallery tests fail with a clear message instead of an empty page.
// Runs before `next build` in `npm run test:e2e` and CI. Local database only.
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local") && !process.env.SUPABASE_SECRET_KEY) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SECRET_KEY ?? "";
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`prepare-db only runs against the local Supabase, not ${url || "(unset)"}`);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { count, error } = await supabase
  .from("media")
  .select("id", { count: "exact", head: true })
  .eq("kind", "gallery")
  .eq("is_published", true)
  .not("group_id", "is", null);
if (error) throw new Error(error.message);
if (!count) throw new Error("Demo gallery missing: run `npm run seed:media` first.");
console.log(`E2E fixture: ${count} published gallery photos in groups (local DB)`);
