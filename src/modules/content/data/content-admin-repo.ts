import "server-only";
import { adminClient } from "@/shared/supabase/admin-client";
import type { SiteTextsInput } from "../schemas";

// Admin reads and writes (never cached): RLS lets only a 2FA admin through.

export async function getSiteTextsForAdmin() {
  const { data, error } = await (
    await adminClient()
  )
    .from("site_texts")
    .select("hero_title, hero_subtitle, hero_text, welcome_text, about_markdown")
    .single();
  if (error) throw new Error(`site_texts (admin): ${error.message}`);
  return data;
}

export async function updateSiteTexts(values: SiteTextsInput) {
  const { error } = await (await adminClient()).from("site_texts").update(values).eq("id", true);
  if (error) throw new Error(`site_texts update: ${error.message}`);
}
