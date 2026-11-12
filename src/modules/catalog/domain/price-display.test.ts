import { describe, expect, it } from "vitest";
import { groupByCategory, priceLabel, tierRows } from "./price-display";

describe("priceLabel", () => {
  it("formats each price type the SPEC §10 way", () => {
    expect(priceLabel({ price_type: "fixed", amount: 250 })).toBe("₺250");
    expect(priceLabel({ price_type: "starting_from", amount: 1250 })).toBe("₺1.250'den başlayan");
    expect(priceLabel({ price_type: "starting_from", amount: 340 })).toBe("₺340'tan başlayan");
    expect(priceLabel({ price_type: "contact", amount: null })).toBe("Fiyat için iletişime geçin");
  });
});

describe("tierRows", () => {
  it("orders tiers Kedi → Büyük Köpek, skips missing tiers and formats durations", () => {
    const rows = tierRows([
      { tier: "dog_large", price_type: "contact", amount: null, duration_min: 180 },
      { tier: "cat", price_type: "fixed", amount: 600, duration_min: 60 },
      { tier: "dog_small", price_type: "fixed", amount: 700, duration_min: null },
    ]);
    expect(rows).toEqual([
      { tier: "cat", label: "Kedi", price: "₺600", duration: "1 saat" },
      { tier: "dog_small", label: "Küçük Köpek", price: "₺700", duration: null },
      {
        tier: "dog_large",
        label: "Büyük Köpek",
        price: "Fiyat için iletişime geçin",
        duration: "3 saat",
      },
    ]);
  });
});

describe("groupByCategory", () => {
  it("uses the SPEC §9 order and drops empty groups", () => {
    const groups = groupByCategory([
      { id: "a", category: "general" as const },
      { id: "b", category: "cat_care" as const },
    ]);
    expect(groups.map((g) => g.label)).toEqual(["Kedi Bakımı", "Genel Bakım"]);
    expect(groups[0]!.services.map((s) => s.id)).toEqual(["b"]);
  });
});
