import "server-only";
import { adminClient } from "@/shared/supabase/admin-client";
import type { BusinessProfileInput } from "../schemas";

// Admin reads and writes (never cached): RLS lets only a 2FA admin through.

const EDITABLE =
  "business_name, slogan, address, maps_url, instagram_url, phone_e164, whatsapp_e164, email, latitude, longitude";

export async function getBusinessProfileForAdmin() {
  const { data, error } = await (
    await adminClient()
  )
    .from("business_profile")
    .select(EDITABLE)
    .single();
  if (error) throw new Error(`business_profile (admin): ${error.message}`);
  return data;
}

export async function updateBusinessProfile(values: BusinessProfileInput) {
  const { error } = await (
    await adminClient()
  )
    .from("business_profile")
    .update(values)
    .eq("id", true);
  if (error) throw new Error(`business_profile update: ${error.message}`);
}
