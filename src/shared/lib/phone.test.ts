import { describe, expect, it } from "vitest";
import { formatPhoneTr, telHref, whatsappHref, normalizePhoneTr } from "./phone";

describe("phone helpers", () => {
  it("formats E.164 the way Turkish numbers are written", () => {
    expect(formatPhoneTr("+905321234567")).toBe("0532 123 45 67");
  });

  it("builds tel: and wa.me links", () => {
    expect(telHref("+905321234567")).toBe("tel:+905321234567");
    expect(whatsappHref("+905321234567")).toBe("https://wa.me/905321234567");
    expect(whatsappHref("+905321234567", "Merhaba, randevu almak istiyorum.")).toBe(
      "https://wa.me/905321234567?text=Merhaba%2C%20randevu%20almak%20istiyorum.",
    );
  });
});

describe("normalizePhoneTr", () => {
  it("accepts the usual ways of writing a Turkish number", () => {
    for (const input of [
      "0532 123 45 67",
      "05321234567",
      "532 123 4567",
      "5321234567",
      "+90 532 123 45 67",
      "+90 (532) 123-45-67",
      "905321234567",
      "0 532 123 45 67",
      "0312 123 45 67".replace("0312", "0532"),
    ]) {
      expect(normalizePhoneTr(input), input).toBe("+905321234567");
    }
    expect(normalizePhoneTr("0312 484 12 34")).toBe("+903124841234");
  });

  it("rejects anything that isn't one", () => {
    for (const input of [
      "",
      "532",
      "0532 123 45",
      "05321234567890",
      "+1 555 123 4567",
      "abc",
      "0032 123 45 67",
      "+90 0532 123 45 67x",
    ]) {
      expect(normalizePhoneTr(input), input).toBeNull();
    }
  });
});
