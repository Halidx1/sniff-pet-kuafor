import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";

export type Service = Awaited<ReturnType<typeof getPublishedServices>>[number];
export type Addon = Awaited<ReturnType<typeof getPublishedAddons>>[number];

/**
 * Published services with their prices. RLS already hides unpublished services
 * and prices the owner hasn't confirmed (is_demo), so no filtering happens here.
 */
export async function getPublishedServices() {
  "use cache";
  cacheLife("max");
  cacheTag("catalog");
  const { data, error } = await publicClient()
    .from("services")
    .select(
      "id, name, description, category, pet_scope, image_id, service_prices(tier, price_type, amount, duration_min)",
    )
    .order("sort_order");
  if (error) throw new Error(`services: ${error.message}`);
  return data;
}

export async function getPublishedAddons() {
  "use cache";
  cacheLife("max");
  cacheTag("catalog");
  const { data, error } = await publicClient()
    .from("addons")
    .select("id, name, description, pet_scope, price_type, amount, duration_min")
    .order("sort_order");
  if (error) throw new Error(`addons: ${error.message}`);
  return data;
}
