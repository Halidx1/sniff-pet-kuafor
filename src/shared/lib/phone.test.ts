import { describe, expect, it } from "vitest";
import { formatPhoneTr, telHref, whatsappHref } from "./phone";

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
