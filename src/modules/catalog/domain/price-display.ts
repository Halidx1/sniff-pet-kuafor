// How prices read on the public site (SPEC §10). No I/O.
import { ablativeSuffix, formatDuration, formatTry } from "@/shared/lib/format";
import { CATEGORIES, TIERS, type PriceTier, type PriceType, type ServiceCategory } from "./labels";

type Price = { price_type: PriceType; amount: number | null };
type TierPrice = Price & { tier: PriceTier; duration_min: number | null };

const FORMATTERS: Record<PriceType, (amount: number) => string> = {
  fixed: (amount) => formatTry(amount),
  starting_from: (amount) => `${formatTry(amount)}${ablativeSuffix(amount)} başlayan`,
  contact: () => "Fiyat için iletişime geçin",
};

export function priceLabel({ price_type, amount }: Price): string {
  return FORMATTERS[price_type](amount ?? 0);
}

/** The service's prices in tier order, each with its readable price and duration. */
export function tierRows(prices: TierPrice[]) {
  return TIERS.flatMap(({ tier, label }) => {
    const price = prices.find((p) => p.tier === tier);
    if (!price) return [];
    return [
      {
        tier,
        label,
        price: priceLabel(price),
        duration: price.duration_min ? formatDuration(price.duration_min) : null,
      },
    ];
  });
}

/** Services grouped under the three SPEC §9 headings, skipping empty groups. */
export function groupByCategory<T extends { category: ServiceCategory }>(services: T[]) {
  return CATEGORIES.map(({ category, label }) => ({
    category,
    label,
    services: services.filter((s) => s.category === category),
  })).filter((group) => group.services.length > 0);
}
