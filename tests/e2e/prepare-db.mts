// Publishes two demo gallery photos (one cat, one dog) so the gallery filter and
// lightbox can be tested. Runs before `next build` in `npm run test:e2e` and CI.
// Local database only: it refuses any other SUPABASE_URL.
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local") && !process.env.SUPABASE_SECRET_KEY) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SECRET_KEY ?? "";
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`prepare-db only runs against the local Supabase, not ${url || "(unset)"}`);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const ids = ["3ed1a000-0001-4000-8000-000000000003", "3ed1a000-0001-4000-8000-000000000004"]; // a cat and a dog
const { data, error } = await supabase
  .from("media")
  .update({ is_published: true })
  .in("id", ids)
  .select("id");
if (error) throw new Error(error.message);
if (data.length !== 2)
  throw new Error("Demo gallery photos missing: run `npm run seed:media` first.");
console.log("E2E fixture: 2 demo gallery photos published (local DB)");
