import { describe, expect, it } from "vitest";
import { siteTextsSchema } from "./schemas";

describe("siteTextsSchema", () => {
  const ok = {
    hero_title: "  Küçük Dostlarınız  ",
    hero_subtitle: "",
    hero_text: "Metin",
    welcome_text: "Hoş geldiniz",
    about_markdown: "## Biz\n\nMetin",
  };

  it("trims and accepts empty optional texts", () => {
    expect(siteTextsSchema.parse(ok)).toMatchObject({
      hero_title: "Küçük Dostlarınız",
      hero_subtitle: "",
    });
  });

  it("requires the headline and enforces the database limits", () => {
    const result = siteTextsSchema.safeParse({
      ...ok,
      hero_title: " ",
      hero_text: "x".repeat(401),
    });
    const byField = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(byField).toEqual({
      hero_title: "Başlık boş bırakılamaz.",
      hero_text: "Giriş metni en fazla 400 karakter olabilir.",
    });
  });
});
