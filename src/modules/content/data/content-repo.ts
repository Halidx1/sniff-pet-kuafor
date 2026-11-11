import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";

// Public reads, cached until an admin change calls updateTag("content") (ADR-018).

export async function getSiteTexts() {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const { data, error } = await publicClient()
    .from("site_texts")
    .select("hero_title, hero_subtitle, hero_text, welcome_text, about_markdown")
    .single();
  if (error) throw new Error(`site_texts: ${error.message}`);
  return data;
}

export async function getPublishedFaq() {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const { data, error } = await publicClient()
    .from("faq_items")
    .select("id, question, answer")
    .order("sort_order");
  if (error) throw new Error(`faq_items: ${error.message}`);
  return data;
}
