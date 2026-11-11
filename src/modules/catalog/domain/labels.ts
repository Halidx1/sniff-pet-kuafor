// Turkish labels for catalog enums, in display order. No I/O.
import type { Database } from "@/shared/supabase/database.types";

type Enums = Database["public"]["Enums"];
export type PriceTier = Enums["price_tier"];
export type PriceType = Enums["price_type"];
export type ServiceCategory = Enums["service_category"];
export type PetScope = Enums["pet_scope"];

export const TIERS: { tier: PriceTier; label: string }[] = [
  { tier: "cat", label: "Kedi" },
  { tier: "dog_small", label: "Küçük Köpek" },
  { tier: "dog_medium", label: "Orta Köpek" },
  { tier: "dog_large", label: "Büyük Köpek" },
];

export const CATEGORIES: { category: ServiceCategory; label: string }[] = [
  { category: "cat_care", label: "Kedi Bakımı" },
  { category: "dog_care", label: "Köpek Bakımı" },
  { category: "general", label: "Genel Bakım" },
];

export const PET_SCOPE_LABEL: Record<PetScope, string> = {
  cat: "Kedi",
  dog: "Köpek",
  both: "Kedi ve Köpek",
};
