import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";

export type BusinessProfile = Awaited<ReturnType<typeof getBusinessProfile>>;
export type OpeningHour = Awaited<ReturnType<typeof getOpeningHours>>[number];

export async function getBusinessProfile() {
  "use cache";
  cacheLife("max");
  cacheTag("business");
  const { data, error } = await publicClient()
    .from("business_profile")
    .select(
      "business_name, slogan, address, maps_url, map_embed_url, instagram_url, phone_e164, whatsapp_e164, email",
    )
    .single();
  if (error) throw new Error(`business_profile: ${error.message}`);
  return data;
}

export async function getOpeningHours() {
  "use cache";
  cacheLife("max");
  cacheTag("business");
  const { data, error } = await publicClient()
    .from("opening_hours")
    .select("weekday, opens_at, closes_at")
    .order("weekday")
    .order("opens_at");
  if (error) throw new Error(`opening_hours: ${error.message}`);
  return data;
}
